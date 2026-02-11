# CertifiKit Windows Desktop - Complete Features & UX Flow

**Document Version:** 1.0  
**Last Updated:** January 18, 2026  
**Purpose:** Comprehensive guide for AI coding assistant to implement CertifiKit features in Windows desktop application

---

## 🎯 Application Overview

CertifiKit Desktop is an offline-first Windows application for generating, managing, and distributing certificates. The app focuses on **simplicity, performance, and minimal visual clutter**.

### Core Design Philosophy
- **Minimal Icons:** Text labels over icon-only buttons where possible
- **Clean Workspace:** Focus on the canvas, hide peripheral UI when not needed
- **Keyboard Shortcuts:** Power users should be able to work without mouse
- **Progressive Disclosure:** Advanced features hidden until needed
- **Single-Click Actions:** Reduce clicks for common workflows

---

## 📐 Recommended UI Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] CertifiKit Desktop        User: John  [Settings] [?] │ ← Top Bar (40px)
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  [Navigation Bar - Always Visible]                           │ ← Nav (60px)
│  Dashboard | Generator | Templates | Email Queue             │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                                                               │
│                    MAIN CONTENT AREA                          │
│                   (Page-specific content)                     │
│                                                               │
│                                                               │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Status: Ready | Last saved: 2 mins ago        [Help]        │ ← Status Bar
└─────────────────────────────────────────────────────────────┘
```

### Window Size Recommendations
- **Minimum:** 1280x720 (Standard HD)
- **Recommended:** 1920x1080 (Full HD)
- **Maximum:** No limit (responsive)

---

## 📄 Page 1: Dashboard (Overview & Quick Actions)

### Purpose
Central hub showing recent activity, quick statistics, and shortcuts to main features.

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                                    │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Total Certs │  │ This Month  │  │ Templates   │         │
│  │    1,248    │  │     156     │  │      12     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  Recent Certificates (Last 10)                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Name          Course        Date        Actions      │    │
│  │ John Doe      React Basics  Jan 15     View | Edit   │    │
│  │ Jane Smith    Python 101    Jan 14     View | Edit   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                               │
│  Quick Actions:                                               │
│  [Create New Certificate]  [Upload Template]  [View Tutorials]│
└─────────────────────────────────────────────────────────────┘
```

### Features to Implement

#### 1. Statistics Cards (Top Row)
**Implementation Details:**
- **Total Certificates:** Query SQLite database `SELECT COUNT(*) FROM certificates`
- **This Month:** Filter by `created_at >= date('now', 'start of month')`
- **Templates Count:** Count templates in database + built-in templates
- **Display:** Large number with small label below
- **Colors:** Subtle background (light gray/blue), no gradients
- **Animation:** Fade in on load, no hover effects needed

#### 2. Recent Certificates Table
**Implementation Details:**
- **Data Source:** `SELECT * FROM certificates ORDER BY created_at DESC LIMIT 10`
- **Columns to Display:**
  - Recipient Name (text, left-aligned)
  - Course/Title (text)
  - Date Generated (formatted: "Jan 15, 2026")
  - Actions (View, Edit, Delete buttons)
- **Row Height:** 48px for easy click targets
- **Hover State:** Light background highlight on row hover
- **Click Behavior:** Clicking row opens certificate in Generator page
- **Search:** Add search box above table (filter by name/course)
- **Pagination:** Show 10 per page with "Load More" button

#### 3. Quick Action Buttons
**Implementation Details:**
- **Create New Certificate:** Opens Generator page with blank canvas
- **Upload Template:** Opens file dialog (PNG, JPG only), saves to database
- **View Tutorials:** Opens Tutorials page

**Button Style:**
```
┌─────────────────────────┐
│ Create New Certificate  │  ← Text only, no icon
└─────────────────────────┘
```

#### 4. First-Time User Experience
**Implementation Details:**
- Check database: `SELECT COUNT(*) FROM certificates`
- If count = 0, show welcome overlay:
  ```
  Welcome to CertifiKit Desktop!
  
  Let's get started:
  1. Choose a template
  2. Add recipient information
  3. Generate your first certificate
  
  [Start Tutorial]  [Skip]
  ```

---

## 🎨 Page 2: Generator (Certificate Creation Workspace)

### Purpose
Main workspace for creating single certificates or batch generating multiple certificates.

