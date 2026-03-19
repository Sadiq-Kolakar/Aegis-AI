const Anthropic = require('@anthropic-ai/sdk');

function safeNumber(n, fallback = 0) {
  const x = Number(n);
  return Number.isFinite(x) ? x : fallback;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Export async function analyzeMessage(text, recentMessages)
 */
async function analyzeMessage(text, recentMessages, sender = 'Unknown') {
  const apiKey = process.env.ANTHROPIC_API_KEY || '';
  if (!apiKey.trim()) {
    return {
      severity: 'safe',
      score: 0,
      reason: 'ANTHROPIC_API_KEY missing',
      parent_message: ''
    };
  }

  const context = (recentMessages || [])
    .slice(-5)
    .map((m) => `${m.sender}: ${m.text}`)
    .join('\n');

  const client = new Anthropic({ apiKey });

  try {
    const resp = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      temperature: 0,
      system:
        'You are Aegis, a school chat safety AI. You detect cyberbullying by analyzing message context and patterns. Always respond in valid JSON only.',
      messages: [
        {
          role: 'user',
          content: `Analyze this message for cyberbullying. Consider the conversation history.

Conversation history (last 5 messages):
${context || '(none)'}

Latest message from ${sender}: '${text}'

Respond ONLY in this JSON format with no extra text:
{
  severity: 'safe' or 'mild' or 'severe',
  score: number between 0 and 100 (0=completely safe, 100=extremely harmful),
  reason: 'one sentence explanation',
  parent_message: 'two sentence plain English alert written for a parent'
}`
        }
      ]
    });

    const raw =
      resp?.content?.map((c) => (typeof c?.text === 'string' ? c.text : '')).join('') || '';

    // JSON SAFETY NET:
    const cleaned = raw.replace(/```json|```/g, '').trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      return { severity: 'safe', score: 0, reason: 'parse error', parent_message: '' };
    }

    const severity =
      parsed?.severity === 'mild' || parsed?.severity === 'severe' ? parsed.severity : 'safe';
    const score = clamp(safeNumber(parsed?.score, 0), 0, 100);
    const reason = typeof parsed?.reason === 'string' ? parsed.reason : '';
    const parent_message = typeof parsed?.parent_message === 'string' ? parsed.parent_message : '';

    return { severity, score, reason, parent_message };
  } catch (e) {
    return {
      severity: 'safe',
      score: 0,
      reason: 'Claude API error',
      parent_message: ''
    };
  }
}

module.exports = { analyzeMessage };

