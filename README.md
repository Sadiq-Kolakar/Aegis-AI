# Aegis-AI: Real-time WhatsApp Web Safety Demo

Aegis-AI is a powerful demonstration of a real-time safety system built on top of a WhatsApp Web-like interface. It utilizes Anthropic's Claude API to intelligently analyze incoming messages for harassment, toxic behavior, and bullying, going beyond simple keyword matching to understand context and behavioral patterns.

## Features

- **Contextual AI Analysis:** Uses the Claude API (`@anthropic-ai/sdk`) to analyze the intent and severity of messages in real-time.
- **Pattern Recognition Escalation:** Detects when a sender repeatedly sends "mild" harassing messages and automatically escalates the threat level to "severe".
- **Real-time Synchronization:** Built with Express and Socket.io for immediate message delivery and status updates between the "mobile" sender and the "desktop" receiver.
- **Parental/Admin Email Alerts:** Integrates `nodemailer` to send automated email alerts including message content, context, context reasons, and optionally a screenshot.
- **Desktop Screenshot Capture:** Can request and capture a screenshot of the desktop interface when a severe incident occurs.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Real-time Communication:** Socket.io
- **AI Integration:** Anthropic AI API
- **Email Delivery:** Nodemailer
- **Frontend:** HTML, CSS, JavaScript (Vanilla)

## How It Works

The demo involves two interfaces:
1. **Laptop (Receiver):** Simulates the WhatsApp Web interface (`index.html`).
2. **Phone (Sender):** Simulates the mobile interface for sending messages (`mobile.html`).

When a message is sent from the phone, the server analyzes it using Claude. If a message is deemed "severe" (or escalated due to patterns), the message is blocked on the receiver's end, and an alert (with an optional screenshot) can be dispatched via email.

## Setup & Running the Demo

1. **Clone the repository** (if you haven't already).
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   Create a `.env` file in the root directory and add the necessary variables:
   ```env
   ANTHROPIC_API_KEY=your_anthropic_api_key
   EMAIL_ENABLED=false # Set to true to enable email sending
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password
   PARENT_EMAIL=parent@example.com
   PORT=3000
   ```
4. **Start the Server:**
   ```bash
   npm start
   ```
5. **Access the Interfaces:**
   - The server will print the URLs to the console.
   - Open the **Laptop (Receiver)** URL on your computer (e.g., `http://localhost:3000`).
   - Open the **Phone (Sender)** URL on a mobile device connected to the same network (e.g., `http://<your-ip-address>:3000/mobile.html`).

## Demo Script Example

1. **SAFE:** "Good luck on the test tomorrow! 😊"
2. **MILD:** "You're actually so annoying sometimes"
3. **MILD:** "nobody even likes talking to you"
4. **SEVERE:** "you should just disappear, nobody wants you here"

*(Note: The 3rd mild message triggers the escalation logic and auto-promotes the incident to severe.)*

This demonstrates how Aegis reads the pattern, not just individual messages, succeeding where traditional keyword-based systems might fail.