### Layout Structure (Single Mode)
```
┌─────────────────────────────────────────────────────────────┐
│  Generator                       [Single] [Batch] ← Tabs     │
│                                                               │
│  ┌───────────┐                                               │
│  │ Templates │  ← Sidebar (250px wide)                      │
│  │           │                                               │
│  │ [T1] [T2] │  ┌─────────────────────────────────────┐    │
│  │ [T3] [T4] │  │                                     │    │
│  │ [T5] [T6] │  │      CERTIFICATE CANVAS             │    │
│  │           │  │      (Live Preview)                 │    │
│  │ [+Upload] │  │                                     │    │
│  └───────────┘  └─────────────────────────────────────┘    │
│                                                               │
│  Properties Panel (Shows when text/image selected)           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ Font: Arial  Size: 24  Color: [■]  Bold: [ ]         │  │
│  │ Position: X: 100  Y: 200   Rotation: 0°              │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  [Add Text] [Add Image] [Download PNG] [Download PDF] [Email]│
└─────────────────────────────────────────────────────────────┘
```

### Features to Implement

#### 1. Template Selector (Left Sidebar)
**Implementation Details:**
- **Data Source:** Built-in templates (template1.png to template20.png) + custom uploads
- **Storage:** Store custom templates in `userData/templates/` directory
- **Display:** Grid of thumbnails (2 columns, 100x70px each)
- **Hover:** Blue border around selected template
- **Upload Button:** Bottom of sidebar, opens file dialog
- **Template Management:**
  ```typescript
  interface Template {
    id: string;
    name: string;
    path: string; // File path or data URL
    width: number;
    height: number;
    isBuiltIn: boolean;
    createdAt: Date;
  }
  ```

#### 2. Certificate Canvas (Center)
**Implementation Details:**
- **Technology:** HTML5 Canvas API
- **Dimensions:** 1200x850 pixels (standard certificate size)
- **Zoom:** Fit-to-window by default, scroll to zoom controls
- **Grid:** Optional snap-to-grid (10px intervals)
- **Selection:** Click to select text/image elements
- **Drag & Drop:** Mouse drag to reposition elements
- **Keyboard Shortcuts:**
  - Delete: Remove selected element
  - Ctrl+Z: Undo
  - Ctrl+Y: Redo
  - Ctrl+C: Copy element
  - Ctrl+V: Paste element
  - Arrow keys: Nudge position (1px, Shift+Arrow = 10px)

**Canvas State Management:**
```typescript
interface CanvasState {
  template: Template | null;
  textElements: TextElement[];
  imageElements: ImageElement[];
  selectedElementId: string | null;
  selectedElementType: 'text' | 'image' | null;
  history: CanvasState[]; // For undo/redo
  historyIndex: number;
}

interface TextElement {
  id: string;
  content: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  fontStyle: 'normal' | 'italic';
  color: string; // Hex color
  x: number; // Position from left
  y: number; // Position from top
  rotation: number; // Degrees
  textAlign: 'left' | 'center' | 'right';
  letterSpacing: number;
}

interface ImageElement {
  id: string;
  src: string; // Data URL or file path
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number; // 0-1
}
```

#### 3. Properties Panel (Bottom)
**Implementation Details:**
- **Visibility:** Only show when element is selected
- **Height:** 120px
- **Layout:** Horizontal form fields
- **Text Properties:**
  - Font dropdown (Arial, Times, Courier, custom fonts)
  - Size slider (8-120px)
  - Color picker (hex input + visual picker)
  - Bold/Italic/Underline checkboxes
  - Text alignment buttons (Left, Center, Right)
  - Position inputs (X, Y coordinates)
  - Rotation slider (0-360°)
  - Letter spacing slider
- **Image Properties:**
  - Width/Height inputs (maintain aspect ratio option)
  - Position (X, Y)
  - Rotation slider
  - Opacity slider (0-100%)
  - Replace image button
- **Real-time Update:** Changes reflect immediately on canvas

#### 4. Toolbar Buttons (Bottom Right)
**Implementation Details:**

**Add Text Button:**
- Opens dialog: "Enter text content"
- Default position: Center of canvas
- Default style: Arial, 24px, black

**Add Image Button:**
- Opens file dialog (PNG, JPG, SVG)
- Resize to fit canvas if too large
- Default position: Center of canvas

**Download PNG Button:**
- Renders canvas to PNG blob
- Opens save dialog with suggested name: `Certificate_[Name]_[Date].png`
- Default location: User's Downloads folder

**Download PDF Button:**
- Uses library (jsPDF or similar) to convert canvas to PDF
- A4 size, landscape orientation
- Opens save dialog

**Email Button:**
- Opens "Add to Email Queue" dialog (see Email Queue section)
- Requires recipient details filled

