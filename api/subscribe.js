// ─── Vercel Serverless Function: Form Submission to Google Sheets ──────────
// Writes name + email to a Google Sheet via the Google Sheets API.
//
// Setup required:
// 1. Create a Google Cloud project
// 2. Enable Google Sheets API
// 3. Create a Service Account and download JSON key
// 4. Share your Google Sheet with the service account email
// 5. Add environment variables to Vercel:
//    - GOOGLE_SHEETS_PRIVATE_KEY (from JSON key)
//    - GOOGLE_SHEETS_CLIENT_EMAIL (from JSON key)
//    - GOOGLE_SHEETS_SPREADSHEET_ID (from sheet URL)

import { google } from 'googleapis';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email } = req.body;

    // Validate input
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Get environment variables
    const {
      GOOGLE_SHEETS_PRIVATE_KEY,
      GOOGLE_SHEETS_CLIENT_EMAIL,
      GOOGLE_SHEETS_SPREADSHEET_ID,
    } = process.env;

    if (!GOOGLE_SHEETS_PRIVATE_KEY || !GOOGLE_SHEETS_CLIENT_EMAIL || !GOOGLE_SHEETS_SPREADSHEET_ID) {
      console.error('Missing required environment variables');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Initialize Google Sheets API
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: GOOGLE_SHEETS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    // Append data to sheet
    const timestamp = new Date().toISOString();
    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_SPREADSHEET_ID,
      range: 'Sheet1!A:C', // Writes to columns A, B, C (Timestamp, Name, Email)
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[timestamp, name, email]],
      },
    });

    console.log(`[eighty°] Subscribed: ${email}`);

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('[eighty°] Subscription error:', error);
    return res.status(500).json({ error: 'Failed to save subscription' });
  }
}
