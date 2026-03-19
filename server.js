/**
 * Aegis — Real-time WhatsApp Web safety demo
 *
 * HOW TO RUN:
 * 1. npm install
 * 2. Fill in .env (set EMAIL_ENABLED=false for testing)
 * 3. node server.js — it will print both URLs automatically
 * 4. Laptop opens the printed localhost URL
 * 5. Phone opens the printed phone URL (same WiFi required)
 * 6. Set EMAIL_ENABLED=true before the actual demo
 *
 * DEMO SCRIPT:
 * Step 1 — SAFE:    "Good luck on the test tomorrow! 😊"
 * Step 2 — MILD:    "You're actually so annoying sometimes"
 * Step 3 — MILD:    "nobody even likes talking to you"
 * Step 4 — SEVERE:  "you should just disappear, nobody wants you here"
 * (3rd mild triggers escalation → auto-promotes to severe)
 * Pause and say: "This is where traditional systems fail.
 * Aegis doesn't just read one message — it reads the pattern."
 */

const path = require('path');
const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();

// AUTO IP DETECTION — add this at the top and log it on startup:
const os = require('os');
const ip =
  Object.values(os.networkInterfaces())
    .flat()
    .find((i) => i && i.family === 'IPv4' && !i.internal)?.address || 'localhost';
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🖥️  LAPTOP (receiver): http://localhost:3000');
console.log(`📱  PHONE (sender):    http://${ip}:3000/mobile.html`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const { analyzeMessage } = require('./lib/claude');
const { sendAlert } = require('./lib/mailer');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const ROOM = 'aegis-chat';

// SERVER STATE (in memory):
let incidents = [];
let recentMessages = []; // for pattern detection
let mildCountPerSender = {}; // track mild count per sender

// Screenshot request correlation: incidentId -> { resolve, timeout }
const pendingScreenshots = new Map();

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function requestDesktopScreenshot(incidentId) {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      pendingScreenshots.delete(incidentId);
      resolve(null);
    }, 3000);

    pendingScreenshots.set(incidentId, { resolve, timeout });
    io.to(ROOM).emit('take_screenshot', { incidentId });
  });
}

io.on('connection', (socket) => {
  socket.join(ROOM);

  // Sync current incidents to late joiners for a clean demo
  socket.emit('incidents_update', incidents);

  socket.on('typing', () => {
    socket.to(ROOM).emit('show_typing');
  });

  socket.on('stop_typing', () => {
    socket.to(ROOM).emit('hide_typing');
  });

  socket.on('screenshot_ready', (payload) => {
    if (!payload || !payload.incidentId) return;
    const entry = pendingScreenshots.get(payload.incidentId);
    if (!entry) return;
    clearTimeout(entry.timeout);
    pendingScreenshots.delete(payload.incidentId);
    entry.resolve(payload.imageData || null);
  });

  socket.on('send_message', async (data) => {
    const text = (data?.text || '').toString();
    const sender = (data?.sender || 'Unknown').toString();
    if (!text.trim()) return;

    io.to(ROOM).emit('scanning');

    const messageReceivedTime = Date.now();

    recentMessages.push({ text, sender, time: messageReceivedTime });
    recentMessages = recentMessages.filter((m) => messageReceivedTime - m.time <= 60_000);

    await sleep(1500);

    let result = await analyzeMessage(text, recentMessages, sender);
    if (!result || typeof result !== 'object') {
      result = { severity: 'safe', score: 0, reason: 'unknown error', parent_message: '' };
    }

    let severity = result.severity;
    let score = typeof result.score === 'number' ? result.score : 0;
    let reason = result.reason || '';
    let parent_message = result.parent_message || '';

    // Apply escalation logic
    if (!mildCountPerSender[sender]) mildCountPerSender[sender] = 0;
    if (severity === 'mild') {
      mildCountPerSender[sender] += 1;
      if (mildCountPerSender[sender] >= 3) {
        severity = 'severe';
        reason = 'Repeated mild harassment detected — escalated by Aegis';
      }
    }
    if (severity === 'severe') {
      mildCountPerSender[sender] = 0;
    }

    const interventionTime = Date.now() - messageReceivedTime;

    const incident = {
      id: Date.now(),
      sender,
      text,
      severity,
      score,
      reason,
      time: messageReceivedTime,
      interventionTime,
      screenshotCaptured: false
    };
    incidents.unshift(incident);

    if (severity === 'safe') {
      io.to(ROOM).emit('message', { text, sender, severity: 'safe', score });
    } else if (severity === 'mild') {
      io.to(ROOM).emit('message', { text, sender, severity: 'mild', score, reason });
    } else {
      const incidentId = incident.id;

      io.to(ROOM).emit('message_blocked', {
        text,
        sender,
        reason,
        parent_message,
        interventionTime,
        incidentId
      });

      let imageData = null;
      try {
        imageData = await requestDesktopScreenshot(incidentId);
      } catch {
        imageData = null;
      }

      if (imageData) {
        incident.screenshotCaptured = true;
      }

      if ((process.env.EMAIL_ENABLED || '').toLowerCase() === 'true') {
        try {
          await sendAlert(sender, text, reason, parent_message, imageData || undefined);
        } catch {
          // sendAlert should never throw, but keep demo stable regardless
        }
      }
    }

    io.to(ROOM).emit('incidents_update', incidents);
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/demo-config', (_req, res) => {
  const anthropicKeyPresent = !!(process.env.ANTHROPIC_API_KEY || '').trim();
  const emailEnabled = (process.env.EMAIL_ENABLED || '').toLowerCase() === 'true';
  const emailUserPresent = !!(process.env.EMAIL_USER || '').trim();
  const emailPassPresent = !!(process.env.EMAIL_PASS || '').trim();
  const parentEmailPresent = !!(process.env.PARENT_EMAIL || '').trim();

  res.json({
    anthropicKeyPresent,
    emailEnabled,
    emailUserPresent,
    emailPassPresent,
    parentEmailPresent,
    emailReady: emailUserPresent && emailPassPresent && parentEmailPresent
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  // log already printed above; keep startup quiet
});