#### 5. Batch Mode Tab
**Implementation Details:**
- Switch from Single to Batch mode using tabs
- **UI Changes in Batch Mode:**
  - Hide individual Add Text/Image buttons
  - Show "Add Placeholder" button (adds {{name}}, {{course}}, etc.)
  - Show CSV/JSON upload area
  - Show recipient list table
  - Show "Generate All" and "Download ZIP" buttons

**Batch Workflow:**
1. User creates template with placeholders: `{{name}}`, `{{course}}`, `{{date}}`
2. User downloads sample CSV:
   ```csv
   name,course,date,email
   John Doe,React Basics,Jan 15 2026,john@example.com
   Jane Smith,Python 101,Jan 14 2026,jane@example.com
   ```
3. User edits CSV with recipient data
4. User uploads CSV file
5. App parses CSV and shows preview table
6. User clicks "Generate All"
7. App generates certificates in background with progress bar
8. User downloads ZIP file with all certificates

**CSV Parsing:**
```typescript
interface BatchRecipient {
  id: number;
  name: string;
  course: string;
  date: string;
  email?: string;
  customFields?: Record<string, string>; // For additional columns
  status: 'pending' | 'generating' | 'completed' | 'failed';
  certificatePath?: string; // Path to generated PDF/PNG
}

interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  currentRecipient: string;
  percentage: number;
}
```

**Progress Dialog:**
```
Generating Certificates...

[████████████░░░░░░░░] 67% (20/30)

Currently generating: Jane Smith
Estimated time remaining: 15 seconds

[Cancel]
```

---

## 🗂️ Page 3: Templates (Template Management)

### Purpose
Browse, upload, edit, and delete certificate templates.

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Templates                                    [Upload Template]│
│                                                               │
│  [All] [Built-in] [Custom]  ← Filter tabs                    │
│                                                               │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐│
│  │           │  │           │  │           │  │           │ │
│  │Template 1 │  │Template 2 │  │Template 3 │  │Template 4 │ │
│  │  1200x850 │  │  1200x850 │  │  1200x850 │  │  1200x850 │ │
│  │  [Edit]   │  │  [Edit]   │  │  [Edit]   │  │  [Edit]   │ │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘ │
│                                                               │
│  (More templates in grid...)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Features to Implement

#### 1. Template Grid Display
**Implementation Details:**
- **Layout:** Responsive grid (4 columns on 1920px, 3 on 1280px)
- **Card Size:** 280x200px
- **Thumbnail:** 280x160px image preview
- **Template Info:**
  - Name (editable on double-click)
  - Dimensions (e.g., "1200 × 850")
  - Type badge: "Built-in" or "Custom"
  - Usage count (optional): "Used 12 times"
- **Hover Actions:**
  - Edit (opens in Generator)
  - Preview (full-size modal)
  - Duplicate (for built-in templates)
  - Delete (custom templates only)
  - Export (save template file)

#### 2. Filter Tabs
**Implementation Details:**
- **All:** Show all templates
- **Built-in:** Show only template1.png - template20.png
- **Custom:** Show only user-uploaded templates
- **Active tab:** Underline or background color

#### 3. Upload Template Button
**Implementation Details:**
- **Location:** Top right corner
- **Click Behavior:** Opens file dialog
- **Accepted Formats:** PNG, JPG, JPEG (image files only)
- **Validation:**
  - Check file size (max 10MB)
  - Check dimensions (min 800x600, max 4000x3000)
  - Check format (valid image)
- **Process:**
  1. User selects image
  2. App shows "Name this template" dialog
  3. App copies file to `userData/templates/`
  4. App creates thumbnail (280x160)
  5. App saves to database
  6. App displays in grid

