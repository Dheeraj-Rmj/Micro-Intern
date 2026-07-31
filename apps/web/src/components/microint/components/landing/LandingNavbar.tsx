'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sparkles, Menu, X, Sun, Moon, ArrowRight } from 'lucide-react';

export const LandingNavbar: React.FC = () => {
  const { setCurrentRoute, darkMode, setDarkMode } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/80 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => setCurrentRoute('landing')}
          className="flex items-center gap-2.5 font-black text-xl tracking-tight text-blue-600 dark:text-blue-400 cursor-pointer"
        >
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-600/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <span>MICROINTERN</span>
        </button>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
          <button onClick={() => scrollToSection('hero')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            Home
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            How It Works
          </button>
          <button onClick={() => scrollToSection('features')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            Features
          </button>
          <button onClick={() => scrollToSection('about')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            About
          </button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            Contact
          </button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
            FAQ
          </button>
        </nav>

        {/* Right Actions: Theme Toggle + Sign In / Sign Up */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          <button
            type="button"
            onClick={() => setCurrentRoute('signin')}
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
          >
            Sign In
          </button>

          <button
            type="button"
            onClick={() => setCurrentRoute('signup')}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>Sign Up</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
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
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-6 space-y-4">
          <button onClick={() => scrollToSection('hero')} className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200">
            Home
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200">
            How It Works
          </button>
          <button onClick={() => scrollToSection('features')} className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200">
            Features
          </button>
          <button onClick={() => scrollToSection('about')} className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200">
            About
          </button>
          <button onClick={() => scrollToSection('contact')} className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200">
            Contact
          </button>
          <button onClick={() => scrollToSection('faq')} className="block w-full text-left py-2 font-medium text-slate-700 dark:text-slate-200">
            FAQ
          </button>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentRoute('signin');
              }}
              className="w-full py-2.5 text-center rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setCurrentRoute('signup');
              }}
              className="w-full py-2.5 text-center rounded-xl bg-blue-600 text-white font-semibold text-sm"
            >
              Sign Up
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
