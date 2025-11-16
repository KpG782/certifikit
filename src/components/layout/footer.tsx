import Link from "next/link";
import { Github, Linkedin, Mail, Heart } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Image
                src="/favicon.png"
                alt="CertifiKit"
                width={24}
                height={24}
                className="object-contain"
              />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                CertifiKit
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Open-source certificate generator built with Next.js 14 and
              Tailwind CSS. Create, customize, and export professional
              certificates with ease.
            </p>
            <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 fill-red-500" />
              <span>for the community</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="https://github.com/KpG782/certifikit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  GitHub Repository
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/generator"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Certificate Generator
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/KpG782/certifikit/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Report Issues
                </Link>
              </li>
            </ul>
          </div>

          {/* Developer Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
              Developer
            </h3>
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900 dark:text-white">
                Ken Patrick Garcia
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Full-Stack Developer | CS Student
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                University of Makati
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Link
                href="https://github.com/KpG782"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="GitHub Profile"
              >
                <Github className="h-5 w-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/ken-patrick-garcia"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                aria-label="LinkedIn Profile"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="mailto:support@certifikit.com"
                className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                aria-label="Email Contact"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-600 dark:text-slate-400 text-center sm:text-left">
              © {currentYear} CertifiKit. Released under the{" "}
              <Link
                href="https://github.com/KpG782/certifikit/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                MIT License
              </Link>
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
              <span className="hover:text-slate-900 dark:hover:text-white transition-colors cursor-default">
                Open Source Project
              </span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <Link
                href="https://github.com/KpG782/certifikit"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                View Source
              </Link>
            </div>
          </div>
        </div>

        {/* Optional: Star on GitHub CTA */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Like this project? Give it a ⭐ on GitHub!
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                Your support helps make open-source projects thrive
              </p>
            </div>
            <Link
              href="https://github.com/KpG782/certifikit"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-(primary-600) hover:bg-(primary-700) dark:bg-(primary-500) dark:hover:bg-(primary-600) text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