**Template Storage:**
```typescript
interface TemplateDatabase {
  id: string; // UUID
  name: string; // User-provided name
  originalPath: string; // Path in userData/templates/
  thumbnailPath: string; // Path to thumbnail
  width: number;
  height: number;
  isBuiltIn: boolean;
  usageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 4. Template Preview Modal
**Implementation Details:**
```
┌─────────────────────────────────────────────┐
│  Template Preview              [X] Close    │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │                                       │ │
│  │    Full-size template image          │ │
│  │    (scaled to fit window)            │ │
│  │                                       │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Name: Modern Blue Certificate              │
│  Size: 1200 × 850 pixels                    │
│  Created: Jan 10, 2026                      │
│                                             │
│  [Use Template] [Export] [Delete]           │
└─────────────────────────────────────────────┘
```

#### 5. Drag & Drop Upload
**Implementation Details:**
- Enable drag-and-drop on entire Templates page
- Show drop zone overlay when file is dragged over window
- Visual feedback: Dashed border, "Drop template here" text
- Support multiple file upload (process sequentially)

---

## 📧 Page 4: Email Queue (Email Management & Sending)

### Purpose
Manage pending emails, view sent/failed emails, and control email delivery.

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Email Queue                                                  │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Pending: 15 │  │  Sent: 247  │  │ Failed: 3   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  [All] [Pending] [Sent] [Failed]     🔍 Search: _______     │
│                                                               │
│  ☑ Select All              [Send Selected] [Delete Selected] │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │☑ Recipient      Course      Status    Date      Actions │ │
│  │☑ John Doe       React       Pending   Jan 15    Send│Del│ │
│  │☐ Jane Smith     Python      Sent      Jan 14    View│Del│ │
│  │☐ Bob Wilson     Java        Failed    Jan 13    Retry│Del││
│  └─────────────────────────────────────────────────────────┘│
│                                                               │
│  [Previous] Page 1 of 10 [Next]                              │
└─────────────────────────────────────────────────────────────┘
```

### Features to Implement

#### 1. Statistics Cards (Top Row)
**Implementation Details:**
- **Pending:** `SELECT COUNT(*) FROM email_queue WHERE status = 'pending'`
- **Sent:** `WHERE status = 'sent'`
- **Failed:** `WHERE status = 'failed'`
- **Click Behavior:** Clicking card applies filter (e.g., show only pending)
- **Color Coding:**
  - Pending: Yellow/Orange
  - Sent: Green
  - Failed: Red

#### 2. Filter Tabs
**Implementation Details:**
- Quick filters to show subset of emails
- Active tab highlighted
- Counts shown in parentheses: "Pending (15)"

#### 3. Email Queue Table
**Implementation Details:**
- **Columns:**
  - Checkbox (for bulk selection)
  - Recipient Name
  - Course/Certificate Title
  - Email Address
  - Status (Pending, Sent, Failed)
  - Scheduled Date (when to send)
  - Actions (Send, Retry, Delete, View)
- **Row Height:** 48px
- **Sorting:** Click column headers to sort
- **Status Indicators:**
  - Pending: ⏱️ Orange dot
  - Sent: ✅ Green checkmark
  - Failed: ❌ Red X with error message tooltip

**Database Schema:**
```typescript
interface EmailQueueItem {
  id: number;
  recipientName: string;
  recipientEmail: string;
  certificateId: string; // Foreign key to certificates table
  subject: string;
  messageBody: string;
  certificatePath: string; // Path to PDF attachment
  status: 'pending' | 'sent' | 'failed';
  scheduledAt: Date;
  sentAt?: Date;
  failureReason?: string; // Error message if failed
  retryCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 4. Bulk Actions
**Implementation Details:**

**Select All Checkbox:**
- Selects/deselects all visible rows
- Show count: "5 selected"

**Send Selected Button:**
- Enabled only when at least 1 pending email is selected
- Opens confirmation dialog:
  ```
  Send 5 emails?
  
  This will send emails to:
  • John Doe (john@example.com)
  • Jane Smith (jane@example.com)
  ...
  
  Note: Sending uses your configured email service.
  Daily limit: 10 emails remaining.
  
  [Cancel] [Send Now]
  ```
- Shows progress dialog during sending
- Updates status in real-time

**Delete Selected Button:**
- Opens confirmation: "Delete 5 email(s) from queue?"
- Removes from database
- Cannot delete already-sent emails (only pending/failed)

#### 5. Individual Row Actions

**Send/Retry Button:**
- Sends single email immediately
- Shows loading indicator
- Updates status to "Sent" or "Failed" with error message

**View Button:**
- Opens preview modal showing:
  - Recipient details
  - Subject line
  - Message body (with placeholders replaced)
  - Certificate preview (thumbnail)
  - Email history (sent attempts, timestamps, errors)

**Delete Button:**
- Removes from queue
- Confirmation: "Delete email to John Doe?"

#### 6. Email Composition Dialog (From Generator)
**Triggered when user clicks "Email" button in Generator page**

```
┌─────────────────────────────────────────────┐
│  Add to Email Queue              [X] Close  │
│                                             │
│  Recipient Information:                     │
│  Name:  [John Doe________________]          │
│  Email: [john@example.com________]          │
│                                             │
│  Email Content:                             │
│  Subject: [Certificate of Completion_____]  │
│                                             │
│  Message:                                   │
│  ┌─────────────────────────────────────┐   │
│  │ Dear {{name}},                      │   │
│  │                                     │   │
│  │ Congratulations on completing      │   │
│  │ {{course}}!                        │   │
│  │                                     │   │
│  │ Please find your certificate       │   │
│  │ attached.                           │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  Email Presets: [Congratulations ▼]        │
│                                             │
│  Schedule:                                  │
│  ○ Send immediately                         │
│  ○ Schedule for: [Date] [Time]              │
│                                             │
│  [Cancel] [Add to Queue] [Send Now]         │
└─────────────────────────────────────────────┘
```

**Implementation Details:**
- **Email Presets:** Dropdown with pre-written messages
  - "Congratulations"
  - "Course Completion"
  - "Achievement Unlocked"
  - "Custom" (user writes own)
- **Placeholders:** Auto-replace {{name}}, {{course}}, {{date}} from certificate data
- **Validation:**
  - Check valid email format
  - Require subject and message
- **Add to Queue:** Saves to database with status "pending"
- **Send Now:** Adds to queue and sends immediately

#### 7. Email Sending Service
**Implementation Details:**
- **Service:** Use Nodemailer in Electron main process
- **Configuration:** Settings page allows user to configure SMTP
- **Rate Limiting:** Track daily send count (default limit: 10/day for free Gmail)
- **Retry Logic:** Auto-retry failed emails up to 3 times with exponential backoff
- **Logging:** Save all email activity to log file

**Email Service Interface:**
```typescript
interface EmailService {
  send(item: EmailQueueItem): Promise<void>;
  validateConfig(): boolean;
  getRemainingQuota(): number;
  getSmtpStatus(): 'connected' | 'disconnected' | 'error';
}

