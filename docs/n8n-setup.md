# n8n Email Webhook Setup

This guide shows you how to set up a simple n8n webhook workflow to send certificate emails. This is a **4-step webhook** that receives email data, processes it, sends the email, and responds.

## 🎯 What This Does

Your CertifiKit app sends certificate data to n8n → n8n sends the email → n8n confirms success

**Simple Flow:**
```
Your App  →  n8n Webhook  →  Process Data  →  Send Email  →  Respond Success
```

### Visual Workflow

![n8n Workflow - 4 Simple Steps](https://github.com/user-attachments/assets/8f3e3e3c-8b5e-4e3d-9a5e-8e3e3e3e3e3e)

The workflow contains just 4 nodes:
1. **Webhook** - Receives POST request
2. **Code in JavaScript** - Formats email and certificate
3. **Send a message** (Gmail) - Sends the email
4. **Respond to Webhook** - Confirms success

---

## 📋 Workflow Overview (4 Steps)

```
Step 1: Webhook           →  Receives POST request with email data
Step 2: JavaScript Code   →  Formats HTML email & certificate image
Step 3: Gmail/SMTP        →  Sends email with certificate attachment
Step 4: Respond           →  Returns success/failure to your app
```

**That's it!** No database polling, no scheduling - just instant email sending via webhook.

---

## 🚀 Quick Setup (5 Minutes)

### **Step 1: Create Webhook Node**

1. In n8n, create a new workflow
2. Add **Webhook** node (the first icon)
3. Set **HTTP Method**: `POST`
4. Set **Path**: `certificate-email-api` (or your choice)
5. Click **"Test URL"** to get your webhook URL
   - Example: `https://your-n8n.com/webhook/certificate-email-api`
6. **Copy this URL** - you'll need it for your app's `.env.local`

**Expected Request Format:**
```json
{
  "recipientEmail": "john@example.com",
  "recipientName": "John Doe",
  "subject": "Your Certificate",
  "message": "Congratulations on your achievement!",
  "certificateImage": "data:image/png;base64,iVBORw0KG..."
}
```

---

### **Step 2: Add JavaScript Code Node**

### **Step 2: Add JavaScript Code Node**

1. Add **Code** node after the Webhook
2. Set language to **JavaScript**
3. Paste this code:

```javascript
// Get webhook data
const item = $input.all()[0];
const data = item.json.body; // Data from webhook POST

// Custom Color Palette for Email
const colors = {
  primary: "#0D74CE",
  accent: "#D18B00",
  neutral: {
    50: "#F9FAFB",
    200: "#E5E7EB",
    600: "#4B5563",
    700: "#374151",
    900: "#111827",
  },
};

// Get certificate image (base64 string)
let base64Data = data.certificateImage;

// Remove data URL prefix if exists
if (base64Data.startsWith("data:")) {
  base64Data = base64Data.split(",")[1];
}

// Convert to Buffer for attachment
const buffer = Buffer.from(base64Data, "base64");

// Add binary data for email attachment
item.binary = {
  certificate: {
    data: buffer.toString("base64"),
    mimeType: "image/png",
    fileName: `Certificate_${data.recipientName.replace(/\s+/g, "_")}.png`,
  },
};

// Build beautiful HTML email
const currentYear = new Date().getFullYear();
const htmlEmail = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificate Delivery</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
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
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, ${colors.primary} 0%, #1E88E5 100%);
      color: #ffffff;
      padding: 40px 30px;
      text-align: center;
    }
    .header h1 { font-size: 28px; font-weight: 700; margin: 10px 0; }
    .content { padding: 40px 30px; background: #ffffff; }
    .greeting { font-size: 20px; font-weight: 600; margin-bottom: 20px; }
    .message-box {
      background: ${colors.neutral[50]};
      border-left: 4px solid ${colors.primary};
      padding: 20px;
      margin: 20px 0;
      border-radius: 8px;
      white-space: pre-line;
      line-height: 1.8;
    }
    .attachment-card {
      background: linear-gradient(135deg, ${colors.accent} 0%, #E6A523 100%);
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
      font-size: 13px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="header">
      <div style="font-size: 48px;">🎓</div>
      <h1>Certificate Delivery</h1>
      <p>Your Organization Certificate System</p>
    </div>
    
    <div class="content">
      <div class="greeting">Hello ${data.recipientName}! 👋</div>
      <div class="message-box">${data.message}</div>
      
      <div class="attachment-card">
        <div style="font-size: 40px; margin-bottom: 10px;">📎</div>
        <h3>Your Certificate is Attached</h3>
        <p>Download the PNG file attached to this email</p>
      </div>
      
      <p style="text-align: center; color: ${colors.neutral[600]};">
        <strong>Need assistance?</strong><br>
        Our support team is here to help
      </p>
    </div>
    
    <div class="footer">
      <strong style="font-size: 18px;">YOUR ORGANIZATION</strong><br>
      © ${currentYear} Your Organization. All rights reserved.
    </div>
  </div>
</body>
</html>
`;

// Prepare output for Gmail node
return [{
  json: {
    to: data.recipientEmail,
    subject: data.subject,
    htmlMessage: htmlEmail,
    recipientName: data.recipientName,
  },
  binary: item.binary,
}];
```

**What this does:**
- ✅ Extracts data from webhook
- ✅ Converts certificate image to attachment
- ✅ Creates beautiful HTML email
- ✅ Prepares data for Gmail node

---

### **Step 3: Add Gmail Node**

1. Add **Gmail** node after Code node
2. **Operation**: Send Message
3. **Settings**:
   - **To**: `={{ $json.to }}`
   - **Subject**: `={{ $json.subject }}`
   - **Email Type**: HTML
   - **Message (HTML)**: `={{ $json.htmlMessage }}`
   - **Attachments**: Select `certificate` from dropdown
4. **Credentials**: 
   - Click "Create New Credential"
   - Follow Gmail OAuth setup
   - Or use **SMTP** node instead (see below)

**Alternative: Use SMTP Instead**

If you prefer SMTP (works with any email provider):

1. Add **Send Email** node
2. Configure SMTP settings:
   - **Host**: `smtp.gmail.com` (or your provider)
   - **Port**: `587`
   - **User**: Your email
   - **Password**: App-specific password
3. Same field mappings as Gmail node

---

### **Step 4: Add Respond to Webhook Node**

1. Add **Respond to Webhook** node (final node)
2. Connect it after Gmail node
3. **Respond With**: JSON
4. **Response Body**:

```json
{
  "success": true,
  "message": "Email sent successfully",
  "recipient": "={{ $('Code').item.json.to }}"
}
```

5. **Response Code**: 200

**For Error Handling:**
- Connect Gmail's **error output** to another Respond node
- Set Response Code: 500
- Body: `{ "success": false, "error": "{{ $json.error }}" }`

---

## ⚙️ Configure Your App

Add the webhook URL to your `.env.local`:

```env
N8N_WEBHOOK_URL=https://your-n8n.com/webhook/certificate-email-api
```

**Get your n8n URL:**
- n8n Cloud: `https://yourname.app.n8n.cloud/webhook/certificate-email-api`
- Self-hosted: `https://your-domain.com/webhook/certificate-email-api`
- Local testing: `http://localhost:5678/webhook-test/certificate-email-api`

---

## 🧪 Testing Your Workflow

### **Test in n8n:**

1. Click **"Execute Workflow"** button in n8n
2. Use the **"Listen for Test Event"** option
3. Generate a certificate in your app
4. Click "Send Email" button
5. Check n8n - you should see the workflow execute!

### **Test with curl:**

```bash
curl -X POST https://your-n8n.com/webhook/certificate-email-api \
  -H "Content-Type: application/json" \
  -d '{
    "recipientEmail": "test@example.com",
    "recipientName": "Test User",
    "subject": "Test Certificate",
    "message": "This is a test email",
    "certificateImage": "data:image/png;base64,iVBORw0KG..."
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "recipient": "test@example.com"
}
```

---

## 🎨 Workflow Visual

Your final n8n workflow should look like this:

```
┌─────────────┐      ┌──────────────┐      ┌─────────┐      ┌──────────┐
│   Webhook   │  →   │  JavaScript  │  →   │  Gmail  │  →   │ Respond  │
│   (POST)    │      │    (Code)    │      │  Send   │      │  (200)   │
└─────────────┘      └──────────────┘      └─────────┘      └──────────┘
                                                 │
                                                 │ (error)
                                                 ↓
                                            ┌──────────┐
                                            │ Respond  │
                                            │  (500)   │
                                            └──────────┘
```

---

## 🔒 Security Best Practices

### **1. Use HTTPS**
- Always use HTTPS for production webhooks
- n8n Cloud provides this automatically
- Self-hosted: Use reverse proxy (nginx/Caddy) with SSL

### **2. Add Authentication (Optional)**

Add webhook authentication header:

1. In Webhook node, enable **Authentication**
2. Set **Header Auth**:
   - Header Name: `X-Webhook-Secret`
   - Header Value: `your-secret-key-123`

3. In your app's API route:
```typescript
const webhookSecret = request.headers.get('X-Webhook-Secret');
if (webhookSecret !== process.env.N8N_WEBHOOK_SECRET) {
  return new Response('Unauthorized', { status: 401 });
}
```

### **3. Rate Limiting**
- Gmail: 500 emails/day (free), 2000/day (Google Workspace)
- Add delays if sending bulk emails
- Consider using email service like SendGrid for high volume

---

## 🐛 Troubleshooting

### **❌ Webhook not receiving data?**
- Check webhook URL is correct in `.env.local`
- Verify webhook is **Production URL**, not Test URL
- Check n8n workflow is **activated** (toggle in top right)
- Look for CORS errors in browser console

### **❌ Email not sending?**
- Verify Gmail credentials are correct
- Check "Allow less secure apps" for Gmail (or use App Password)
- Review Gmail node execution logs in n8n
- Try SMTP node instead

### **❌ Certificate not attaching?**
- Ensure base64 image is valid (starts with `data:image/png;base64,`)
- Check binary data is properly set in Code node
- Verify attachment name in Gmail node: `certificate`

### **❌ Error: "Workflow not found"**
- Make sure workflow is **saved** and **activated**
- Check URL path matches webhook configuration
- Restart n8n if self-hosted

---

## 📊 Monitoring & Logs

### **View Execution History:**
1. Go to **Executions** tab in n8n
2. See all webhook calls with timestamps
3. Click any execution to see:
   - Input data received
   - Code node output
   - Email sent confirmation
   - Any errors

### **Enable Error Notifications:**
1. Workflow Settings → Error Workflow
2. Create error notification workflow
3. Get notified via email/Slack when emails fail

---

## 🚀 Advanced Options

### **Add Email Queue (Database)**

Want to queue emails instead of instant sending? Add:

1. **Postgres node** after Code node
2. Insert into `email_queue` table
3. Create **second workflow** with Schedule Trigger
4. Process queue every minute

See [Email Queue Architecture](../README.md#email-queue-system) in main docs.

### **Multiple Email Templates**

Add a **Switch node** after Webhook:

```javascript
// In Switch node, route by template type
const templateType = $json.body.templateType;

// Route 1: Certificate emails
// Route 2: Reminder emails  
// Route 3: Welcome emails
```

### **Track Email Opens**

Add tracking pixel in HTML:
```html
<img src="https://your-tracker.com/pixel?id=123" width="1" height="1" />
```

---

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
## 📚 Related Documentation

- **[Quick Start Guide](./QUICK-START.md)** - Get CertifiKit running
- **[Docker Setup](./DOCKER-SETUP.md)** - Deploy with Docker
- **[Main Documentation](../README.md)** - Full feature guide

---

## 💬 Need Help?

- **n8n Documentation**: https://docs.n8n.io
- **Community Forum**: https://community.n8n.io
- **CertifiKit Issues**: https://github.com/KpG782/certifikit/issues
- **Email**: support@certifikit.com

---

## ✅ Checklist

Before going live, verify:

- [ ] Webhook URL added to `.env.local`
- [ ] Gmail/SMTP credentials configured
- [ ] Workflow activated in n8n
- [ ] Test email sent successfully
- [ ] Error handling configured
- [ ] HTTPS enabled (production)
- [ ] Monitoring/logs reviewed

**You're all set!** 🎉 Your certificates will now be emailed automatically via n8n.

---

*Last updated: January 2025*
