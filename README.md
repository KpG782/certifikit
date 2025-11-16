# CertifiKit

A modern, open-source certificate generator built with Next.js 14 and Tailwind CSS. Create, customize, and export professional certificates with an intuitive drag-and-drop interface.

![CertifiKit Preview](./preview.png)

## 🚀 Features

- **🔐 Secure Authentication**: Protected routes with session management
- **🎨 Drag & Drop Editor**: Intuitive interface for positioning elements
- **📝 Advanced Text Customization**: Font selection, colors, sizing, and positioning
- **🖼️ Template Management**: Multiple pre-built templates with custom upload support
- **💾 High-Quality Export**: Download certificates as PNG at 2x resolution
- **🌗 Dark/Light Mode**: Seamless theme switching
- **📱 Responsive Design**: Works flawlessly across all devices
- **⚡ Real-Time Preview**: See changes instantly as you edit
- **🎯 Precise Positioning**: Pixel-perfect element placement
- **🔤 Local Font Support**: Merriweather font loaded locally to avoid CORS issues
- **📧 Email Queue System**: PostgreSQL-backed email queueing with n8n integration
- **🔄 Auto-Refresh Status**: Real-time email status monitoring (5-second intervals)
- **📦 Batch Generation**: Generate and queue multiple certificates at once
- **🎓 Professional Email Presets**: 4 ready-to-use templates (Event, KPI, Internship, Custom)
- **🌐 n8n Webhook Integration**: Automated email sending via external workflow

## 📚 Documentation

### Quick Links

- **[Docker Setup Guide](./DOCKER-SETUP.md)** - Complete Docker installation and configuration ⭐
- **[n8n Setup Guide](./docs/n8n-setup.md)** - n8n workflow configuration for email automation
- **[Email Presets Guide](./docs/email-presets-guide.md)** - Professional email templates
- **[API Documentation](./docs/API.md)** - REST API endpoints and usage

### Email Integration

This system includes a complete email queue with:

- **PostgreSQL Database**: For storing email queue and status
- **n8n Webhook**: Automated email sending workflow
- **4 Email Presets**: Professional templates for different use cases
- **Batch Support**: Queue multiple certificates with personalized emails
- **Status Tracking**: Real-time monitoring with auto-refresh

See **[docs/UPDATE-SUMMARY.md](./docs/UPDATE-SUMMARY.md)** for complete details.

## 🔐 Authentication

The application features secure authentication to ensure only authorized users can create and manage certificates.

### Default Credentials

**Username:** `admin`  
**Password:** `CertifiKit2024!`

### Security Features

- Session-based authentication
- Protected routes with middleware
- Automatic redirect to login for unauthenticated users
- Secure logout functionality
- Client-side route protection
- 7-day session duration

### Changing Credentials

For production deployment, update the credentials in `src/lib/auth.ts`:

```typescript
export const ADMIN_CREDENTIALS = {
  username: "your_new_username",
  password: "your_strong_password",
};
```

