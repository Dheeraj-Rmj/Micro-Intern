"use client";
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import { Sparkles, Menu, X, Sun, Moon, ArrowRight } from "lucide-react";
import { Logo } from "../common/Logo";

export const LandingNavbar: React.FC = () => {
  const { setCurrentRoute, darkMode, setDarkMode } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const targetId = id === "contact" ? "footer" : id;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <header className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 w-full">
      <div className="w-full max-w-5xl bg-white/90 dark:bg-[#101010]/90 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-full h-14 flex items-center justify-between px-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all">
        {/* Logo */}
        <Logo size="md" onClick={() => setCurrentRoute("landing")} />

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button
            onClick={() => scrollToSection("hero")}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Contact
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            FAQ
          </button>
        </nav>

        {/* Right Actions: Sign In / Sign Up */}
        <div className="hidden md:flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5 transition-colors cursor-pointer mr-2"
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setCurrentRoute("signin")}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setCurrentRoute("signup")}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-900 dark:bg-white dark:text-black hover:bg-slate-800 dark:hover:bg-gray-200 rounded-full shadow-md transition-all cursor-pointer"
          >
            <span>Register</span>
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-24 left-4 right-4 rounded-3xl border border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#101010]/95 backdrop-blur-xl px-4 py-6 shadow-2xl space-y-4 md:hidden">
          <button
            onClick={() => scrollToSection("hero")}
            className="block w-full text-left py-2 px-4 rounded-xl font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </button>
          <button
            onClick={() => scrollToSection("how-it-works")}
            className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200"
          >
            How It Works
          </button>
          <button
            onClick={() => scrollToSection("features")}
            className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("about")}
            className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200"
          >
            About
          </button>
          <button
            onClick={() => scrollToSection("contact")}
            className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200"
          >
            Contact
          </button>
          <button
            onClick={() => scrollToSection("faq")}
            className="block w-full text-left py-2 px-4 rounded-xl font-medium text-slate-700 hover:bg-slate-50"
          >
            FAQ
          </button>

          <div className="pt-4 mt-4 border-t border-slate-100 flex flex-col gap-3 px-4">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentRoute("signin");
              }}
              className="w-full py-2.5 text-center rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentRoute("signup");
              }}
              className="w-full py-3 text-center rounded-xl bg-slate-900 text-white font-semibold text-sm shadow-md"
            >
              Register
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
