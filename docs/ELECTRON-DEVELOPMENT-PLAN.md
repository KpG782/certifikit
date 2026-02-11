# CertifiKit Desktop - Electron Development Plan

## Project Overview
Transform CertifiKit from a Next.js web application into a standalone Windows desktop application using Electron.js. This will enable offline certificate generation for University of Makati (UMak) and other educational institutions.

---

## 🎯 Development Timeline (14 Hours Total)

### **SATURDAY (8 Hours)**

#### **Hour 1-2: Project Setup & Architecture**
```bash
# Initialize Electron Project
npm create @electron-forge/app@latest certifikit-desktop
cd certifikit-desktop
npm install electron-builder --save-dev
```

**Tasks:**
- [ ] Initialize Electron project with TypeScript support
- [ ] Setup electron-builder configuration for Windows
- [ ] Create folder structure following clean architecture
- [ ] Copy existing React components from Next.js app
- [ ] Setup IPC (Inter-Process Communication) bridge
- [ ] Configure webpack/vite for Electron renderer
- [ ] Test basic window opens with dev tools

**Deliverables:**
- ✅ Working Electron window
- ✅ Build configuration for Windows (.exe)
- ✅ Project structure documented

---

#### **Hour 3-4: Core Features Port**

**Tasks:**
- [ ] Port template editor component (drag-drop text)
- [ ] Integrate xlsx library for Excel/CSV parsing
- [ ] Port certificate canvas renderer (html2canvas)
- [ ] Setup local file system operations (Electron fs API)
- [ ] Implement template preview with real-time updates
- [ ] Create mock data generator for testing
- [ ] Test with 10 sample certificates batch

**Key Components to Port:**
```
src/components/certificate/
├── canvas.tsx → Adapt for Electron renderer
├── draggable-text.tsx → Keep as-is
├── template-selector.tsx → Modify for local file system
├── batch-generator.tsx → Add progress tracking
└── download-button.tsx → Replace with file system save
```

**Deliverables:**
- ✅ Template editor working in Electron
- ✅ Excel roster upload functional
- ✅ Certificate preview renders correctly

---

#### **Hour 5-6: Desktop-Specific Features**

**Tasks:**
- [ ] Implement native file picker (templates, Excel, images)
- [ ] Add folder selection dialog (batch export destination)
- [ ] Create progress bar for batch operations
- [ ] Add system notifications (Windows 10/11 style)
- [ ] Implement auto-save functionality
- [ ] Add recent files list
- [ ] Create settings persistence (localStorage → ElectronStore)

**Native Features:**
```javascript
// File Dialog
const { dialog } = require('electron');
dialog.showOpenDialog({
  properties: ['openFile'],
  filters: [
    { name: 'Excel Files', extensions: ['xlsx', 'csv'] }
  ]
});

// Progress Bar (Windows Taskbar)
mainWindow.setProgressBar(0.5); // 50% progress

// System Notifications
new Notification({
  title: 'CertifiKit',
  body: '500 certificates generated successfully!'
});
```

**Deliverables:**
- ✅ Native file dialogs working
- ✅ Progress tracking (taskbar + in-app)
- ✅ Windows notifications functional

---

#### **Hour 7-8: Polish & Testing**

**Tasks:**
- [ ] Create settings panel (fonts, margins, quality)
- [ ] Implement error handling with user-friendly messages
- [ ] Add memory optimization (process 100 certs at a time)
- [ ] Create loading states for all async operations
- [ ] Add keyboard shortcuts (Ctrl+O, Ctrl+S, etc.)
- [ ] Implement undo/redo for template editing
- [ ] Write error logs to `~/.certifikit/logs/`
- [ ] Test on another Windows PC (clean install)

**Error Handling:**
- Invalid Excel format → Show preview + suggested fixes
- Missing fonts → Fallback to system fonts
- Large batches (1000+) → Auto-split into chunks
- Low memory → Warn user and reduce batch size

**Deliverables:**
- ✅ Robust error handling
- ✅ Memory-efficient batch processing
- ✅ Keyboard shortcuts documented

---

### **SUNDAY (6 Hours)**

#### **Hour 1-2: UMak-Specific Features**

**Tasks:**
- [ ] Create pre-loaded UMak templates library
- [ ] Add UMak college seals (high-res PNGs)
- [ ] Implement signature management system
- [ ] Generate QR codes with verification links
- [ ] Setup optional Supabase integration (online verification)
- [ ] Create batch email sending (optional, with Gmail SMTP)
- [ ] Add export options (individual PDFs / merged PDF)

**UMak Templates:**
```
assets/templates/umak/
├── graduation-certificate.json
├── certificate-of-completion.json
├── certificate-of-participation.json
└── certificate-of-recognition.json

assets/seals/
├── umak-official-seal.png
├── ccis-logo.png
├── coe-logo.png
└── signature-chancellor.png
```

**QR Code Implementation:**
```javascript
// Generate unique verification code
const verificationCode = uuid();
const qrData = `https://verify.certifikit.com/${verificationCode}`;