**Better Practice - Use Environment Variables:**

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_ADMIN_USERNAME=your_username
NEXT_PUBLIC_ADMIN_PASSWORD=your_strong_password
SESSION_SECRET=your_random_secret_key
DATABASE_URL=postgresql://user:password@host:5432/database
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/certificate-email-api
```

Then update `src/lib/auth.ts` to use these variables:

```typescript
export const ADMIN_CREDENTIALS = {
  username: process.env.NEXT_PUBLIC_ADMIN_USERNAME || "admin",
  password: process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "CertifiKit2024!",
};
```

## 🏗️ Project Structure

```text
certifikit/
├── public/
│   ├── logo.svg              # Application logo
│   └── templates/            # Certificate templates
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── page.tsx         # Landing page
│   │   ├── login/           # Authentication page
│   │   ├── dashboard/       # User dashboard
│   │   └── generator/       # Certificate editor
│   ├── components/
│   │   ├── auth/            # Authentication components
│   │   │   ├── login-form.tsx
│   │   │   └── protected-route.tsx
│   │   ├── certificate/     # Core certificate components
│   │   │   ├── canvas.tsx              # Main editing workspace
│   │   │   ├── download-button.tsx     # PNG export functionality
│   │   │   ├── draggable-text.tsx      # Text element manipulation
│   │   │   ├── text-controls.tsx       # Text customization panel
│   │   │   ├── image-controls.tsx      # Image management
│   │   │   ├── template-selector.tsx   # Template browser
│   │   │   └── batch-generator.tsx     # Bulk certificate generation
│   │   ├── layout/          # Layout components
│   │   │   ├── navbar.tsx
│   │   │   ├── sidebar.tsx
│   │   │   └── footer.tsx
│   │   ├── onboarding/      # User guidance
│   │   │   ├── tour.tsx
│   │   │   └── generator-tour.tsx
│   │   └── ui/              # Shadcn/ui components
│   │       ├── button.tsx
│   │       └── accordion.tsx
│   ├── hooks/
│   │   └── use-auth.ts      # Authentication hook
│   ├── lib/
│   │   ├── auth.ts          # Auth utilities
│   │   ├── utils.ts         # Helper functions
│   │   └── batch-generator.ts # Batch processing
│   ├── types/
│   │   ├── certificates.ts  # Certificate type definitions
│   │   └── batch.ts         # Batch generation types
│   ├── styles/
│   │   └── globals.css      # Global styles
│   └── assets/
│       └── fonts/           # Local font files
│           ├── Merriweather_24pt-Bold.ttf
│           └── Merriweather_24pt-Regular.ttf
├── .env.local               # Environment variables (create this)
├── next.config.js           # Next.js configuration
├── tailwind.config.js       # Tailwind configuration
└── package.json
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command         | Action                                       |
| :-------------- | :------------------------------------------- |
| `npm install`   | Installs dependencies                        |
| `npm run dev`   | Starts local dev server at `localhost:3000`  |
| `npm run build` | Build your production site to `./.next/`     |
| `npm run start` | Preview your build locally, before deploying |
| `npm run lint`  | Run ESLint to check code quality             |

