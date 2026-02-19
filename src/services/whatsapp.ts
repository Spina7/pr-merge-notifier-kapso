import { WhatsAppClient } from '@kapso/whatsapp-cloud-api';
import dotenv from 'dotenv';

dotenv.config();

// Initialize the WhatsApp client
// Using the default baseUrl provided in the documentation
const client = new WhatsAppClient({
  baseUrl: 'https://api.kapso.ai/meta/whatsapp',
  kapsoApiKey: process.env.KAPSO_API_KEY || ''
});

// Configurable team list (could be env var or DB)
const TEAM_PHONES = process.env.TEAM_PHONES ? process.env.TEAM_PHONES.split(',') : [];
// This ID should be set in your .env file
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';

export async function sendWhatsAppNotification(message: string): Promise<void> {
  if (!process.env.KAPSO_API_KEY) {
    console.warn("KAPSO_API_KEY is not set. Skipping WhatsApp notification (Mock Mode).");
    console.log(`[Mock] Would send: "${message}" to ${TEAM_PHONES.length} recipients.`);
    return;
  }

  if (!PHONE_NUMBER_ID) {
    console.warn("WHATSAPP_PHONE_NUMBER_ID is not set. Cannot send notification.");
    return;
  }

  console.log(`Sending WhatsApp message to ${TEAM_PHONES.length} recipients...`);

  for (const phone of TEAM_PHONES) {
    const cleanPhone = phone.trim();
    if (!cleanPhone) continue;

    try {
      await client.messages.sendText({
        phoneNumberId: PHONE_NUMBER_ID,
        to: cleanPhone,
        body: message
      });
      console.log(`-> Sent to ${cleanPhone}`);
    } catch (error) {
      console.error(`Failed to send to ${cleanPhone}:`, error);
    }
  }
}