interface SmtpConfig {
  host: string; // smtp.gmail.com
  port: number; // 587
  secure: boolean; // false for TLS
  auth: {
    user: string; // email address
    pass: string; // app password
  };
  from: string; // sender email
  dailyLimit: number; // default 10
}
```

---

## 📚 Page 5: Tutorials (Learning Resources)

### Purpose
Video tutorials and step-by-step guides for users to learn features.

### Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│  Tutorials                                                    │
│                                                               │
│  Learn how to use CertifiKit Desktop                         │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  🎥 Basic Certificate Creation        [Beginner] 1:27 │  │
│  │  Learn the fundamentals of creating certificates      │  │
│  │                                                        │  │
│  │  Steps:                                                │  │
│  │  1. Choose a template                                 │  │
│  │  2. Add text fields                                   │  │
│  │  3. Customize properties                              │  │
│  │  4. Download certificate                              │  │
│  │                                                        │  │
│  │  [▶ Watch Video]                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  📦 Batch Certificate Generation   [Intermediate] 3:00│  │
│  │  Generate multiple certificates using CSV files       │  │
│  │                                                        │  │
│  │  [▶ Watch Video]                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  📧 Email Automation Setup            [Advanced] 1:56 │  │
│  │  Set up automated email delivery with Gmail           │  │
│  │                                                        │  │
│  │  [▶ Watch Video]                                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Features to Implement

#### 1. Tutorial Cards
**Implementation Details:**
- **Display:** Vertical list of expandable cards
- **Card Height:** 
  - Collapsed: 120px
  - Expanded: Auto (shows steps + video)
- **Card Content:**
  - Tutorial title (large, bold)
  - Description (2 lines)
  - Difficulty badge (Beginner/Intermediate/Advanced)
  - Duration (e.g., "1:27")
  - Icon (🎥 for video, 📄 for text guide)
  - Step-by-step list (only when expanded)
  - Watch Video button

**Tutorial Data Structure:**
```typescript
interface Tutorial {
  id: number;
  title: string;
  description: string;
  videoId: string; // YouTube video ID
  duration: string; // "1:27"
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  steps: string[]; // Array of step descriptions
  category: 'basics' | 'batch' | 'email' | 'advanced';
  thumbnail: string; // Path to thumbnail image
}
```

#### 2. Video Player Integration
**Implementation Details:**
- **Platform:** YouTube embedded player (requires internet)
- **Offline Alternative:** Download MP4 files and bundle with app
- **Click Behavior:** Opens video in modal dialog or external browser
- **Modal Player:**
  ```
  ┌─────────────────────────────────────────────┐
  │  Tutorial: Basic Certificate Creation  [X]  │
  │                                             │
  │  ┌───────────────────────────────────────┐ │
  │  │                                       │ │
  │  │       YouTube Video Player            │ │
  │  │       (1920x1080)                     │ │
  │  │                                       │ │
  │  └───────────────────────────────────────┘ │
  │                                             │
  │  [Download Notes (PDF)] [Mark as Complete]  │
  └─────────────────────────────────────────────┘
  ```

#### 3. Offline Documentation
**Implementation Details:**
- Bundle PDF guides with installer
- Location: `assets/docs/`
- Files:
  - `Getting_Started.pdf`
  - `Batch_Processing_Guide.pdf`
  - `Email_Setup_Guide.pdf`
  - `Keyboard_Shortcuts.pdf`
- Add "Download PDF" button to each tutorial card

#### 4. Interactive Tutorial Mode
**Advanced Feature (Optional):**
- **Concept:** Step-by-step guided tour inside the app
- **Implementation:**
  - Overlay with spotlight on relevant UI elements
  - Tooltips explaining each step
  - "Next" button to advance
  - Can be skipped anytime
- **Trigger:** First-time user or "Start Guided Tour" button

---

## ⚙️ Page 6: Settings (Optional - Not in current web app)

### Purpose
Configure application behavior, email settings, and user preferences.

### Recommended Sections

#### 1. General Settings
- **Theme:** Light / Dark / System
- **Language:** English (add more later)
- **Default Save Location:** Choose folder for downloads
- **Auto-save:** Enable/disable, frequency (every N minutes)
- **Launch on Startup:** Windows startup option

#### 2. Email Settings
- **SMTP Server:** Host, port, security (TLS/SSL)
- **Account:** Email, password (encrypted storage)
- **Daily Limit:** Set custom send limit
- **Test Connection:** Button to verify SMTP settings

#### 3. Template Settings
- **Default Template:** Select default when opening Generator
- **Template Storage:** Path to custom templates folder
- **Auto-backup:** Backup templates to cloud/external drive

#### 4. Export Settings
- **Default Format:** PNG / PDF
- **PDF Quality:** Low / Medium / High
- **Image Compression:** None / Low / Medium / High
- **Watermark:** Add watermark to all exports (text or image)

#### 5. Advanced Settings
- **Certificate ID Format:** Prefix + auto-increment / UUID
- **Database Location:** Path to SQLite database
- **Backup Database:** Automatic backup schedule
- **Clear Cache:** Button to clear temporary files
- **Reset to Defaults:** Restore factory settings

---

## 🔄 Complete User Workflows

### Workflow 1: Generate Single Certificate (5 steps)
1. **Dashboard** → Click "Create New Certificate"
2. **Generator** → Select template from sidebar
3. **Generator** → Add text elements (name, course, date)
4. **Generator** → Customize text properties (font, size, color, position)
5. **Generator** → Click "Download PNG" or "Download PDF"

**Time to complete:** ~2 minutes

---

### Workflow 2: Batch Generate 100 Certificates (8 steps)
1. **Dashboard** → Click "Create New Certificate"
2. **Generator** → Select template
3. **Generator** → Switch to "Batch" tab
4. **Generator** → Add text with placeholders: `{{name}}`, `{{course}}`
5. **Generator** → Click "Download Sample CSV"
6. **External** → Edit CSV file in Excel with 100 rows
7. **Generator** → Upload edited CSV file
8. **Generator** → Click "Generate All" → Wait for progress → Download ZIP

**Time to complete:** ~5 minutes + CSV editing time

---

### Workflow 3: Send Certificate via Email (6 steps)
1. **Generator** → Create certificate (follow Workflow 1)
2. **Generator** → Click "Email" button
3. **Dialog** → Enter recipient name and email
4. **Dialog** → Edit subject and message (or choose preset)
5. **Dialog** → Click "Send Now" or "Add to Queue"
6. **Email Queue** → Monitor delivery status

**Time to complete:** ~3 minutes

---

### Workflow 4: Schedule Batch Email (9 steps)
1. **Generator** → Create template with placeholders
2. **Generator** → Switch to "Batch" tab
3. **Generator** → Upload CSV with names, courses, AND emails
4. **Generator** → Click "Generate All"
5. **Generator** → Click "Add All to Email Queue"
6. **Email Queue** → Review pending emails
7. **Email Queue** → Select all pending
8. **Email Queue** → Click "Send Selected"
9. **Email Queue** → Monitor progress in real-time

**Time to complete:** ~7 minutes

---

## 🎨 UI/UX Design Guidelines

### Visual Hierarchy
1. **Primary Actions:** Large buttons, prominent colors (blue/green)
2. **Secondary Actions:** Medium buttons, neutral colors (gray)
3. **Destructive Actions:** Red color for delete/cancel
4. **Informational Elements:** Small text, subtle backgrounds

### Color Palette (Minimal, Professional)
```
Primary: #3B82F6 (Blue) - Main actions
Success: #10B981 (Green) - Confirmations, success states
Warning: #F59E0B (Orange) - Pending, caution
Error: #EF4444 (Red) - Failures, deletions
Neutral: #6B7280 (Gray) - Secondary elements