## 🛠️ Tech Stack

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Shadcn/ui](https://ui.shadcn.com/)** - Beautiful, accessible UI components
- **[html2canvas](https://html2canvas.hertzen.com/)** - High-quality image export
- **[Lucide Icons](https://lucide.dev/)** - Clean, customizable icons
- **[PostgreSQL](https://www.postgresql.org/)** - Email queue database
- **[n8n](https://n8n.io/)** - Workflow automation for email sending

## 📝 How to Use

1. **Login** using your credentials

2. **Navigate to Generator** from the dashboard

3. **Select a Template** or upload your own certificate design

4. **Add Text Elements**:

   - Click "Add Text" to create new elements
   - Drag elements to position them
   - Customize font, size, color, and alignment

5. **Add Images** (optional):

   - Upload logos or graphics
   - Position and resize as needed

6. **Preview in Real-Time**:

   - All changes appear instantly
   - Zoom in/out for precise editing

7. **Download Certificate**:

   - Click "Download PNG" button
   - High-quality 2x resolution export
   - Custom filename with timestamp

8. **Batch Generation**:
   - Upload CSV with recipient data
   - Generate multiple certificates at once
   - Queue emails for automated sending

## 💡 Core Components

### Canvas Component

Main editing workspace with drag & drop functionality, element selection, real-time preview, and canvas scaling.

### DownloadButton Component

High-quality export featuring html2canvas integration, 2x scale for crisp output, CORS handling, and error management.

### DraggableText Component

Text manipulation with free positioning, visual selection feedback, mouse-based dragging, and position updates.

### TextControls Component

Customization panel including font family picker, size slider, color picker, and alignment options.

## 🎯 Customization

### Adding New Templates

1. Add template image to `public/templates/`
2. Update template list in `template-selector.tsx`
3. Configure default dimensions

### Styling Changes

- Modify Tailwind classes in components
- Update colors in `tailwind.config.js`
- Add custom CSS in `globals.css`

### Font Customization

To use different fonts:

1. Add font files to `src/assets/fonts/`
2. Update `@font-face` in `globals.css`
3. Reference in text controls

## 🖼️ Image Export Quality

The download functionality generates professional-quality images:

- **2x Resolution**: Double the display resolution
- **Scale Factor**: Configurable for higher quality
- **CORS Handling**: `useCORS` and `allowTaint` enabled
- **Background**: White (#ffffff) for compatibility
- **Format**: PNG for lossless quality
- **File Naming**: Auto-generated with timestamp

## 📱 Responsive Design

The application adapts to all screen sizes with mobile-optimized interface, touch-friendly controls, responsive canvas scaling, adaptive sidebar, and mobile-first approach.

## 🔒 Security Best Practices

1. **Change default credentials** immediately after deployment
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** in production (required for secure cookies)
4. **Implement rate limiting** for auth endpoints
5. **Regular security audits** of dependencies
6. **Secure session management** with HTTP-only cookies
7. **Monitor access logs** for unauthorized attempts

## 🚀 Deployment

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- PostgreSQL database (for email queue feature)
- n8n instance (for email automation)

### Steps

1. **Clone the repository**

   ```bash
   git clone https://github.com/kenken64/certifikit.git
   cd certifikit
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your credentials
   ```

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Deploy to hosting provider**
   - **Vercel** (Recommended): `vercel --prod`
   - **Netlify**: Connect repository
   - **AWS/Azure**: Use appropriate deployment tools
   - Ensure environment variables are set in hosting dashboard

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 🎨 Credits & Attributions

### Icons & Images

- **Certificate Icon** - Created by [Smashicons](https://www.flaticon.com/authors/smashicons) from [Flaticon](https://www.flaticon.com/free-icons/certificate)
- **UI Icons** - [Lucide Icons](https://lucide.dev/) (ISC License)

### Open Source Libraries

This project uses the following open-source libraries:

- **Next.js** (MIT License) - React framework
- **React** (MIT License) - UI library
- **Tailwind CSS** (MIT License) - CSS framework
- **TypeScript** (Apache-2.0 License) - Type safety
- **Shadcn/ui** (MIT License) - UI components
- **html2canvas** (MIT License) - Canvas rendering
- **Framer Motion** (MIT License) - Animations
- **PostgreSQL** (PostgreSQL License) - Database
- **n8n** (Apache-2.0 License) - Workflow automation

All dependencies are properly licensed and included in this open-source project.

## ⚖️ Legal & Copyright Notice

### Usage Rights

This software is provided as open-source under the MIT License. You are free to:

- ✅ Use for personal and commercial projects
- ✅ Modify and customize the code
- ✅ Distribute modified versions
- ✅ Include in proprietary software

### Image Rights & Compliance

**Important:** While this software is open-source, users are responsible for ensuring they have proper rights to any images, logos, or content used in certificates:

#### Your Responsibilities:

1. **Template Images**: Ensure you own or have permission to use certificate template designs
2. **Logos & Graphics**: Verify you have rights to use any company logos or images
3. **Signatures**: Obtain authorization before using signature images
4. **Fonts**: Confirm font licenses permit commercial use in certificates
5. **Recipient Data**: Comply with GDPR, CCPA, and applicable privacy laws

#### Safe Usage Guidelines:

- ✅ Use your own designs and assets
- ✅ Use properly licensed stock images (e.g., Unsplash, Pexels with proper attribution)
- ✅ Create original certificate templates
- ✅ Obtain written permission for third-party assets
- ✅ Include proper attributions where required

#### Legal Protection:

This open-source software is provided "AS IS" without warranty. The developers and contributors:

- ❌ Do not claim ownership of user-generated content
- ❌ Are not responsible for copyright violations by users
- ❌ Do not guarantee legal compliance of certificates created
- ❌ Cannot be held liable for misuse of the software

**For Commercial Use:** Consult with a legal professional to ensure compliance with:

- Copyright laws in your jurisdiction
- Trademark regulations
- Privacy and data protection laws (GDPR, CCPA, etc.)
- Industry-specific certification requirements

### Attribution Requirements

When using this software, please:

1. **Maintain License**: Keep the MIT License in distributed copies
2. **Credit Original**: Link back to this repository when sharing
3. **Icon Attribution**: Include Smashicons/Flaticon credit if using the default icon
4. **Respect Trademarks**: Do not claim association with original authors

### Disclaimer

THE SOFTWARE AND ALL ASSOCIATED DOCUMENTATION ARE PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY ARISING FROM THE USE OF THIS SOFTWARE OR CERTIFICATES GENERATED WITH IT.

Users are solely responsible for:

- Legal compliance in their jurisdiction
- Proper licensing of all assets used
- Accuracy of information on certificates
- Data privacy and security measures
- Obtaining necessary permissions and rights

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Copyright © 2025 CertifiKit Contributors**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

## 🆘 Support

Need help?

- Open an issue on GitHub
- Check the documentation in the `/docs` folder
- Review existing issues and discussions

## 👀 Want to learn more?

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Shadcn/ui Documentation](https://ui.shadcn.com/)
- [html2canvas Documentation](https://html2canvas.hertzen.com/)
- [n8n Documentation](https://docs.n8n.io/)

## ⭐ Star History

If you find this project useful, please consider giving it a star on GitHub!

---

**Built with ❤️ for the open-source community**

**Version:** 1.0.0  
**Last Updated:** November 2025
