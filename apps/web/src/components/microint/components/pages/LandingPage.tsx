"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useApp } from "../../context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Check,
  Twitter,
  Github,
  Linkedin,
  Instagram,
  Terminal,
  Cpu,
  LineChart,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Code2,
  Zap,
  Rocket,
} from "lucide-react";
import { WordsPullUpMultiStyle } from "../common/animations/WordsPullUpMultiStyle";
import { AnimatedLetter } from "../common/animations/AnimatedLetter";

// Helper component for FAQ items
const FaqItem = ({
  question,
  answer,
  delay,
}: {
  question: string;
  answer: string;
  delay: number;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { darkMode } = useApp();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay, duration: 0.4 }}
      className={`border-b ${darkMode ? "border-white/10" : "border-slate-200"}`}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full py-6 flex items-center justify-between text-left transition-colors cursor-pointer ${darkMode ? "text-white hover:text-blue-400" : "text-slate-900 hover:text-blue-600"}`}
      >
        <span className="font-medium text-lg pr-8">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 shrink-0" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p
              className={`pb-6 text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main Landing Page Component
export const LandingPage: React.FC = () => {
  const { setCurrentRoute, darkMode, setDarkMode } = useApp();
  const [activePolicyModal, setActivePolicyModal] = useState<"terms" | "privacy" | "cookie" | null>(
    null,
  );

  return (
    <div
      className={`min-h-screen font-sans selection:bg-blue-500/30 transition-colors duration-300 ${darkMode ? "bg-[#0E0E0E] text-white" : "bg-slate-50 text-slate-900"}`}
    >
      {/* SECTION 1: HERO */}
      <section
        id="hero"
        className="relative min-h-screen pt-28 pb-20 md:pt-40 md:pb-32 px-4 flex flex-col items-center justify-center overflow-hidden"
      >
        {/* Top Floating Navbar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <nav
            className={`mt-4 rounded-full px-4 py-2 md:px-8 flex items-center justify-between shadow-sm border transition-colors ${darkMode ? "bg-[#101010]/90 backdrop-blur-md border-white/10" : "bg-white/90 backdrop-blur-md border-black/5"}`}
          >
            {/* Logo */}
            <div
              role="presentation"
              className="flex items-center cursor-pointer select-none"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            >
              <Image
                src={darkMode ? "/MI.png" : "/MI_dark.png"}
                alt="Micro Intern Icon"
                width={32}
                height={32}
                className="h-6 sm:h-8 w-auto object-contain drop-shadow-md transition-all"
              />
            </div>

            <div className="hidden md:flex items-center gap-6">
              <a
                href="#how-it-works"
                className={`text-xs md:text-sm font-medium transition-colors ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
              >
                Our Story
              </a>
              <a
                href="#features"
                className={`text-xs md:text-sm font-medium transition-colors ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
              >
                Features
              </a>
              <a
                href="#faq"
                className={`text-xs md:text-sm font-medium transition-colors ${darkMode ? "text-slate-300 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}
              >
                FAQ
              </a>
            </div>

            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-full transition-colors cursor-pointer ${darkMode ? "text-slate-400 hover:text-white hover:bg-white/10" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"}`}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button
                onClick={() => setCurrentRoute("signin")}
                className={`group flex items-center rounded-full pl-4 pr-1.5 py-1.5 font-medium text-xs sm:text-sm transition-all hover:gap-2 cursor-pointer ${darkMode ? "bg-amber-500 text-black" : "bg-amber-400 text-slate-900"}`}
              >
                <span>Sign In</span>
                <div
                  className={`ml-2 rounded-full w-7 h-7 flex items-center justify-center transition-transform group-hover:scale-110 ${darkMode ? "bg-black/10" : "bg-white/40"}`}
                >
                  <ArrowRight
                    className={`w-3.5 h-3.5 ${darkMode ? "text-black" : "text-slate-900"}`}
                  />
                </div>
              </button>
            </div>
          </nav>
        </div>

        {/* CSS Grid Background pattern (Light/Dark aware) */}
        <div className="absolute inset-0 z-0 pointer-events-none flex justify-center">
          <div className="w-full max-w-7xl h-full flex justify-between px-4 sm:px-6 lg:px-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`w-px h-full ${darkMode ? "bg-white/[0.03]" : "bg-slate-200/60"} ${i > 0 && i < 5 ? "hidden sm:block" : ""}`}
              />
            ))}
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full max-w-5xl mx-auto text-center flex flex-col items-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className={`text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif tracking-tight leading-[1.05] mb-8 ${darkMode ? "text-white" : "text-slate-900"}`}
          >
            Evaluate By Building.
            <br />
            <span className="italic text-blue-600">Hire</span> By Code.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed mb-10 ${darkMode ? "text-slate-400" : "text-slate-600"}`}
          >
            Replace resumes and subjective interviews with 48-hour practical engineering trials.
            Evaluate candidates on actual production code before making a hire.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => setCurrentRoute("signup")}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm transition-all cursor-pointer flex items-center justify-center gap-2 ${darkMode ? "bg-amber-500 hover:bg-amber-400 text-black" : "bg-amber-400 hover:bg-amber-500 text-slate-900"}`}
            >
              Start Hiring
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" });
              }}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm transition-all cursor-pointer border ${darkMode ? "bg-transparent border-white/20 hover:bg-white/10 text-white" : "bg-white border-slate-200 hover:bg-slate-50 text-slate-900 shadow-sm"}`}
            >
              See how it works
            </button>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: ABOUT / HOW IT WORKS */}
      <section
        id="how-it-works"
        className={`py-24 md:py-32 px-4 md:px-6 border-t ${darkMode ? "border-white/5 bg-[#141414]" : "border-slate-200 bg-white"}`}
      >
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-8 block">
            AI Skill Trials
          </span>

          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-4xl mx-auto leading-tight sm:leading-[1.1] mb-12">
            <WordsPullUpMultiStyle
              segments={[
                { text: "No whiteboards.", className: "font-normal" },
                {
                  text: "No keyword filtering.",
                  className: `font-serif italic font-normal px-2 ${darkMode ? "text-blue-300/80" : "text-blue-600/80"}`,
                },
                {
                  text: "Just real engineering trials that prove what candidates can build.",
                  className: "font-normal",
                },
              ]}
              className="justify-center"
            />
          </div>

          <div className="max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`text-sm md:text-lg leading-relaxed justify-center ${darkMode ? "text-slate-400" : "text-slate-600"}`}
            >
              We work directly with engineering teams to design practical repository tasks.
              Candidates fix bugs, implement features, and submit pull requests in an isolated
              environment—giving companies objective proof of work.
            </motion.p>
          </div>
        </div>
      </section>

      {/* SECTION 3: RMJ IT SOLUTION (Bento Layout) */}
      <section
        id="about"
        className={`py-24 md:py-32 px-4 md:px-6 border-t ${darkMode ? "border-white/5 bg-[#0E0E0E]" : "border-slate-200 bg-slate-50"}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 md:mb-24 text-center">
            <span className="text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 block">
              About the Company
            </span>
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-normal leading-tight max-w-3xl mx-auto ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              MicroIntern is a proud project of{" "}
              <span className="italic text-blue-600 font-serif">RMJ IT Solution</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              whileHover={{ y: -4 }}
              className={`rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-all duration-300 border ${darkMode ? "bg-[#1A1A1A] border-slate-200 hover:border-slate-200" : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-xl"}`}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center mb-8 shadow-lg">
                  <span className="text-slate-900 font-bold text-xl">R</span>
                </div>
                <h3
                  className={`text-2xl font-medium mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  RMJ IT Solution
                </h3>
                <p
                  className={`text-sm sm:text-base leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  RMJ IT Solution builds software for technical teams and modern organizations. We
                  focus on developer tooling, transparent evaluation pipelines, and practical
                  applications that eliminate hiring friction.
                </p>
              </div>
            </motion.div>

            <div className="flex flex-col gap-6">
              <motion.div
                whileHover={{ y: -4 }}
                className={`rounded-3xl p-8 flex-1 transition-all duration-300 border ${darkMode ? "bg-[#1A1A1A] border-slate-200 hover:border-slate-200" : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-xl"}`}
              >
                <h4
                  className={`font-medium text-lg mb-3 ${darkMode ? "text-white" : "text-slate-900"}`}
                >
                  Our Vision
                </h4>
                <p
                  className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                >
                  Traditional technical hiring relies on resumes and keyword filtering. RMJ IT
                  Solution built MicroIntern to standardize work-sample evaluations—allowing
                  engineering teams to evaluate talent on actual codebases rather than algorithmic
                  puzzles.
                </p>
              </motion.div>
              <div className="grid grid-cols-2 gap-6">
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`rounded-3xl p-6 transition-all duration-300 border ${darkMode ? "bg-[#1A1A1A] border-slate-200 hover:border-slate-200" : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-xl"}`}
                >
                  <h4 className="text-blue-600 font-bold text-lg mb-2">Automated</h4>
                  <p
                    className={`text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Automated test suites and code-review rubrics for fast feedback.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className={`rounded-3xl p-6 transition-all duration-300 border ${darkMode ? "bg-[#1A1A1A] border-slate-200 hover:border-slate-200" : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-xl"}`}
                >
                  <h4 className="text-blue-600 font-bold text-lg mb-2">Global</h4>
                  <p
                    className={`text-xs leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-500"}`}
                  >
                    Open technical evaluations accessible to developers across 30+ countries.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES (Bento Grid) */}
      <section
        id="features"
        className={`py-24 md:py-32 px-4 md:px-6 border-t ${darkMode ? "border-white/5 bg-[#141414]" : "border-slate-200 bg-white"}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 md:mb-24 text-center">
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Standardized technical evaluations.
            </h2>
            <p className={`text-lg ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Practical tasks. Objective verification.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Man Picture Canvas */}
            <motion.div
              whileHover={{ y: -4 }}
              className={`rounded-3xl overflow-hidden relative border transition-all duration-300 h-full min-h-[300px] ${darkMode ? "border-slate-200" : "border-slate-200 hover:border-blue-200 hover:shadow-xl"}`}
            >
              <motion.img
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{
                  duration: 15,
                  repeat: Infinity,
                  repeatType: "reverse",
                  ease: "linear",
                }}
                className="absolute inset-0 w-full h-full object-cover"
                src="/images/feature_bg.png"
                alt="Feature Background"
              />
              <div className="absolute inset-0 bg-slate-50/30" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-slate-900 font-medium text-lg">Your creative canvas.</p>
              </div>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className={`rounded-3xl p-8 flex flex-col border transition-all duration-300 ${darkMode ? "bg-[#1A1A1A] border-slate-200 hover:border-slate-200" : "bg-slate-50 border-slate-200 hover:border-blue-200 hover:shadow-xl"}`}
            >
              <div className="mb-8 w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                <Terminal className="w-6 h-6 text-blue-600" />
              </div>
              <h3
                className={`text-xl font-medium mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                Authentic Coding
              </h3>
              <ul className="space-y-4 flex-1">
                {[
                  "Real-world engineering challenges",
                  "No generic algorithmic puzzles",
                  "In-browser fully equipped IDE",
                  "Automated testing & validation",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span
                      className={`text-sm leading-tight ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className={`rounded-3xl p-8 flex flex-col border transition-all duration-300 ${darkMode ? "bg-[#1A1A1A] border-slate-200 hover:border-slate-200" : "bg-slate-50 border-slate-200 hover:border-blue-200 hover:shadow-xl"}`}
            >
              <div className="mb-8 w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-blue-600" />
              </div>
              <h3
                className={`text-xl font-medium mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                Smart Grading
              </h3>
              <ul className="space-y-4 flex-1">
                {[
                  "Instant comprehensive scoring",
                  "Best practices & style analysis",
                  "Actionable feedback for candidates",
                  "Fair & unbiased evaluations",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span
                      className={`text-sm leading-tight ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              whileHover={{ y: -4 }}
              className={`rounded-3xl p-8 flex flex-col border transition-all duration-300 ${darkMode ? "bg-[#1A1A1A] border-slate-200 hover:border-slate-200" : "bg-slate-50 border-slate-200 hover:border-blue-200 hover:shadow-xl"}`}
            >
              <div className="mb-8 w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                <LineChart className="w-6 h-6 text-blue-600" />
              </div>
              <h3
                className={`text-xl font-medium mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                Actionable Insights
              </h3>
              <ul className="space-y-4 flex-1">
                {[
                  "Verified candidate trust scores",
                  "Detailed benchmark comparisons",
                  "In-depth performance profiling",
                  "Streamlined hiring pipelines",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span
                      className={`text-sm leading-tight ${darkMode ? "text-slate-400" : "text-slate-600"}`}
                    >
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 4.5: FOR CANDIDATES (USP) */}
      <section
        id="candidates"
        className={`py-24 md:py-32 px-4 md:px-6 border-t ${darkMode ? "border-white/5 bg-[#0A0A0A]" : "border-slate-200 bg-slate-50"}`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 md:mb-24 text-center">
            <span className="text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 block">
              For Candidates
            </span>
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Ditch the whiteboard. Show what you can build.
            </h2>
            <p
              className={`text-lg max-w-2xl mx-auto ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Your skills are worth more than a resume keyword match. Prove your engineering
              capabilities on real-world tasks and get hired faster.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -4 }}
              className={`rounded-3xl p-8 flex flex-col border transition-all duration-300 ${darkMode ? "bg-[#141414] border-slate-200 hover:border-blue-500/30" : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-xl"}`}
            >
              <div className="mb-8 w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                <Code2 className="w-6 h-6 text-blue-600" />
              </div>
              <h3
                className={`text-xl font-medium mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                No More LeetCode
              </h3>
              <p
                className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Stop grinding abstract algorithms. Our trials reflect actual day-to-day engineering
                work, allowing you to showcase your true potential on production-like code.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className={`rounded-3xl p-8 flex flex-col border transition-all duration-300 ${darkMode ? "bg-[#141414] border-slate-200 hover:border-blue-500/30" : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-xl"}`}
            >
              <div className="mb-8 w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                <Rocket className="w-6 h-6 text-blue-600" />
              </div>
              <h3
                className={`text-xl font-medium mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                Skip The Line
              </h3>
              <p
                className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Candidates with verified MicroIntern trust scores bypass initial resume screening
                rounds and go straight to final technical interviews with hiring managers.
              </p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className={`rounded-3xl p-8 flex flex-col border transition-all duration-300 ${darkMode ? "bg-[#141414] border-slate-200 hover:border-blue-500/30" : "bg-white border-slate-200 hover:border-blue-200 hover:shadow-xl"}`}
            >
              <div className="mb-8 w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3
                className={`text-xl font-medium mb-4 ${darkMode ? "text-white" : "text-slate-900"}`}
              >
                Instant Feedback
              </h3>
              <p
                className={`text-sm leading-relaxed ${darkMode ? "text-slate-400" : "text-slate-600"}`}
              >
                Never get ghosted again. Receive immediate, actionable feedback and performance
                profiling as soon as you submit your code for evaluation.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5: FAQ */}
      <section
        id="faq"
        className={`py-24 md:py-32 px-4 md:px-6 border-t ${darkMode ? "border-white/5 bg-[#0E0E0E]" : "border-slate-200 bg-slate-50"}`}
      >
        <div className="max-w-3xl mx-auto">
          <div className="mb-16 md:mb-24 text-center">
            <span className="text-blue-600 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 block">
              Clear The Ambiguity
            </span>
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Frequently Asked Questions
            </h2>
          </div>

          <div className="flex flex-col">
            <FaqItem
              delay={0.1}
              question="What is a Skill Trial?"
              answer="It is a practical, browser-based coding assignment where you work on a real codebase. You submit code that is evaluated on correctness, structure, and best practices."
            />
            <FaqItem
              delay={0.2}
              question="Who evaluates the submissions?"
              answer="Submissions are first validated by automated test suites and linting checks, then reviewed by engineering leaders from hiring companies."
            />
            <FaqItem
              delay={0.3}
              question="Do I need to submit a resume?"
              answer="No. MicroIntern focuses entirely on proof of work. Your completed trials and verified code score serve as your credentials."
            />
            <FaqItem
              delay={0.4}
              question="Is MicroIntern free for candidates?"
              answer="Yes. Candidates can create a profile and complete evaluation trials at no cost. Hiring organizations pay to evaluate and recruit verified candidates."
            />
          </div>
        </div>
      </section>

      {/* MEGA FOOTER */}
      <footer
        id="footer"
        className={`pt-20 pb-10 px-6 md:px-12 border-t ${darkMode ? "bg-[#141414] border-white/5" : "bg-white border-slate-200"}`}
      >
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          <div className="lg:col-span-1">
            <h3
              className={`text-2xl font-black tracking-tight mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}
            >
              Micro Intern
            </h3>
            <p
              className={`text-sm leading-relaxed mb-8 max-w-xs ${darkMode ? "text-slate-400" : "text-slate-500"}`}
            >
              Practical 48-hour work trials. We replace resumes with verified, production-ready
              code.
            </p>
            <div className="flex gap-4">
              {[Twitter, Github, Linkedin, Instagram].map((Icon, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${darkMode ? "bg-slate-100 text-slate-400 hover:text-slate-900 hover:bg-slate-100" : "bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200"}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          <div className="md:pl-4">
            <h4 className={`font-medium mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
              Platform
            </h4>
            <ul className="space-y-4">
              {["Features", "Our Story", "FAQ", "Pricing"].map((link) => (
                <li key={link}>
                  <button
                    type="button"
                    className={`text-sm transition-colors cursor-pointer ${darkMode ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`font-medium mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
              Resources
            </h4>
            <ul className="space-y-4">
              {["Documentation", "Blog", "Community", "Help Center"].map((link) => (
                <li key={link}>
                  <button
                    type="button"
                    className={`text-sm transition-colors cursor-pointer ${darkMode ? "text-slate-400 hover:text-slate-900" : "text-slate-500 hover:text-slate-900"}`}
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className={`font-medium mb-6 ${darkMode ? "text-white" : "text-slate-900"}`}>
              Stay Updated
            </h4>
            <p className={`text-sm mb-4 ${darkMode ? "text-slate-400" : "text-slate-500"}`}>
              Subscribe to our newsletter for the latest platform updates.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className={`rounded-lg px-4 py-2.5 text-sm w-full focus:outline-none transition-colors border ${darkMode ? "bg-slate-100 border-slate-200 text-slate-900 placeholder-slate-500 focus:border-blue-500" : "bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400 focus:border-blue-500"}`}
              />
              <button className="bg-blue-600 hover:bg-blue-700 text-slate-900 font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm cursor-pointer whitespace-nowrap shadow-md">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        <div className="w-full flex justify-center pt-8 pb-4 relative overflow-hidden border-t border-slate-200/20">
          <span
            className={`text-[10vw] font-black tracking-tighter leading-[0.8] select-none pointer-events-none ${darkMode ? "text-white/40" : "text-slate-900/40"}`}
          >
            Micro Intern
          </span>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col items-center gap-4 mt-8">
          <div className="flex flex-wrap justify-center gap-6">
            {["Terms of Service", "Privacy Policy", "Cookie Policy"].map((policy) => (
              <button
                key={policy}
                type="button"
                onClick={() =>
                  setActivePolicyModal(
                    policy === "Terms of Service"
                      ? "terms"
                      : policy === "Privacy Policy"
                        ? "privacy"
                        : "cookie",
                  )
                }
                className={`text-xs hover:underline transition-colors cursor-pointer font-medium ${darkMode ? "text-slate-500 hover:text-slate-300" : "text-slate-500 hover:text-slate-900"}`}
              >
                {policy}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-center">
            <p className={`text-xs font-medium ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
              Copyright &copy; 2026 Micro Intern Inc. All rights reserved.
            </p>
            <span className="hidden sm:inline text-slate-400">&bull;</span>
            <p className={`text-xs font-medium ${darkMode ? "text-slate-500" : "text-slate-500"}`}>
              A product of{" "}
              <a
                href="https://rmjit.com"
                target="_blank"
                rel="noopener noreferrer"
                className={`hover:underline font-semibold transition-colors ${darkMode ? "text-slate-300" : "text-slate-700"}`}
              >
                RMJ IT solution
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Policy Modal */}
      {activePolicyModal && (
        <div
          role="presentation"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActivePolicyModal(null)}
        >
          <div className="absolute inset-0 bg-slate-50/60 backdrop-blur-sm" />
          <div
            role="presentation"
            className={`relative rounded-3xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden border ${darkMode ? "bg-white border-slate-200 text-slate-900" : "bg-white border-slate-200 text-slate-900"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center justify-between px-7 py-5 border-b ${darkMode ? "border-slate-200 bg-slate-100" : "border-slate-200 bg-slate-50"}`}
            >
              <h2 className="text-lg font-bold">
                {activePolicyModal === "privacy"
                  ? "Privacy Policy"
                  : activePolicyModal === "terms"
                    ? "User Agreement & Terms of Service"
                    : "Cookie Policy"}
              </h2>
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${darkMode ? "hover:bg-slate-100" : "hover:bg-slate-200"}`}
              >
                ✕
              </button>
            </div>
            <div className="overflow-y-auto px-7 py-5 text-sm leading-relaxed space-y-4">
              <p className="opacity-80">
                This is a placeholder for the full policy document. In a production environment,
                this would contain the complete legal text for {activePolicyModal}.
              </p>
            </div>
            <div
              className={`px-7 py-4 border-t ${darkMode ? "border-slate-200 bg-slate-100" : "border-slate-200 bg-slate-50"}`}
            >
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer ${darkMode ? "bg-white text-black hover:bg-gray-200" : "bg-slate-900 text-white hover:bg-slate-800"}`}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mini Sparkle Icon for Hero
const SparklesIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 20C10 15.5817 6.41828 12 2 12C6.41828 12 10 8.41828 10 4C10 8.41828 13.5817 12 18 12C13.5817 12 10 15.5817 10 20Z"
      fill="currentColor"
    />
    <path
      d="M19 18C19 16.3431 17.6569 15 16 15C17.6569 15 19 13.6569 19 12C19 13.6569 20.3431 15 22 15C20.3431 15 19 16.3431 19 18Z"
      fill="currentColor"
    />
  </svg>
);