// Store in local database (better-sqlite3)
db.prepare(`
  INSERT INTO certificates (code, name, course, date)
  VALUES (?, ?, ?, ?)
`).run(verificationCode, name, course, new Date());
```

**Deliverables:**
- ✅ UMak templates ready to use
- ✅ QR verification system working
- ✅ Email integration (optional)

---

#### **Hour 3-4: Packaging & Distribution**

**Tasks:**
- [ ] Configure electron-builder for Windows installer
- [ ] Create app icon (ICO format, multiple sizes)
- [ ] Add auto-updater configuration
- [ ] Sign the application (optional, for Windows SmartScreen)
- [ ] Test installer on clean Windows 10/11 PC
- [ ] Create portable version (.exe without installer)
- [ ] Write comprehensive README with screenshots
- [ ] Create GitHub release with installer

**electron-builder Configuration:**
```json
{
  "build": {
    "appId": "com.umak.certifikit",
    "productName": "CertifiKit Desktop",
    "win": {
      "target": ["nsis", "portable"],
      "icon": "build/icon.ico"
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true,
      "createDesktopShortcut": true,
      "createStartMenuShortcut": true
    }
  }
}
```

**Deliverables:**
- ✅ Windows installer (.exe)
- ✅ Portable version
- ✅ GitHub release published

---

#### **Hour 5: Demo Video Recording**

**Tasks:**
- [ ] Record 2-minute walkthrough video
- [ ] Show: Excel upload → Template selection → 100 certs in 30 seconds
- [ ] Add captions explaining each step
- [ ] Add background music (copyright-free)
- [ ] Export in multiple formats:
  - **TikTok/Reels:** 1080x1920 (vertical)
  - **YouTube:** 1920x1080 (horizontal)
  - **LinkedIn:** 1080x1080 (square)

**Demo Script:**
```
00:00 - Introduction
00:15 - Launch CertifiKit Desktop
00:30 - Import Excel roster (100 graduates)
00:45 - Select UMak graduation template
01:00 - Customize text fields (drag-drop)
01:15 - Click "Generate Batch"
01:30 - Show progress bar (30 seconds for 100 certs)
01:45 - Open output folder with generated PDFs
02:00 - Closing & download link
```

**Deliverables:**
- ✅ 3 video formats ready
- ✅ Thumbnail images created

---

#### **Hour 6: Launch Preparation**

**Tasks:**
- [ ] Post on UMak Computer Society Facebook groups
- [ ] Email to UMak college deans and registrars
- [ ] Share in Filipino teacher Facebook groups
- [ ] Submit to UMak ICT department for official adoption
- [ ] Post on LinkedIn with #EdTech #UMak
- [ ] Create Twitter thread demonstrating features
- [ ] Setup GitHub Discussions for support

**Email Template:**
```
Subject: Free Certificate Generator for UMak - Desktop Version

Dear [Dean/Registrar],

I've developed a free, offline certificate generator specifically 
designed for University of Makati. It can generate 100+ certificates 
in under a minute, with:

✅ Pre-loaded UMak templates
✅ Batch processing from Excel rosters
✅ QR code verification
✅ No internet required

Download: [GitHub Release Link]
Demo: [YouTube Video]

This tool is free and open-source. I'd love to discuss how it can 
help streamline your certificate issuance process.

Best regards,
[Your Name]
```

**Deliverables:**
- ✅ Posted on 5+ platforms
- ✅ Emails sent to key stakeholders
- ✅ GitHub repo public

---

## 📊 Success Metrics

### Technical Metrics
- **Performance:** Generate 100 certificates in < 30 seconds
- **Memory:** Handle 1000+ certificates without crashing
- **Startup Time:** Launch application in < 3 seconds
- **File Size:** Installer < 100MB

### User Metrics
- **First Week:** 50+ downloads from UMak community
- **First Month:** 200+ certificates generated
- **Feedback:** Positive reviews from 3+ departments

---

## 🚀 Post-Launch Roadmap

### Week 2-4: Enhancements
- [ ] Add template marketplace
- [ ] Implement cloud sync (optional)
- [ ] Add multi-language support (English, Filipino)
- [ ] Create video tutorials

### Month 2-3: Expansion
- [ ] Port to macOS (using electron-builder)
- [ ] Add mobile app (React Native)
- [ ] Partner with other universities
- [ ] Add analytics dashboard

---

## 🛠️ Technology Stack

### Core Technologies
- **Electron 28+** - Desktop framework
- **React 19** - UI framework
- **TypeScript 5** - Type safety
- **Vite** - Fast bundler

### Libraries
- **xlsx** - Excel file parsing
- **jspdf** / **puppeteer** - PDF generation
- **qrcode** - QR code generation
- **better-sqlite3** - Local database
- **electron-store** - Settings persistence
- **electron-builder** - Packaging

### UI Components
- **Radix UI** - Accessible components
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

---

## 📝 Notes

- **Offline First:** Application must work without internet
- **Data Privacy:** All processing happens locally
- **UX Focus:** Simple enough for non-technical users
- **Performance:** Prioritize speed over features
- **Documentation:** Every feature needs screenshots

---

## ✅ Pre-Launch Checklist

- [ ] All features tested on Windows 10 & 11
- [ ] Installer works on clean PC
- [ ] README has clear installation instructions
- [ ] Demo video uploaded to YouTube
- [ ] GitHub Issues enabled for bug reports
- [ ] Contact email/form for support requests
- [ ] License file included (MIT recommended)
- [ ] Privacy policy created (if collecting any data)

---

**Last Updated:** January 18, 2026  
**Status:** Planning Phase  
**Target Launch:** January 20, 2026 (Sunday Evening)
