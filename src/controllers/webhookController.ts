import { Request, Response } from 'express';
import { summarizePR } from '../services/gemini.js';
import { sendWhatsAppNotification } from '../services/whatsapp.js';
import { insertPrEvent } from '../db/index.js';
import { GitHubPREvent } from '../types/index.js';

export const handleGithubWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const payload = req.body as GitHubPREvent;

    if (!payload.pull_request) {
      console.log('Received non-PR event');
      res.status(200).send('Ignored');
      return;
    }

    // We only care about merged PRs
    if (payload.action === 'closed' && payload.pull_request.merged) {
      const pr = payload.pull_request;
      const repoName = payload.repository.full_name;
      const author = pr.user.login;
      const mergedBy = pr.merged_by?.login ?? author;
      const additions = pr.additions ?? 0;
      const deletions = pr.deletions ?? 0;
      const title = pr.title;
      const body = pr.body || '';

      console.log(`Processing merged PR #${pr.number} in ${repoName} by ${author}`);

      // 1. Generate Summary (Spanish)
      const summary = await summarizePR(title, body);

      // 2. Persist to DB
      insertPrEvent({
        pr_id: pr.number,
        repo_name: repoName,
        author: author,
        title: title,
        summary: summary
      });

      // 3. Send WhatsApp Notification
      const message = `🔀 *PR Mergeado: ${repoName}* 👤 Autor: ${author} ✅ Mergeado por: ${mergedBy} 📄 Título: ${title} ➕ ${additions} líneas añadidas  ➖ ${deletions} eliminadas 📝 Resumen: ${summary} 🔗 ${pr.html_url}`;
      await sendWhatsAppNotification(message);

      console.log('Processed successfully.');
    } else {
      console.log(`Ignored event: ${payload.action} (merged: ${payload.pull_request?.merged})`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Internal Server Error');
  }
};
