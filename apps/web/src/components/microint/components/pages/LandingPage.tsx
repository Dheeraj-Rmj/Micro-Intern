'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { LandingNavbar } from '../landing/LandingNavbar';
import { LandingFooter } from '../landing/LandingFooter';
import { FAQ_ITEMS } from '../../data/mockData';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Code2,
  BrainCircuit,
  Award,
  Zap,
  CheckCircle2,
  ChevronDown,
  UserPlus,
  UserCheck,
  Compass,
  Send,
  BarChart3,
  Rocket,
  Mail,
  MessageSquare,
  Building2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setCurrentRoute, showToast } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast('Missing Fields', 'Please fill in all contact fields.', 'warning');
      return;
    }
    showToast('Message Sent!', 'Thank you for reaching out. Our candidate support team will get back to you shortly.', 'success');
    setContactName('');
    setContactEmail('');
    setContactMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-purple-500 selection:text-white">
      <LandingNavbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section id="hero" className="relative pt-16 md:pt-24 pb-20 md:pb-32 overflow-hidden">
          {/* Background Ambient Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold mb-6 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Version 1.0 Candidate Platform</span>
            </div>

            {/* Exact Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto">
              Prove Your Skills.{' '}
              <span className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500 bg-clip-text text-transparent block sm:inline mt-2 sm:mt-0">
                Not Just Your Resume.
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              MicroIntern empowers developers and designers to prove real capability through 2–5 day company skill trials. Showcase working code, earn a verified Trust Score, and unlock paid tech internships.
            </p>

            {/* Hero CTAs: Get Started and Sign In */}
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setCurrentRoute('signup')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-base shadow-xl shadow-purple-600/30 transition-all cursor-pointer flex items-center justify-center gap-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setCurrentRoute('signin')}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-base shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Code2 className="w-5 h-5 text-purple-600" />
                <span>Sign In</span>
              </button>
            </div>

            {/* Platform Metrics */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-10 border-t border-slate-200/80 dark:border-slate-800/80">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">250+</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Active Skill Trials</p>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">94 / 100</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Average Candidate Trust</p>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">$850</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Avg Trial Stipend</p>
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">12 Days</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Fast-Track Payout & Offers</p>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-16 md:py-24 bg-white dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">
                Candidate Journey
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">How It Works</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                A simple 6-step flow designed to take you from candidate registration to verified employment.
              </p>
            </div>

            {/* 6 Steps Flow */}
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                {
                  step: 1,
                  title: 'Create Account',
                  desc: 'Sign up in seconds as a Candidate with your email or social login.',
                  icon: UserPlus,
                },
                {
                  step: 2,
                  title: 'Complete Your Profile',
                  desc: 'Add your skills, university, bio, GitHub, and portfolio links.',
                  icon: UserCheck,
                },
                {
                  step: 3,
                  title: 'Discover Skill Trials',
                  desc: 'Browse real company tasks matched to your preferred technology stack.',
                  icon: Compass,
                },
                {
                  step: 4,
                  title: 'Submit Work',
                  desc: 'Execute solution code in your workspace and submit deliverables before deadline.',
                  icon: Send,
                },
                {
                  step: 5,
                  title: 'Get Evaluated',
                  desc: 'Automated static analysis evaluates code hygiene, functionality, and performance.',
                  icon: BarChart3,
                },
                {
                  step: 6,
                  title: 'Build Your Career',
                  desc: 'Earn guaranteed stipends, unlock achievement badges, and receive internship offers.',
                  icon: Rocket,
                },
              ].map((item, index, arr) => {
                const Icon = item.icon;
                return (
                  <React.Fragment key={item.step}>
                    <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-start gap-4 hover:border-purple-300 dark:hover:border-purple-800 transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-lg flex-shrink-0 shadow-md shadow-purple-600/20">
                        {item.step}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    {index < arr.length - 1 && (
                      <div className="flex justify-center py-1">
                        <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-sm">
                          ↓
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-16 md:py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">
                Candidate Toolkit
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Platform Features</p>
              <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                Built from the ground up for candidates to showcase practical execution skills.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-600/20 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Skill Trial Engine</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Real engineering tasks designed by top tech teams simulating actual day-to-day feature development.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-600/20 group-hover:scale-110 transition-transform">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Interactive Workspace</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Upload source files, view instructions, track deadline timers, and execute static code checks right in your browser.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mb-6 shadow-md shadow-emerald-600/20 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">Verified Trust Score</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Earn a dynamic Trust Score (0–100) reflecting verified code submissions, completion rates, and benchmark performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section id="about" className="py-16 md:py-24 bg-purple-900 text-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="px-3.5 py-1 rounded-full bg-purple-800 text-purple-200 text-xs font-bold uppercase tracking-wider">
                  About MicroIntern
                </span>
                <h2 className="text-3xl sm:text-5xl font-extrabold mt-4 leading-tight">
                  No Resume Noise. Just Pure Proof of Talent.
                </h2>
                <p className="mt-4 text-purple-200 text-sm sm:text-base leading-relaxed">
                  MicroIntern was built on a simple premise: paper resumes fail to capture true technical potential. We replace ATS keyword filters with real-world, 2–5 day micro-internship trials. Candidates write actual code, complete tasks, and earn stipends regardless of school pedigree.
                </p>

                <div className="mt-8 space-y-4 text-sm font-medium">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>Equal opportunity evaluation based on code quality</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>Guaranteed stipend payouts for verified submissions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <span>Direct fast-track invitations to paid full-time internships</span>
                  </div>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => setCurrentRoute('signup')}
                    className="px-6 py-3.5 rounded-xl bg-white text-purple-950 font-bold text-sm shadow-xl hover:bg-purple-50 transition-all cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Join Candidate Community</span>
                    <ArrowRight className="w-4 h-4 text-purple-950" />
                  </button>
                </div>
              </div>

              {/* Trust Score Card Preview */}
              <div className="bg-slate-900/90 border border-purple-700/50 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-600 flex items-center justify-center font-bold text-white">
                      TS
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Verified Candidate Engine</h4>
                      <p className="text-xs text-slate-400">MicroIntern Trust Analytics</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                    94 / 100
                  </span>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Trial Completion Velocity</span>
                    <span className="font-bold text-white">100% (4/4 Completed)</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full w-full" />
                  </div>

                  <div className="flex items-center justify-between text-xs pt-2">
                    <span className="text-slate-400">Code Architecture & Syntax</span>
                    <span className="font-bold text-white">98% passing score</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-400 h-full w-[98%]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACT SECTION */}
        <section id="contact" className="py-16 md:py-24 bg-white dark:bg-slate-900/40 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">
                Get In Touch
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Candidate Support & Enquiries</p>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                Have questions about skill trial submissions, stipends, or profile setup? Send us a message!
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. Alex Vance"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Your Email</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="alex@university.edu"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-1">Message</label>
                <textarea
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="How can we help you with candidate skill trials?"
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* FAQ SECTION */}
        <section id="faq" className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-2">
                Got Questions?
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold tracking-tight">Frequently Asked Questions</p>
            </div>

            <div className="space-y-4">
              {FAQ_ITEMS.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full p-5 text-left flex items-center justify-between font-bold text-sm sm:text-base cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <span>{item.q}</span>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
                  </button>
                  {openFaq === index && (
                    <div className="px-5 pb-5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-3">
                      {item.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
};
