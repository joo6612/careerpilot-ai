# CareerPilot AI 🚀
### *AI-Powered Career Operating System for Students and Professionals*

CareerPilot AI is an advanced, full-stack intelligence platform designed to guide users through career discovery, skill assessment, resume building, and personalized mentorship. Built for the **Kaggle Gen AI Hackathon**, it combines state-of-the-art Generative AI models with a modular backend and interactive frontend to create a complete career readiness workspace.

---

## 🔗 Project Links
* **Live Demo:** [Placeholder for Demo URL](https://careerpilot-demo-url-placeholder)
* **Demo Video:** [Placeholder for YouTube URL](https://youtube-video-url-placeholder)
* **Kaggle Competition Writeup:** [Placeholder for Kaggle Writeup](https://kaggle-writeup-url-placeholder)

---

## 🌟 Key Features
- **AI Career Mentor:** Interactive AI advisor for real-time career guidance, skill evaluation, and roadmap planning.
- **Smart Skill Assessment:** Interactive quizzes and evaluation modules to test readiness for targeted career paths.
- **Dynamic Learning Roadmaps:** Tailored milestone-based learning paths with resources, project ideas, and progress tracking.
- **Career Matching Engine:** Recommends optimal career paths based on user profiles, skill levels, and preferences.
- **Resume Builder & Vault:** A secure repository to draft, review, and optimize resumes for targeted roles.
- **Demo Mode:** Fully functional mock/local mode for testing without requiring live API keys or database connections.

---

## 🛠️ Tech Stack
* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Lucide React icons.
* **Backend:** Node.js, Express, TypeScript, Nodemon.
* **AI Orchestration:** Google Generative AI (`@google/generative-ai`) and OpenRouter API (`openai` client wrapper).
* **Database & Auth:** Firebase Admin SDK (Production) / Local File-Based JSON DB Fallback (Development & Demo mode).

---

## 🧠 AI Architecture
CareerPilot AI is built on a highly resilient **AI Foundation Layer** designed for maximum uptime and cost efficiency:
1. **Primary Provider (OpenRouter):** Defaults to high-capacity, low-latency API models (e.g., Gemini 2.5 Flash, Claude 3.5 Sonnet) routed via OpenRouter.
2. **Resilient Fallback System (Gemini API):** If the primary API experiences rate limits, failures, or network timeouts, the backend automatically fails over to a secondary pool of Gemini API keys configured locally.
3. **Key Rotation & Load Balancing:** Support for multiple Gemini API keys (`GEMINI_API_KEY_1` to `GEMINI_API_KEY_4`) which are rotated and loaded dynamically to handle heavy query volumes during hackathon evaluations.

---

## 🖥️ Screen Mockups & Interface
*(Screenshots will be uploaded here to display the application dashboards, mentor chat, and roadmaps)*

---

## 🛠️ Local Installation & Setup

Follow these instructions to run CareerPilot AI on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v20 or higher recommended)
- `npm` (packaged with Node.js)

### Project Layout
This project is structured as a monorepo:
- `/frontend`: Client application (React + Vite)
- `/backend`: Server API (Node.js + Express)

---

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Copy the `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Open the `.env` file and fill in your keys:
   - **`PORT`**: Set to `5000` (default)
   - **`OPENROUTER_API_KEY`**: Your OpenRouter API token.
   - **`GEMINI_API_KEY_1` to `GEMINI_API_KEY_4`**: Gemini keys for failover routing.
   - **`BYPASS_AUTH`**: Set to `true` to run without Firebase authentication in a mock/offline state.
4. Run in development mode:
   ```bash
   npm run dev
   ```
   The backend API will be available at `http://localhost:5000/api`.

---

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Copy the `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Configure the client settings:
   - **`VITE_API_URL`**: Set to `http://localhost:5000/api` (points to the local backend).
   - Firebase Web App Config (Optional, only needed if not using demo mode): `VITE_FIREBASE_API_KEY`, etc.
4. Start the development server:
   ```bash
   npm run dev
   ```
   The application will start on `http://localhost:5173`.

---

## 🧪 Demo Mode (No Database / Auth Required)
For easier evaluation and local testing:
1. In `backend/.env`, set `BYPASS_AUTH=true`.
2. Delete or don't provide `config/serviceAccountKey.json` inside the backend.
3. The server will automatically spin up a local JSON file-based database at `backend/data/db.json` and authenticate mock users. No database setup or Firebase credentials are required to fully evaluate the app!

---

## 📜 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
