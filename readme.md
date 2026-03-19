# 🛡️ Aegis — Real-time WhatsApp Web Safety Demo

> A production-quality live hackathon demo: a WhatsApp Web clone where **every message is moderated by Claude AI before delivery**. Severe messages are blocked and can trigger a **parent email alert** with an **automatic chat screenshot**.


---

## What is Aegis?

Aegis is a real-time chat platform that uses Claude AI to analyze every message before it is delivered. When a harmful message is detected, it is blocked instantly and the parent or guardian receives an automated email alert — complete with the reason, AI-generated guidance, and a screenshot of the chat at the time of the incident.

Traditional tools rely on keyword filters. Aegis understands **context, tone, sarcasm, and patterns** — the way a trained human counselor would.

---

## Demo Setup

```
Your Phone  ──►  Node.js Server  ──►  Claude AI  ──►  Decision
                      │                                    │
               Laptop Screen                        Parent Email
              (Judges watch)                    (Live alert + screenshot)
```

- **Laptop** opens the receiver view — judges watch messages arrive in real time
- **Phone** opens the sender view — you type from your phone during the demo
- Both must be on the **same WiFi network**

---

## 30‑Second Quick Start (Hackathon Mode)

```bash
cd aegis-demo
npm install
node server.js
```

Then:
- **Laptop**: open `http://localhost:3000`
- **Phone** (same Wi‑Fi): open the printed `http://<your-ip>:3000/mobile.html`
- On desktop, check the **Demo Setup** card in the right panel (it warns if Claude/email aren’t configured)

---

## Features

- **Real-time messaging** between two devices via Socket.IO
- **Claude AI analysis** of every message before delivery — understands context, not just keywords
- **Three severity levels** — Safe, Mild, Severe with different responses for each
- **Pattern detection** — sends last 5 messages as context to Claude
- **Escalation logic** — 3 mild messages in 60 seconds automatically escalates to severe
- **Toxicity score (0–100)** shown in the incident monitor
- **Live status badge** — Safe Zone → Monitoring Behavior → Intervention Mode
- **Skeleton loader** during AI analysis — makes the 1.5s delay feel intentional
- **Typing indicator** — shows "Kajal is typing..." just like real WhatsApp
- **Screenshot capture** — when severe, takes a screenshot of the chat and attaches it to the parent email
- **Parent email** — includes blocked message, AI reason, guidance, action buttons, and chat screenshot
- **Incident Monitor panel** — live sidebar showing all flagged messages with safety score gauge
- **Auto IP detection** — server prints the phone URL automatically on startup
- **Email toggle** — `EMAIL_ENABLED=false` for testing, flip to `true` for demo
- **Demo Setup checklist (desktop)** — shows if `ANTHROPIC_API_KEY` / email variables are present (booleans only; secrets never displayed)

---

## Project Structure

```
aegis-demo/
├── server.js              Main server — Socket.IO, routing, escalation logic
├── .env                   API keys and config (never commit this)
├── package.json
├── lib/
│   ├── claude.js          Claude AI detection logic
│   └── mailer.js          Nodemailer email + screenshot attachment
└── public/
    ├── index.html         Desktop receiver view (WhatsApp Web clone)
    └── mobile.html        Mobile sender view (opened on phone)
```

---

## Installation

```bash
# 1. Clone or unzip the project
cd aegis-demo

# 2. Install dependencies
npm install

# 3. Fill in your .env file (see below)

# 4. Start the server
npm start
```

---

## Environment Variables

Create a `.env` file in the root folder:

```env
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxx
EMAIL_USER=yourgmail@gmail.com
EMAIL_PASS=your_gmail_app_password
PARENT_EMAIL=parents_email@gmail.com
EMAIL_ENABLED=false
```

> Set `EMAIL_ENABLED=true` only during the actual demo — keeps your inbox clean during testing.