Backgrounds:
Light Mode: #FFFFFF (White), #F9FAFB (Light Gray)
Dark Mode: #1F2937 (Dark Gray), #111827 (Darker Gray)
```

### Typography
- **Headings:** Segoe UI (Windows default), 24-32px, Bold
- **Body Text:** Segoe UI, 14-16px, Regular
- **Small Text:** Segoe UI, 12px, Regular
- **Monospace:** Consolas (for code/IDs), 14px

### Spacing
- **Section Padding:** 24px
- **Element Margin:** 16px
- **Compact Spacing:** 8px
- **Form Field Spacing:** 12px

### Icons
**Minimal Icon Usage - Prefer Text Labels**
- Only use icons when universally understood (✓, ✕, 🔍, ⚙️)
- Always pair icons with text labels when possible
- Icon size: 20x20px (standard), 24x24px (larger buttons)

### Buttons
```
Primary Button:
┌──────────────────┐
│ Create Certificate│  ← Blue background, white text
└──────────────────┘

Secondary Button:
┌──────────────────┐
│     Cancel       │  ← Gray border, dark text
└──────────────────┘

Text Button:
  Skip Tutorial      ← No border, blue text, hover underline
```

### Form Fields
- **Height:** 40px (easy to click)
- **Border Radius:** 6px (subtle rounded corners)
- **Border:** 1px solid gray, 2px blue on focus
- **Placeholder Text:** Light gray, disappears on focus

### Loading States
- **Spinner:** Simple rotating circle (20x20px)
- **Progress Bar:** Horizontal bar with percentage
- **Skeleton Screens:** Gray placeholder boxes during data load

### Error Messages
- **Display:** Below form field, red text, small font
- **Toast Notifications:** Top-right corner, auto-dismiss after 5s
- **Modal Alerts:** For critical errors requiring acknowledgment

---

## 🔧 Technical Implementation Notes for AI Assistant

### Recommended Technology Stack
1. **Framework:** Electron + React + TypeScript
2. **UI Library:** shadcn/ui (pre-built components)
3. **State Management:** Zustand (lightweight, easy)
4. **Database:** better-sqlite3 (fast, embedded)
5. **Canvas:** Fabric.js or Konva.js (advanced canvas manipulation)
6. **PDF Generation:** jsPDF or pdfkit
7. **Excel/CSV Parsing:** papaparse
8. **Email:** Nodemailer (SMTP)
9. **File Operations:** electron.dialog, fs-extra
10. **Build Tool:** electron-builder

### Project Structure (Reference ELECTRON-ENGINEERING-GUIDE.md)
```
src/
├── main/                   # Electron Main Process
│   ├── index.ts
│   ├── database/
│   ├── services/
│   └── ipc/
├── renderer/               # React UI
│   ├── pages/
│   ├── components/
│   ├── hooks/
│   └── stores/
├── shared/                 # Shared types
│   └── types/
└── preload/                # IPC bridge
    └── index.ts
