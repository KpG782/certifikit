# 🤝 Contributing to CertifiKit

Thank you for considering contributing to CertifiKit! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Testing](#testing)

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We expect all contributors to:

- Be respectful and considerate
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior

- Harassment, trolling, or discriminatory language
- Personal attacks or insults
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

## 🎯 How Can I Contribute?

### 1. Reporting Bugs

**Before submitting:**

- Check if the bug has already been reported
- Collect relevant information (browser, OS, steps to reproduce)

**Submit an issue with:**

- Clear, descriptive title
- Detailed steps to reproduce
- Expected vs. actual behavior
- Screenshots if applicable
- Environment details (OS, browser, Node version)

### 2. Suggesting Features

**Good feature requests include:**

- Clear problem statement
- Proposed solution
- Alternative solutions considered
- Why this benefits the community

### 3. Contributing Code

We welcome:

- Bug fixes
- New features
- Documentation improvements
- Performance optimizations
- UI/UX enhancements

## 💻 Development Setup

### Prerequisites

- Node.js 18+ ([Download](https://nodejs.org/))
- pnpm: `npm install -g pnpm`
- Git
- Code editor (VS Code recommended)

### Getting Started

1. **Fork the repository**

   Click "Fork" on GitHub: https://github.com/KpG782/certifikit

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/certifikit.git
   cd certifikit
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/KpG782/certifikit.git
   ```

4. **Install dependencies**

   ```bash
   pnpm install
   ```

5. **Configure environment**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your settings
   ```

6. **Run development server**

   ```bash
   pnpm dev
   ```

   Open http://localhost:3000

### Project Structure

```
certifikit/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── auth/         # Authentication components
│   │   ├── certificate/  # Certificate generation
│   │   ├── email-queue/  # Email queue management
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility libraries
│   ├── styles/           # Global styles
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
│   ├── certificates/     # Generated certificates
│   └── signatures/       # Signature images
├── docs/                 # Documentation
└── data/                 # Data files and templates
```

## 🔄 Pull Request Process

### 1. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

Branch naming:

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/fixes

### 2. Make Your Changes

- Write clean, readable code
- Follow existing code style
- Add comments for complex logic
- Update documentation if needed

### 3. Test Thoroughly

```bash
# Run development server
pnpm dev

# Build for production
pnpm build

# Run linter
pnpm lint

# Run type checking
pnpm type-check
```

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add batch CSV export feature"
```

See [Commit Guidelines](#commit-guidelines) below.

### 5. Keep Your Branch Updated

```bash
git fetch upstream
git rebase upstream/main
```

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

1. Go to your fork on GitHub
2. Click "Compare & pull request"
3. Fill out the PR template:
   - Clear description of changes
   - Related issue number (`Fixes #123`)
   - Screenshots/videos if UI changes
   - Testing steps

### 8. Code Review

- Address reviewer feedback
- Push additional commits if needed
- Keep discussion professional and constructive

### 9. Merge

Once approved, a maintainer will merge your PR. Thank you! 🎉

## 📝 Coding Standards

### TypeScript

```typescript
// ✅ Good
interface CertificateData {
  recipientName: string;
  title: string;
  date: string;
}

const generateCertificate = async (data: CertificateData): Promise<string> => {
  // Implementation
};

// ❌ Avoid
const generateCertificate = async (data: any) => {
  // No type safety
};
```

### React Components

```tsx
// ✅ Good - Functional component with TypeScript
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  variant = "primary",
}) => {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {label}
    </button>
  );
};

// ❌ Avoid - No types, unclear prop structure
export const Button = ({ label, onClick, variant }) => {
  return <button onClick={onClick}>{label}</button>;
};
```

### Tailwind CSS

```tsx
// ✅ Good - Use canonical Tailwind classes
<div className="flex items-center justify-between p-4 bg-background">

// ✅ Good - Use CSS variables for theme colors
<div className="text-(--foreground) bg-(--primary)">

// ❌ Avoid - Deprecated syntax
<div className="text-[var(--foreground)]">

// ❌ Avoid - Non-canonical classes
<div className="data-[state=open]:bg-accent">
// Use: data-state-open:bg-accent
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `CertificateCanvas.tsx`)
- Utilities: `kebab-case.ts` (e.g., `batch-generator.ts`)
- Types: `kebab-case.ts` (e.g., `email-queue.ts`)

### Code Organization

```typescript
// 1. Imports (grouped and sorted)
import React from "react";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { generateCertificate } from "@/lib/batch-generator";

// 2. Type definitions
interface Props {
  // ...
}

// 3. Component
export const MyComponent: React.FC<Props> = () => {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Functions
  const handleClick = () => {
    // ...
  };

  // 6. Effects
  useEffect(() => {
    // ...
  }, []);

  // 7. Render
  return <div>...</div>;
};
```

## 📋 Commit Guidelines

Use [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, no logic change)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(batch): add CSV export functionality"

# Bug fix
git commit -m "fix(email): resolve queue processing error"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Refactor
git commit -m "refactor(canvas): optimize rendering performance"

# Breaking change
git commit -m "feat(api)!: change batch generation API format

BREAKING CHANGE: Batch API now requires 'templateId' field"
```

## 🧪 Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Feature works as expected
- [ ] No console errors
- [ ] Responsive design (mobile, tablet, desktop)
- [ ] Works in Chrome, Firefox, Safari
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No linting errors (`pnpm lint`)
- [ ] Production build succeeds (`pnpm build`)

### Testing Areas

1. **Certificate Generation**

   - Single certificate generation
   - Batch generation with CSV
   - Template selection
   - Text positioning and styling
   - Image export quality

2. **Email Queue**

   - Adding to queue
   - Status updates
   - Filtering and search
   - Batch operations

3. **Authentication**

   - Login/logout
   - Session persistence
   - Protected routes

4. **UI/UX**
   - Navigation works
   - Forms validate properly
   - Loading states display
   - Error messages are clear

## 🎨 UI/UX Guidelines

- **Consistency**: Follow existing design patterns
- **Accessibility**:
  - Use semantic HTML
  - Add ARIA labels where needed
  - Ensure keyboard navigation works
  - Maintain color contrast ratios
- **Responsiveness**: Test on multiple screen sizes
- **Performance**: Optimize images, lazy load when possible

## 📚 Documentation

When adding features:

1. Update relevant docs in `docs/`
2. Add inline code comments for complex logic
3. Update README.md if user-facing
4. Add JSDoc comments for functions:

```typescript
/**
 * Generates a certificate image from template and data
 * @param template - The certificate template
 * @param data - Recipient data
 * @returns Promise resolving to image blob
 */
export const generateCertificate = async (
  template: Template,
  data: CertificateData
): Promise<Blob> => {
  // Implementation
};
```

## 🔒 Security

- Never commit sensitive data (API keys, passwords, etc.)
- Use environment variables for secrets
- Sanitize user inputs
- Report security vulnerabilities privately to: support@certifikit.com

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be:

- Listed in GitHub contributors
- Mentioned in release notes (for significant contributions)
- Forever appreciated by the community! ❤️

## 💬 Questions?

- **GitHub Discussions**: https://github.com/KpG782/certifikit/discussions
- **Issues**: https://github.com/KpG782/certifikit/issues
- **Email**: support@certifikit.com

Thank you for making CertifiKit better! 🚀