### Security warning (important)
- **Never commit** your real `.env` (it contains secrets).
- If you accidentally pasted real keys into `.env`, rotate them before sharing the repo or zipping it.

### Getting your Anthropic API Key
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Click **Get API Keys** → **Create Key**
3. Copy it — you only see it once

### Getting your Gmail App Password
1. Go to [myaccount.google.com](https://myaccount.google.com) → Security
2. Enable **2-Step Verification** if not already on
3. Search for **App Passwords** → Create one named `Aegis`
4. Copy the 16-character password (no spaces) into `EMAIL_PASS`

---

## Running the Demo

```bash
npm start
```

The server will print:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖥️  LAPTOP (receiver): http://localhost:3000
📱  PHONE (sender):    http://192.168.x.x:3000/mobile.html
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

1. Open the **laptop URL** in Chrome on your laptop — judges watch this
2. Open the **phone URL** in Chrome on your phone
3. Start the demo script below

---

## Demo Script

Follow this exact sequence for maximum impact:

| Step | Message to send | Expected result |
|------|----------------|-----------------|
| 1 | `"Good luck on the test tomorrow! 😊"` | 🟢 Safe — delivered normally |
| 2 | `"You're actually so annoying sometimes"` | 🟡 Mild — yellow badge appears |
| 3 | `"nobody even likes talking to you"` | 🟡 Mild — monitoring behavior |
| 4 | `"you should just disappear, nobody wants you here"` | 🔴 Severe — blocked + email + screenshot |

After Step 4, say to judges:

> *"Traditional systems would have passed all of these. Aegis read the pattern across three messages and escalated automatically. The parent received this email in real time — with a screenshot of exactly what their child was seeing."*

---

## How Aegis Detects Bullying

Every message goes through this pipeline:

```
Message received
      │
   1.5s delay  ←── psychological effect (feels like AI working)
      │
Claude AI analyzes:
  - Latest message
  - Last 5 messages for context/pattern
      │
Returns JSON:
  { severity, score, reason, parent_message }
      │
Escalation check:
  3 mild messages from the same sender → auto-upgrade to severe
      │
   ┌──┴──┐───────┐
 SAFE   MILD  SEVERE
   │      │      │
Deliver  Flag  Block
         ⚠️    + Email
               + Screenshot
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML + Tailwind CSS |
| Real-time | Socket.IO |
| Backend | Node.js + Express |
| AI Engine | Claude Haiku (Anthropic) |
| Screenshot | html2canvas |
| Email | Nodemailer (Gmail SMTP) |

---

## Troubleshooting (demo savers)

### Phone can’t open the URL
- Ensure **phone + laptop are on the same Wi‑Fi** (not guest Wi‑Fi).
- Use the exact phone URL printed by the server (auto-detected IP).
- On Windows, allow Node through the firewall for **Private networks** when prompted.

### Port 3000 is already in use
- Close any other app using 3000, or run with a different port:

```bash
$env:PORT=3001; node server.js
```

Then open `http://localhost:3001` and `http://<ip>:3001/mobile.html`.

### Emails don’t send
- Confirm `EMAIL_ENABLED=true` and `EMAIL_USER`, `EMAIL_PASS`, `PARENT_EMAIL` are set.
- Gmail requires an **App Password** (normal password won’t work if 2FA is enabled).
- Check the desktop **Demo Setup** card — it flags missing email variables instantly.

### Claude moderation always returns “safe”
- `ANTHROPIC_API_KEY` is missing or invalid.
- The desktop **Demo Setup** card will show “Claude API Key: MISSING” if it’s not set.

---

## Future Roadmap

- **Phase 2** — Chrome extension for WhatsApp Web and Instagram Web (DOM reading, same AI backend)
- **Phase 3** — Mobile app with native Android monitoring

---

> *Aegis shifts cyberbullying response from reactive to proactive — students are safer, parents are informed, schools can intervene early.*"# blah" 
"# Aegis-AI" 
