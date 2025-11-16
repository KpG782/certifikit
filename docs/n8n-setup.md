# n8n Email Queue Workflow Setup

This guide explains how to set up an n8n workflow to automatically send certificates from the PostgreSQL email queue.

## 🎯 Overview

The workflow will:

1. **Read** pending emails from PostgreSQL database every minute
2. **Send** emails via Gmail/SMTP with certificate attachments
3. **Update** status in database (sent/failed)
4. **Track** errors and retry failed emails

---

## 📋 Workflow Structure

```
┌─────────────────────────────────────────────────────┐
│  1. Schedule Trigger (Every 1 minute)               │
└──────────────────┬──────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────┐
│  2. PostgreSQL - Get Pending Emails                 │
│     SELECT * FROM email_queue                       │
│     WHERE status = 'pending'                        │
│     LIMIT 10                                        │
└──────────────────┬──────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────┐
│  3. Code Node - Process Certificate Images          │
│     - Convert base64 to Buffer                      │
│     - Build HTML email with custom styling          │
│     - Prepare attachments                           │
└──────────────────┬──────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────┐
│  4. Gmail Node - Send Email                         │
│     - Send HTML email with certificate              │
│     - Handle errors                                 │
└──────────────────┬──────────────────────────────────┘
                   │
                   v
┌─────────────────────────────────────────────────────┐
│  5. HTTP Request - Update Status                    │
│     POST http://your-app/api/update-status          │
│     { id, status: "sent", sentAt }                  │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Step-by-Step Setup

### **Step 1: Schedule Trigger**

1. Add **Schedule Trigger** node
2. Set to run **Every 1 minute**
3. Or use **Cron Expression**: `*/1 * * * *`

---

### **Step 2: PostgreSQL - Get Pending Emails**

1. Add **Postgres** node
2. **Operation**: Execute Query
3. **Query**:

```sql
SELECT
  id,
  recipient_email,
  recipient_name,
  subject,
  message,
  certificate_image,
  status,
  created_at
FROM email_queue
WHERE status = 'pending'
ORDER BY created_at ASC
LIMIT 10;
```

4. **Connection Details**:
   - Host: `66.181.46.58`
   - Port: `5432`
   - Database: `certificate_queue`
   - User: `cert_admin`
   - Password: `YourSecurePassword123!`

---

### **Step 3: Code Node - Process Certificates**

1. Add **Code** node
2. Paste this code:

```javascript
// Get all items from previous node
const items = $input.all();

// Custom Color Palette
const colors = {
  primary: {
    main: "#0D74CE",
    light: "#1E88E5",
    dark: "#0A5BA3",
    gradient: "linear-gradient(135deg, #0D74CE 0%, #1E88E5 100%)",
  },
  accent: {
    main: "#D18B00",
    light: "#E6A523",
    gradient: "linear-gradient(135deg, #D18B00 0%, #E6A523 100%)",
  },
  neutral: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    600: "#4B5563",
    700: "#374151",
    900: "#111827",
  },
};

