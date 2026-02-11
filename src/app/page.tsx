"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const templates = [
    {
      src: "/certificates/template1.png",
      alt: "Professional Certificate Template 1"
    },
    {
      src: "/certificates/template2.png",
      alt: "Professional Certificate Template 2"
    },
    {
      src: "/certificates/template3.png",
      alt: "Professional Certificate Template 3"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % templates.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [templates.length]);

  return (
    <div className="min-h-screen bg-linear-to-br from-(--primary-50) via-(--neutral-50) to-(--accent-50) dark:from-(--primary-950) dark:via-(--neutral-950) dark:to-(--neutral-900)">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-linear-to-br from-(--primary-500) to-(--primary-600) shadow-lg relative overflow-hidden">
              <Image
                src="/favicon.png"
                alt="CertifiKit Logo"
                width={28}
                height={28}
                className="object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span
                className="text-xl font-bold text-(--primary-700) dark:text-(--primary-300)"
                style={{ fontFamily: "Merriweather, serif" }}
              >
                CertifiKit
              </span>
              <span className="text-xs text-(--neutral-600) dark:text-(--neutral-400)">
                Certificate Generator
              </span>
            </div>
          </div>
          <Button
            onClick={() => router.push("/login")}
            style={{
              backgroundColor: "var(--primary-500)",
              color: "white",
            }}
            className="hover:opacity-90 transition-opacity shadow-lg"
          >
            Sign In
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
          {/* Left: Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-(--primary-100) dark:bg-(--primary-900) text-(--primary-700) dark:text-(--primary-200) px-4 py-2 rounded-full text-sm font-semibold mb-6">
              Professional Certificate Generator
            </div>

            <h1
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              <span className="bg-linear-to-r from-(--primary-600) via-(--primary-500) to-(--accent-500) bg-clip-text text-transparent">
                Create Beautiful
              </span>
              <br />
              <span className="text-(--neutral-800) dark:text-(--neutral-100)">
                Certificates in Minutes
              </span>
            </h1>

            <p className="text-xl text-(--neutral-600) dark:text-(--neutral-300) mb-10 leading-relaxed">
              Design, customize, and download professional certificates with our
              intuitive drag-and-drop editor. Open-source and free to use.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
              <Button
                size="lg"
                onClick={() => router.push("/login")}
                className="text-lg px-10 py-6 shadow-xl hover:shadow-2xl transition-all"
                style={{
                  backgroundColor: "var(--primary-500)",
                  color: "white",
                }}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-10 py-6 border-2"
                style={{
                  borderColor: "var(--primary-500)",
                  color: "var(--primary-600)",
                }}
                onClick={() => {
                  document.getElementById("features")?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                Learn More
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 items-center text-(--neutral-500) dark:text-(--neutral-400) text-sm">
              <span>Secure & Private</span>
              <span>•</span>
              <span>Lightning Fast</span>
              <span>•</span>
              <span>Professional Quality</span>
            </div>
          </div>

          {/* Right: Template Slideshow */}
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl border-4 border-(--primary-200) dark:border-(--primary-800)">
            {templates.map((template, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ${
                  index === currentSlide ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={template.src}
                  alt={template.alt}
                  fill
                  className="object-contain p-4 bg-white dark:bg-(--neutral-900)"
                  priority={index === 0}
                />
              </div>
            ))}
            
            {/* Slide Indicators */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
              {templates.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentSlide
                      ? "bg-(--primary-600) w-8"
                      : "bg-(--neutral-400) hover:bg-(--neutral-500)"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="mt-32 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4 text-(--neutral-800) dark:text-(--neutral-100)"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              Everything You Need
            </h2>
            <p className="text-lg text-(--neutral-600) dark:text-(--neutral-300)">
              Powerful features to create stunning certificates effortlessly
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-(--neutral-900) rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border border-(--neutral-200) dark:border-(--neutral-800)">
              <h3 className="text-xl font-bold mb-3 text-(--neutral-800) dark:text-(--neutral-100)">
                Upload Templates
              </h3>
              <p className="text-(--neutral-600) dark:text-(--neutral-400) leading-relaxed">
                Use your own certificate designs or choose from our
                professionally designed templates to get started instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-(--neutral-900) rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border border-(--neutral-200) dark:border-(--neutral-800)">
              <h3 className="text-xl font-bold mb-3 text-(--neutral-800) dark:text-(--neutral-100)">
                Drag & Customize
              </h3>
              <p className="text-(--neutral-600) dark:text-(--neutral-400) leading-relaxed">
                Intuitive drag-and-drop interface to add text, signatures, and
                customize fonts, colors, and sizes with ease.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-(--neutral-900) rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 border border-(--neutral-200) dark:border-(--neutral-800)">
              <h3 className="text-xl font-bold mb-3 text-(--neutral-800) dark:text-(--neutral-100)">
                Download Instantly
              </h3>
              <p className="text-(--neutral-600) dark:text-(--neutral-400) leading-relaxed">
                Export your certificates as high-quality PNG images ready to
                print or share digitally with recipients.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-32 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl font-bold mb-4 text-(--neutral-800) dark:text-(--neutral-100)"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              Simple 4-Step Process
            </h2>
            <p className="text-lg text-(--neutral-600) dark:text-(--neutral-300)">
              Create professional certificates in just a few clicks
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                title: "Choose Template",
                description: "Select from our library or upload your own",
              },
              {
                step: "2",
                title: "Add Content",
                description: "Add names, text, and images",
              },
              {
                step: "3",
                title: "Customize",
                description: "Adjust fonts, colors, and positioning",
              },
              {
                step: "4",
                title: "Download",
                description: "Export as high-quality image",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl bg-white dark:bg-(--neutral-900) border border-(--neutral-200) dark:border-(--neutral-800) hover:shadow-lg transition-shadow"
              >
                <div
                  className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-xl shadow-lg"
                  style={{
                    backgroundColor: "var(--primary-500)",
                  }}
                >
                  {item.step}
                </div>
                <h4 className="font-bold mb-2 text-(--neutral-800) dark:text-(--neutral-100)">
                  {item.title}
                </h4>
                <p className="text-sm text-(--neutral-600) dark:text-(--neutral-400)">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 max-w-4xl mx-auto text-center">
          <div
            className="rounded-3xl p-12 shadow-2xl"
            style={{
              background: `linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)`,
            }}
          >
            <h2
              className="text-4xl font-bold mb-4 text-white"
              style={{ fontFamily: "Merriweather, serif" }}
            >
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Create professional certificates for your organization today
            </p>
            <Button
              size="lg"
              onClick={() => router.push("/login")}
              className="text-lg px-12 py-6 shadow-xl hover:shadow-2xl transition-all bg-white hover:bg-white/90"
              style={{
                color: "var(--primary-600)",
              }}
            >
              Start Creating Certificates
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-12 mt-32 border-t border-(--neutral-200) dark:border-(--neutral-800)">
        <div className="text-center text-(--neutral-600) dark:text-(--neutral-400)">
          <p className="mb-2">Developed by <span className="font-semibold">Ken Patrick Garcia</span> • Full Stack AI Engineer @ Romega Solutions</p>
          <p className="text-sm">Built with Next.js 16 and modern web technologies</p>
        </div>
      </footer>
    </div>
  );
}
