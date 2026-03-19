<div align="center">
  <h1>🛡️ Aegis-AI</h1>
  <p><strong>A Real-Time AI Safety Overlay for Modern Messaging</strong></p>

  [![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![Express.js](https://img.shields.io/badge/Express.js-Backend-black.svg?style=for-the-badge&logo=express)](https://expressjs.com/)
  [![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-blue.svg?style=for-the-badge&logo=socket.io)](https://socket.io/)
  [![Anthropic](https://img.shields.io/badge/AI-Claude_3-purple.svg?style=for-the-badge)](https://anthropic.com/)
</div>

<br />

> **Aegis-AI** goes beyond traditional keyword filters. By leveraging Anthropic's Claude framework, this system detects intent, behavioral patterns, and multi-message escalations to protect users (especially children) from cyberbullying and harassment in real-time.

---

## ✨ Key Features

*   **🧠 Contextual AI Analysis**: Analyzes the deepest intent of messages, understanding context, sarcasm, and nuanced aggression.
*   **📈 Pattern Recognition**: Not just single-message tracking. Repeated "mild" offenses are flagged and automatically escalated to "severe" status.
*   **⚡ Real-Time Intervention**: Messages are blocked split-second before reaching the recipient's screen via bi-directional `Socket.io` sockets.
*   **📸 Automated Evidence Capture**: Requests and saves instant desktop screenshots upon the detection of severe harassment.
*   **📧 Escalation Alerts**: Parents/Admins receive immediate email alerts via `nodemailer` with exactly what was said, the reason it was blocked, and the screenshot capturing the context.

---

## 🏗️ Architecture

Aegis functions as a dual-interface demonstration:
1.  **💻 Desktop Interface (`index.html`)**: Acts as the receiving WhatsApp Web clone.
2.  **📱 Mobile Interface (`mobile.html`)**: Acts as the sender's messaging app.

Both connect concurrently to the Node.js backend which proxies all communications through the Claude AI middleware before relaying. 

---

## 🛠️ Technology Stack

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Backend Core** | Node.js & Express | Lightweight backend infrastructure |
| **WebSocket** | Socket.io | Real-time bi-directional event-based communication |
| **AI Engine** | Anthropic / Claude SDK | Determines safety viability & score of incoming text |
| **Alerts** | Nodemailer | Handles parent/admin email dispatch sequences |
| **Frontend** | Vanilla JS/HTML/CSS | No-build zero-dependency UI for immediate serving |

---

## 🚀 Getting Started

### 1. Installation

Clone this repository and install the initial node dependencies:
```bash
git clone https://github.com/Sadiq-Kolakar/Aegis-AI.git
cd Aegis-AI
npm install
```

### 2. Environment Setup
Create a `.env` file at the root of the project to safely store your keys.

```env
# AI Integration
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Email Alert Configuration (Optional for local testing)
EMAIL_ENABLED=true 
EMAIL_USER=your_sending_email@gmail.com
EMAIL_PASS=your_app_password
PARENT_EMAIL=parent_or_admin_email@domain.com

# Server Settings
PORT=3000
```

### 3. Launch the Server

Run the development server. The terminal will automatically display the exact URLs you need to access.
```bash
npm start
```

*   **Laptop (Receiver)**: Open `http://localhost:3000`
*   **Phone (Sender)**: Open the local IP URL formatted as `http://<your-ip>:3000/mobile.html`

*(Ensure both your computer and your mobile device are on the same Wi-Fi network to communicate properly.)*

---

## 🎭 Demo Script Walkthrough

To see Aegis pattern detection work its magic, try simulating this conversation from your Phone to the Desktop:

1.  **🟢 SAFE**: `"Good luck on the test tomorrow! 😊"`
2.  **🟡 MILD**: `"You're actually so annoying sometimes"`
3.  **🟡 MILD**: `"nobody even likes talking to you"`
4.  **🔴 SEVERE**: `"you should just disappear, nobody wants you here"`
> *Wait, watch what happens at Step 3! Because it's the repeated mild offense, Aegis-AI recognizes the sustained pattern and automatically promotes it to a severe intervention block!*

---

<div align="center">
  <i>Concept Demo Engineered for Real-Time Safety & Protection</i>
</div>