```

### Database Schema (SQLite)
```sql
CREATE TABLE certificates (
  id TEXT PRIMARY KEY,
  recipient_name TEXT NOT NULL,
  course_name TEXT NOT NULL,
  date_issued TEXT NOT NULL,
  template_id TEXT NOT NULL,
  certificate_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  thumbnail_path TEXT,
  width INTEGER,
  height INTEGER,
  is_built_in BOOLEAN DEFAULT 0,
  usage_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  certificate_id TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message_body TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  scheduled_at DATETIME,
  sent_at DATETIME,
  failure_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (certificate_id) REFERENCES certificates(id)
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

### IPC Channels (Main ↔ Renderer Communication)
```typescript
// Certificate operations
'certificate:create'
'certificate:update'
'certificate:delete'
'certificate:get'
'certificate:getAll'

// Template operations
'template:upload'
'template:delete'
'template:getAll'

// File operations
'file:openDialog'
'file:saveDialog'
'file:readFile'
'file:writeFile'

// Email operations
'email:addToQueue'
'email:sendSingle'
'email:sendBatch'
'email:getQueue'
'email:updateStatus'

// Batch operations
'batch:generate'
'batch:progress' (event listener)
```

### Performance Targets
- **App Launch:** < 3 seconds (cold start)
- **Page Transition:** < 200ms
- **Canvas Render:** 60 FPS (smooth dragging)
- **Batch Generation:** 10 certificates/second
- **Database Query:** < 50ms (for 10,000 records)
- **PDF Export:** < 500ms per certificate

### Security Considerations
1. **Context Isolation:** Enabled (prevent script injection)
2. **Node Integration:** Disabled in renderer
3. **Input Validation:** Sanitize all user inputs
4. **SQL Injection:** Use parameterized queries
5. **File Path Validation:** Prevent directory traversal
6. **Email Credentials:** Encrypt before storing
7. **HTTPS Only:** For external API calls

### Error Handling Strategy
```typescript
// Consistent error format across app
interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Error codes
ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
  DATABASE_ERROR: 'DATABASE_ERROR',
  GENERATION_FAILED: 'GENERATION_FAILED',
  EMAIL_SEND_FAILED: 'EMAIL_SEND_FAILED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
}
```

### Logging System
- **Location:** `userData/logs/`
- **Files:** 
  - `app.log` (general logs)
  - `error.log` (errors only)
  - `email.log` (email activity)
- **Format:** JSON structured logging
- **Rotation:** Daily, keep 7 days
- **Privacy:** Never log passwords or sensitive data

---

## 🚀 Development Phases

### Phase 1: Core Features (MVP)
- [ ] Dashboard page (statistics, recent certificates)
- [ ] Generator page (single mode only)
- [ ] Template selector
- [ ] Canvas with drag/drop text
- [ ] Download PNG/PDF
- [ ] SQLite database setup
- [ ] Template management (upload, delete)

**Estimated Time:** 2-3 weeks

### Phase 2: Batch Processing
- [ ] Batch mode UI
- [ ] CSV parser
- [ ] Batch generation engine
- [ ] Progress tracking
- [ ] ZIP download

**Estimated Time:** 1-2 weeks

### Phase 3: Email Integration
- [ ] Email queue page
- [ ] SMTP configuration
- [ ] Email composition dialog
- [ ] Send/retry logic
- [ ] Status tracking

**Estimated Time:** 2 weeks

### Phase 4: Polish & Optimization
- [ ] Settings page
- [ ] Tutorials page
- [ ] Keyboard shortcuts
- [ ] Performance optimization
- [ ] Error handling refinement
- [ ] User testing feedback

**Estimated Time:** 1-2 weeks

### Phase 5: Distribution
- [ ] Code signing
- [ ] Installer creation
- [ ] Auto-update system
- [ ] Documentation
- [ ] Release

**Estimated Time:** 1 week

**Total Development Time:** 7-10 weeks

---

## 📝 AI Assistant Implementation Checklist

When implementing each feature, ensure:
- [ ] Follow SOLID principles (see ELECTRON-ENGINEERING-GUIDE.md)
- [ ] Use TypeScript with strict mode
- [ ] Add JSDoc comments for public methods
- [ ] Write unit tests for business logic
- [ ] Handle errors gracefully with user-friendly messages
- [ ] Log important events for debugging
- [ ] Validate all user inputs
- [ ] Use parameterized SQL queries
- [ ] Implement loading states for async operations
- [ ] Add keyboard shortcuts for power users
- [ ] Test with large datasets (1000+ certificates)
- [ ] Ensure responsive layout (1280px minimum)
- [ ] Follow Windows UI conventions
- [ ] Add tooltips for non-obvious features
- [ ] Implement undo/redo where applicable

---

## 🎯 Success Metrics

### User Experience Metrics
- **Time to First Certificate:** < 5 minutes (new user)
- **Batch Generation Time:** 100 certificates in < 60 seconds
- **App Launch Time:** < 3 seconds
- **Crash Rate:** < 0.1% of sessions
- **User Satisfaction:** > 4.5/5 stars

### Technical Metrics
- **Code Coverage:** > 80% unit tests
- **Bundle Size:** < 200MB installed
- **Memory Usage:** < 500MB typical, < 1GB peak
- **Database Size:** < 100MB for 10,000 certificates

---

**End of Document**

This specification provides complete details for implementing all features of CertifiKit Desktop. AI assistants should reference this document alongside ELECTRON-ENGINEERING-GUIDE.md for architectural patterns and best practices.

**Questions or clarifications?** Refer to the troubleshooting section in ELECTRON-ENGINEERING-GUIDE.md or consult the project lead.
