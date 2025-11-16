# ⚡ Quick Start Guide

Get CertifiKit up and running in 5 minutes!

## 🎯 What You'll Build

By the end of this guide, you'll have:

- ✅ CertifiKit running locally
- ✅ Admin access configured
- ✅ Your first certificate template uploaded
- ✅ A generated certificate

## 🚀 Method 1: Docker (Recommended)

### Step 1: Prerequisites

Install Docker Desktop: https://docs.docker.com/get-docker/

### Step 2: Get the Code

```bash
git clone https://github.com/KpG782/certifikit.git
cd certifikit
```

### Step 3: Configure

```bash
# Copy environment template
cp .env.example .env.local

# Edit credentials (use any text editor)
nano .env.local
```

**Set these values:**

```env
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=YourPassword123!
SESSION_SECRET=your-random-32-character-secret-key-here
```

### Step 4: Launch

```bash
docker-compose up -d
```

Wait 30-60 seconds for services to start.

### Step 5: Access

Open: http://localhost:3000

**Login with your credentials from Step 3.**

---

## 💻 Method 2: Manual Setup

### Step 1: Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm: `npm install -g pnpm`

### Step 2: Get the Code

```bash
git clone https://github.com/KpG782/certifikit.git
cd certifikit
```

### Step 3: Install Dependencies

```bash
pnpm install
```

### Step 4: Configure

```bash
cp .env.example .env.local
nano .env.local  # Edit credentials
```

### Step 5: Run Development Server

```bash
pnpm dev
```

Open: http://localhost:3000

---

## 🎨 Create Your First Certificate

### 1. Upload a Template

1. Go to **Templates** page
2. Click **Upload Template**
3. Upload any image (PNG/JPG) - try a certificate design or blank canvas
4. Name it: "My First Template"

### 2. Generate a Certificate

1. Go to **Generator** page
2. Select your template
3. Click **"+ Add Text"** to add recipient name
4. Type a name: "John Doe"
5. Drag text to position it
6. Click **Download Certificate** 🎉

### 3. Try Batch Generation

1. Still in **Generator**
2. Click **"Batch Generate"** tab
3. Download the example CSV
4. Click **"Upload CSV"**
5. Preview all certificates
6. Download as ZIP!

---

## 🔧 Common Next Steps

### Enable Email Queue

Set up PostgreSQL for queuing:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/certifikit_db
```

See [n8n Setup Guide](./n8n-setup.md) for email automation.

### Customize Branding

1. Replace `/public/favicon.png` with your logo
2. Edit `src/app/layout.tsx` for title/description
3. Modify `src/components/layout/footer.tsx` for footer text

### Add User Authentication

Currently uses simple admin credentials. For production:

- Implement NextAuth.js
- Add user roles (admin, user)
- Database-backed user management

---

## 🐛 Troubleshooting

### Port 3000 Already in Use

**Docker:**

```yaml
# Edit docker-compose.yml
ports:
  - "3001:3000" # Use port 3001
```

**Manual:**

```bash
PORT=3001 pnpm dev
```

### "Cannot find module" Error

```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm dev
```

### Docker Container Won't Start

```bash
# Check logs
docker-compose logs -f

# Rebuild
docker-compose down
docker-compose up -d --build
```

### Login Not Working

1. Verify `.env.local` has correct credentials
2. Check browser console for errors (F12)
3. Try incognito/private mode
4. Restart the server

---

## 📚 Next Reading

- **[Full Documentation](../README.md)** - Complete feature guide
- **[Docker Deployment](./DOCKER-SETUP.md)** - Production deployment
- **[n8n Email Setup](./n8n-setup.md)** - Automate email sending
- **[Contributing Guide](../CONTRIBUTING.md)** - Help improve CertifiKit

---

## 🆘 Need Help?

- **Issues**: [GitHub Issues](https://github.com/KpG782/certifikit/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KpG782/certifikit/discussions)
- **Email**: support@certifikit.com

---

## 🎉 You're All Set!

Congratulations! You now have a working certificate generator.

**Pro Tips:**

- Use high-resolution template images (1920x1080+)
- Save generated certificates to Queue for bulk emailing
- Explore the Dashboard for analytics
- Star the repo if you find it useful! ⭐
