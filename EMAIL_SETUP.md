# Email Signup Setup Guide

This guide will help you connect the signup form to Google Sheets via Vercel serverless functions.

## Overview

The form submission flow:
1. User fills out name + email on the landing page
2. Form submits to `/api/subscribe` (Vercel serverless function)
3. Function validates data and writes to Google Sheets
4. You can view submissions in real-time and export to Mailchimp later

---

## Step 1: Create Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "eighty° Email Signups"
4. Add headers in row 1:
   - **A1**: `Timestamp`
   - **B1**: `Name`
   - **C1**: `Email`
5. Copy the **Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
   Save this ID - you'll need it later.

---

## Step 2: Create Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Name it "eighty-sheets-writer" (or similar)
   - Click "Create and Continue"
   - Skip roles (click "Continue")
   - Click "Done"

5. Create a JSON Key:
   - Click on your new service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose "JSON"
   - Download the file (keep it safe!)

6. From the downloaded JSON file, you need:
   - `client_email` (looks like: `your-account@project-id.iam.gserviceaccount.com`)
   - `private_key` (long string starting with `-----BEGIN PRIVATE KEY-----`)

---

## Step 3: Share Google Sheet with Service Account

1. Open your Google Sheet
2. Click "Share" button (top right)
3. Paste the `client_email` from your JSON file
4. Give it "Editor" permissions
5. Uncheck "Notify people" (it's a service account, not a person)
6. Click "Share"

---

## Step 4: Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click "Settings" > "Environment Variables"
3. Add these three variables:

   **GOOGLE_SHEETS_SPREADSHEET_ID**
   - Value: The spreadsheet ID from Step 1
   - Environments: Production, Preview, Development

   **GOOGLE_SHEETS_CLIENT_EMAIL**
   - Value: The `client_email` from your JSON file
   - Environments: Production, Preview, Development

   **GOOGLE_SHEETS_PRIVATE_KEY**
   - Value: The `private_key` from your JSON file
   - **IMPORTANT**: Paste the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
   - Environments: Production, Preview, Development

4. Click "Save" for each variable

---

## Step 5: Deploy to Vercel

1. Commit all changes:
   ```bash
   git add .
   git commit -m "Add email signup with Google Sheets integration"
   git push
   ```

2. Vercel will automatically deploy

3. Once deployed, test the form on your production URL

---

## Testing Locally (Optional)

To test the serverless function locally:

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Link your project:
   ```bash
   vercel link
   ```

3. Pull environment variables:
   ```bash
   vercel env pull .env.local
   ```

4. Run local dev server:
   ```bash
   vercel dev
   ```

5. Visit `http://localhost:3000` and test the form

---

## Viewing Submissions

Simply open your Google Sheet - new submissions will appear in real-time!

Each row will contain:
- **Timestamp**: When the form was submitted (ISO format)
- **Name**: User's name
- **Email**: User's email address

---

## Exporting to Mailchimp

When you're ready to move to Mailchimp:

1. In Google Sheets, select all data
2. File > Download > Comma Separated Values (.csv)
3. In Mailchimp:
   - Go to Audience > Manage contacts > Import contacts
   - Upload the CSV
   - Map columns: Name → First Name, Email → Email Address
   - Complete import

---

## Security Notes

✓ **Good**: API credentials are stored in Vercel environment variables (never in code)
✓ **Good**: Service account has access only to the specific sheet you shared
✓ **Good**: Client-side validation prevents bad data
✓ **Good**: Server-side validation in the API function

⚠️ **Consider adding**: Rate limiting if you get spammed (Vercel has built-in protection)
⚠️ **Consider adding**: CAPTCHA if you see bot submissions (hCaptcha or reCAPTCHA)

---

## Troubleshooting

**"Server configuration error"**
- Check that all 3 environment variables are set in Vercel
- Redeploy after adding environment variables

**"Failed to save subscription"**
- Check that the service account email is shared with the sheet
- Verify the spreadsheet ID is correct
- Check Vercel function logs for detailed errors

**"403 Forbidden" in logs**
- The service account doesn't have access to the sheet
- Re-share the sheet with the service account email

**"Invalid email format"**
- Client-side validation is working correctly
- User needs to enter a valid email

---

## Next Steps

Once you have email submissions flowing:

1. Set up welcome email automation in Mailchimp
2. Create email templates for launch announcement
3. Segment users by signup date
4. Plan pre-launch engagement campaign

---

**Questions?** Check the Vercel function logs in your Vercel dashboard under "Deployments" > [Your deployment] > "Functions" tab.
