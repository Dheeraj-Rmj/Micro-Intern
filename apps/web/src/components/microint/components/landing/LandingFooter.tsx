"use client";
import React from "react";
import { useApp } from "../../context/AppContext";
import { Sparkles, Github, Twitter, Linkedin, Heart, Mail, Phone, MapPin } from "lucide-react";
import { Logo } from "../common/Logo";

export const LandingFooter: React.FC = () => {
  const { setCurrentRoute } = useApp();

  const scrollToSection = (id: string) => {
    const targetId = id === "contact" ? "footer" : id;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer id="footer" className="bg-white text-slate-500 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Logo size="lg" onClick={() => setCurrentRoute("landing")} />
            <p className="text-xs text-slate-400 leading-relaxed">
              An open technical evaluation platform where engineers complete practical 2–5 day work
              trials to earn paid internships based on real code.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="#"
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => scrollToSection("hero")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  How It Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Features
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("about")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("contact")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Contact
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("faq")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          {/* Candidate Access */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Candidate Access
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <button
                  onClick={() => setCurrentRoute("signin")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentRoute("signup")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Sign Up
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentRoute("discover-trials")}
                  className="hover:text-blue-400 transition-colors cursor-pointer"
                >
                  Explore Open Trials
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Candidate Support
            </h4>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-purple-400" />
                <span>support@microintern.dev</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-purple-400" />
                <span>San Francisco, CA</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p>© 2026 MicroIntern Platform Inc. All rights reserved.</p>
            <span className="hidden sm:inline text-slate-700">&bull;</span>
            <p>
              <strong className="text-slate-800 font-bold">MicroIntern</strong> &mdash; A product of{" "}
              <a
                href="https://rmjit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-900 hover:underline font-semibold transition-colors"
              >
                RMJ IT solution
              </a>
            </p>
          </div>
          <p className="flex items-center gap-1">
            Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Next-Gen
            Engineers
          </p>
        </div>
      </div>
    </footer>
  );
};
