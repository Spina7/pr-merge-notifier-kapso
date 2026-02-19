# gh-merge-notifier

A microservice that:
1. Receives webhook calls from GitHub Actions when a PR is merged
2. Uses Google Gemini API to translate and summarize the PR body into a concise 2-3 sentence Spanish summary
3. Sends a WhatsApp notification to a configurable list of team members via the Kapso SDK (@kapso/whatsapp-cloud-api)
4. Persists every PR event in a SQLite database for manager metrics and historical tracking
5. Exposes a REST metrics API for managers to query activity data

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Configure Environment:**
    Create a `.env` file with your keys:
    ```bash
    GEMINI_API_KEY=your_gemini_api_key_here
    KAPSO_API_KEY=your_kapso_api_key_here
    WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here
    PORT=3000
    TEAM_PHONES=+1234567890,+0987654321
    ```
3.  **Build & Start:**
    ```bash
    npm run build
    npm start
    ```
4.  **Simulate Webhook (Testing):**
    While the server is running, use the provided script to simulate a GitHub merge event:
    ```bash
    npx tsx scripts/test-webhook.ts
    ```
5.  **View Metrics:**
    ```bash
    curl http://localhost:3000/metrics
    ```
