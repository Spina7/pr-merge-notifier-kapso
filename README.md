# GitHub PR Merge Notifier -> WhatsApp 🚀

A complete microservice that listens for GitHub Pull Request merges, summarizes the changes in Spanish using Google's Gemini AI, and broadcasts the summary to your team via WhatsApp using the Kapso SDK. It also tracks all events in a local SQLite database for metrics.

---

## 📖 Table of Contents
1. [Architecture overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Environment Configuration](#3-environment-configuration)
4. [Step 1: Deploying the Microservice (Docker)](#4-step-1-deploying-the-microservice-docker)
5. [Step 2: Connecting Target Repositories (GitHub Actions)](#5-step-2-connecting-target-repositories)
6. [Automating Deployment of this Service (CI/CD)](#6-automating-deployment-of-this-service-cicd)
7. [Testing & Verification](#7-testing--verification)

---

## 1. Architecture overview

This system consists of two parts:
1. **The Target Repositories:** The repositories you want to monitor. They use a GitHub Action to send a webhook payload whenever a PR is merged.
2. **This Microservice:** A Node.js API (running on port `8743` by default) that receives the webhook, asks Gemini to summarize the PR body, sends WhatsApp messages via Kapso, and logs the event to a SQLite database.

---

## 2. Prerequisites

To deploy this application, you will need:
- A server (VPS, EC2, DigitalOcean Droplet, etc.) with **Docker** and **Docker Compose** installed.
- A **Google Gemini API Key** (from Google AI Studio).
- A **Kapso API Key** and your **WhatsApp Phone Number ID** (from your Kapso dashboard/Meta dashboard).
- The list of phone numbers (with country codes, e.g., `+523325242838`) of the team members who should receive the notifications.

---

## 3. Environment Configuration

In the root of this project (on your server), create a `.env` file:

```bash
# .env

# Port the application will run on (Default: 8743)
PORT=8743

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Kapso / WhatsApp API
KAPSO_API_KEY=your_kapso_api_key_here
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id_here

# Comma-separated list of team phone numbers to notify
TEAM_PHONES=+1234567890,+0987654321
```

---

## 4. Step 1: Deploying the Microservice (Docker)

Deploying with Docker Compose is highly recommended because it encapsulates the Node.js environment and automatically handles restarting the app if the server reboots.

1. **Clone the repository** on your server:
   ```bash
   git clone <your-repo-url> pr-merge-notifier
   cd pr-merge-notifier
   ```
2. **Create the `.env` file** as described in Section 3.
3. **Build and start the container** in detached mode:
   ```bash
   docker compose up -d --build
   ```
4. **Verify it is running**:
   ```bash
   docker compose logs -f
   # You should see: "gh-merge-notifier listening at http://localhost:8743"
   ```

*Note: The SQLite database is automatically persisted to a local `./data` folder on your server thanks to the Docker volume mapping.*

---

## 5. Step 2: Connecting Target Repositories

Once your microservice is running and accessible via a public IP or Domain (e.g., `https://api.yourdomain.com`), you need to tell your *other* GitHub repositories to send PR data to it.

1. Go to the GitHub repository you want to monitor.
2. Navigate to **Settings > Secrets and variables > Actions**.
3. Create a **New repository secret**:
   - **Name:** `PR_NOTIFIER_WEBHOOK_URL`
   - **Value:** `http://YOUR_SERVER_IP_OR_DOMAIN:8743/webhook/github`
4. In that same repository, copy the provided template workflow into `.github/workflows/notify-merge.yml`:

```yaml
# .github/workflows/notify-merge.yml
name: Notify PR Merge to Microservice

on:
  pull_request:
    types:
      - closed

jobs:
  notify:
    # Only run if the PR was actually merged (not just closed/rejected)
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest

    steps:
      - name: Send Webhook Payload
        run: |
          curl -X POST \
            -H "Content-Type: application/json" \
            -d '${{ toJSON(github.event) }}' \
            ${{ secrets.PR_NOTIFIER_WEBHOOK_URL }}
```
*Now, every time a PR is merged in that repo, GitHub Actions will securely hit your microservice.*

---

## 6. Automating Deployment of this Service (CI/CD)

If you make changes to *this* microservice's code and want it to automatically deploy to your server, a GitHub Action is already provided in `.github/workflows/deploy.yml`.

To enable it:
1. Add the following **Secrets** to this repository in GitHub:
   - `SERVER_HOST`: The IP address of your VPS.
   - `SERVER_USER`: The SSH username (e.g., `root` or `ubuntu`).
   - `SSH_PRIVATE_KEY`: An SSH private key authorized to access the server.
2. Uncomment the `appleboy/ssh-action` step in `.github/workflows/deploy.yml` and adjust the `cd /path/to/app` command to match where you cloned the app on your server.

Whenever you push to the `main` branch, GitHub will SSH into your server, pull the latest code, and restart the Docker container with zero downtime.

---

## 7. Testing & Verification

### Local Simulation
To test the flow without actually merging a PR on GitHub, you can use the built-in simulation script. 

While the server is running (either locally or via Docker), run:
```bash
npm install # if not installed locally
npx tsx scripts/test-webhook.ts
```
This will send a mock payload to the local endpoint (`http://localhost:8743/webhook/github`).

### Check Metrics
To verify the application is successfully saving events to the database, you can query the metrics REST endpoint:
```bash
curl -s http://localhost:8743/metrics
```
This returns a JSON array of all processed Pull Request events, including the PR ID, author, and the Gemini-generated summary.