// Process each email
for (const item of items) {
  // Get certificate image (base64 string)
  let base64Data = item.json.certificate_image;

  // Remove data URL prefix if exists
  if (base64Data.startsWith("data:")) {
    base64Data = base64Data.split(",")[1];
  }

  // Convert to Buffer
  const buffer = Buffer.from(base64Data, "base64");

  // Add binary data for Gmail attachment
  item.binary = {
    certificate: {
      data: buffer.toString("base64"),
      mimeType: "image/png",
      fileName: `Certificate_${item.json.recipient_name.replace(
        /\s+/g,
        "_"
      )}.png`,
    },
  };

  // Build HTML email with custom styling
  const recipientName = item.json.recipient_name;
  const message = item.json.message;
  const currentYear = new Date().getFullYear();

  const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate Delivery - Your Organization</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: ${colors.neutral[700]};
      background: ${colors.neutral[50]};
      padding: 20px;
    }
    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: ${colors.primary.gradient};
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin: 10px 0 0 0;
    }
    .content { padding: 40px 30px; background: #ffffff; }
    .greeting { font-size: 20px; font-weight: 600; margin-bottom: 20px; }
    .message-box {
      background: ${colors.neutral[50]};
      border-left: 4px solid ${colors.primary.main};
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      white-space: pre-line;
      line-height: 1.8;
    }
    .attachment-card {
      background: ${colors.accent.gradient};
      color: #ffffff;
      padding: 20px;
      border-radius: 12px;
      margin: 30px 0;
      text-align: center;
      box-shadow: 0 4px 12px rgba(209, 139, 0, 0.2);
    }
    .footer {
      background: ${colors.neutral[900]};
      color: #ffffff;
      padding: 30px;
      text-align: center;
    }
    .footer-info {
      font-size: 13px;
      color: ${colors.neutral[200]};
      margin-top: 20px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div style="font-size: 48px; margin-bottom: 10px;">🎓</div>
      <h1>Certificate Delivery</h1>
      <p>Your Organization Certificate System</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${recipientName}! 👋</div>
      <div class="message-box">${message}</div>
      
      <div class="attachment-card">
        <div style="font-size: 40px; margin-bottom: 10px;">📎</div>
        <h3>Your Certificate is Attached</h3>
        <p>Download the PNG file attached to this email</p>
      </div>
      
      <p style="text-align: center; color: ${colors.neutral[600]};">
        <strong>Need assistance?</strong><br>
        Our support team is here to help you 24/7
      </p>
    </div>
    
    <div class="footer">
      <div style="font-size: 24px; font-weight: 700; margin-bottom: 15px;">
        YOUR ORGANIZATION
      </div>
      <div class="footer-info">
        This is an automated message from Your Organization Certificate System.<br>
        Please do not reply directly to this email.<br><br>
        © ${currentYear} Your Organization. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
  `;

  // Store HTML in item
  item.json.html_message = htmlEmail;
}

return items;
```

---

### **Step 4: Gmail Node - Send Email**

1. Add **Gmail** node
2. **Resource**: Message
3. **Operation**: Send
4. **Settings**:
   - **To**: `{{ $json.recipient_email }}`
   - **Subject**: `{{ $json.subject }}`
   - **Email Type**: HTML
   - **Message**: `{{ $json.html_message }}`
   - **Attachments**: `certificate`
   - **BCC**: (optional) Your monitoring email

**OR use SMTP Node:**

1. Add **Send Email** (SMTP) node
2. Configure your SMTP settings
3. Same field mappings as Gmail

---

### **Step 5: HTTP Request - Update Status (Success)**

1. Add **HTTP Request** node after Gmail
2. Connect to Gmail's **Success** output
3. **Method**: POST
4. **URL**: `http://YOUR_APP_URL/api/update-status`
5. **Body**:

```json
{
  "id": {{ $json.id }},
  "status": "sent",
  "sentAt": "{{ $now.toISO() }}"
}
```

6. **Headers**:
   - `Content-Type`: `application/json`

---

### **Step 6: HTTP Request - Update Status (Error)**

1. Add another **HTTP Request** node
2. Connect to Gmail's **Error** output
3. **Method**: POST
4. **URL**: `http://YOUR_APP_URL/api/update-status`
5. **Body**:

```json
{
  "id": {{ $json.id }},
  "status": "failed",
  "errorMessage": "{{ $json.error.message }}"
}
```

---

## 🔐 Security Considerations

1. **Use n8n Credentials** - Store database and email credentials in n8n's credential manager
2. **HTTPS** - Use HTTPS for your app URL
3. **Rate Limiting** - Limit emails per minute to avoid Gmail rate limits
4. **Error Handling** - Implement retry logic for failed emails

---

## 📊 Monitoring

### **Check Email Queue Status**

1. Go to: `http://your-app/email-queue`
2. See real-time status updates (refreshes every 5 seconds)
3. Monitor sent/pending/failed counts

### **n8n Webhook for Status**

You can also expose a webhook endpoint in n8n:

**URL**: `https://n8n.kenbuilds.tech/webhook/certificate-email-api`

**Request**:

```bash
POST https://n8n.kenbuilds.tech/webhook/certificate-email-api
Content-Type: application/json

{
  "id": 123,
  "status": "sent"
}
```

---

## 🐛 Troubleshooting

### **Emails not sending?**

- Check PostgreSQL connection
- Verify Gmail credentials
- Check email queue has pending items

### **Status not updating?**

- Verify app URL in HTTP Request node
- Check API endpoint is accessible
- Look at n8n execution logs

### **Images not attaching?**

- Ensure base64 data is valid
- Check buffer conversion in Code node
- Verify binary data format

---

## ✅ Testing

1. **Add test email to queue** from certificate generator
2. **Wait 1 minute** for n8n to trigger
3. **Check email** in recipient inbox
4. **Verify status** updated to "sent" in Email Queue page
5. **View logs** in n8n execution history

---

## 📧 Support

Need help? Check:

- n8n execution logs
- PostgreSQL query results
- Email Queue page for errors
- Browser console for API errors

Happy automating! 🚀
