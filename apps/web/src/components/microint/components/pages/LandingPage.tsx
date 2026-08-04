'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, Twitter, Github, Linkedin, Instagram, Terminal, Cpu, LineChart, X } from 'lucide-react';
import { WordsPullUp } from '../common/animations/WordsPullUp';
import { WordsPullUpMultiStyle } from '../common/animations/WordsPullUpMultiStyle';
import { AnimatedLetter } from '../common/animations/AnimatedLetter';

export const LandingPage: React.FC = () => {
  const { setCurrentRoute } = useApp();
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [activePolicyModal, setActivePolicyModal] = useState<'terms' | 'privacy' | 'cookie' | null>(null);

  return (
    <div className="bg-black text-[#E1E0CC] min-h-screen selection:bg-[#DEDBC8] selection:text-black font-sans">
      {/* SECTION 1: HERO */}
      <section className="h-screen p-4 md:p-6 w-full">
        <div className="relative w-full h-full rounded-2xl md:rounded-[2rem] overflow-hidden bg-[#101010]">
          
          {/* Background Video */}
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover z-0 opacity-80"
            >
              <source src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4" type="video/mp4" />
            </video>
          
          {/* Noise and Gradient Overlays */}
          <div className="absolute inset-0 z-10 noise-overlay opacity-[0.7] mix-blend-overlay pointer-events-none" />
          <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/30 via-transparent to-black/60 pointer-events-none" />

          {/* Hanging Navbar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50">
            <nav className="bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8 flex items-center gap-3 sm:gap-6 md:gap-12 lg:gap-14 shadow-2xl">
              
              {/* Mi Logo */}
              <div 
                className="flex items-center cursor-pointer sm:pr-2 select-none" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                <img src="/MI.png" alt="Micro Intern Icon" className="h-6 sm:h-8 w-auto object-contain drop-shadow-md" />
              </div>
              
              <a
                href="#our story"
                className="text-[10px] sm:text-xs md:text-sm font-medium transition-colors cursor-pointer"
                style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
              >
                Our Story
              </a>
              
              <a
                href="#features"
                className="text-[10px] sm:text-xs md:text-sm font-medium transition-colors cursor-pointer"
                style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
              >
                Features
              </a>

              <a
                href="#faq"
                className="text-[10px] sm:text-xs md:text-sm font-medium transition-colors cursor-pointer"
                style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
              >
                FAQ
              </a>

              <div className="w-px h-4 bg-white/20 mx-2 hidden sm:block" />

              <button
                onClick={() => setCurrentRoute('signin')}
                className="group flex items-center bg-primary rounded-full pl-4 pr-1.5 py-1.5 text-black font-medium text-xs sm:text-sm transition-all hover:gap-2 cursor-pointer"
              >
                <span>Sign In</span>
                <div className="ml-3 bg-black rounded-full w-7 h-7 flex items-center justify-center transition-transform group-hover:scale-110">
                  <ArrowRight className="w-3.5 h-3.5 text-primary" />
                </div>
              </button>

            </nav>
          </div>

          {/* Hero Content */}
          <div className="absolute bottom-0 left-0 right-0 z-20 px-6 pb-8 md:px-12 md:pb-14">
            <div className="flex flex-col md:flex-row items-end justify-between gap-8">

              {/* Left: Large Tagline */}
              <motion.div
                initial={{ y: 40, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-3xl"
              >
                <h1
                  className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.1] text-white font-normal"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Evaluate By Building.<br />
                  <span className="italic" style={{ color: '#E1C87A' }}>Hire</span> By Code.
                </h1>
              </motion.div>

              {/* Right: Description + CTA */}
              <div className="flex flex-col items-start md:items-end text-left md:text-right shrink-0 max-w-sm">
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="text-primary/90 font-bold text-xs sm:text-sm md:text-base leading-[1.4] mb-6"
                >
                  Replace resumes and subjective interviews with 48-hour practical engineering trials. Evaluate candidates on actual production code before making a hire.
                </motion.p>

                <motion.button
                  onClick={() => setCurrentRoute('signup')}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.7, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  className="group flex items-center bg-primary rounded-full pl-6 pr-2 py-2 text-black font-medium text-sm sm:text-base transition-all hover:gap-3 hover:shadow-[0_0_30px_rgba(225,200,122,0.4)] cursor-pointer"
                >
                  <span>Join the platform</span>
                  <div className="ml-4 bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform group-hover:scale-110">
                    <ArrowRight className="w-4 h-4 text-primary" />
                  </div>
                </motion.button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: ABOUT */}
      <section id="our story" className="bg-black py-24 md:py-32 px-4 md:px-6">
        <div className="bg-[#101010] rounded-3xl md:rounded-[2.5rem] p-8 sm:p-12 md:p-20 flex flex-col items-center justify-center text-center max-w-6xl mx-auto">
          
          <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-8">
            AI Skill Trials
          </span>

          <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-4xl mx-auto leading-[0.95] sm:leading-[0.9]">
            <WordsPullUpMultiStyle 
              segments={[
                { text: "No whiteboards.", className: "font-normal" },
                { text: "No keyword filtering.", className: "font-serif italic font-normal px-2 text-[#DEDBC8]/90" },
                { text: "Just real engineering trials that prove what candidates can build.", className: "font-normal" }
              ]} 
              className="justify-center"
            />
          </div>

          <div className="mt-16 md:mt-24 max-w-2xl mx-auto">
            <AnimatedLetter 
              text="We work directly with engineering teams to design practical repository tasks. Candidates fix bugs, implement features, and submit pull requests in an isolated environment—giving companies objective proof of work."
              className="text-[#DEDBC8] text-xs sm:text-sm md:text-base md:text-lg leading-relaxed justify-center"
            />
          </div>
        </div>
      </section>

      {/* SECTION: ABOUT RMJ IT SOLUTION */}
      <section id="about" className="bg-black py-24 md:py-32 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="mb-16 md:mb-24 text-center">
            <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 block">
              About the Company
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal text-[#E1E0CC] leading-tight max-w-3xl mx-auto">
              MicroIntern is a proud project of{' '}
              <span className="italic text-primary font-serif">RMJ IT Solution</span>
            </h2>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left: Company Info */}
            <motion.div 
              whileHover={{ y: -6 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-white/25 rounded-3xl p-8 sm:p-10 flex flex-col justify-between transition-colors duration-500 backdrop-blur-xl"
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-8 shadow-[0_0_15px_rgba(225,200,122,0.15)]">
                  <span className="text-primary font-bold text-xl">R</span>
                </div>
                <h3 className="text-2xl font-medium text-[#E1E0CC] mb-4">RMJ IT Solution</h3>
                <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                  RMJ IT Solution builds software for technical teams and modern organizations. We focus on developer tooling, transparent evaluation pipelines, and practical applications that eliminate hiring friction.
                </p>
              </div>

            </motion.div>

            {/* Right: Vision + Cards */}
            <div className="flex flex-col gap-6">
              <motion.div 
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-white/25 rounded-3xl p-8 flex-1 transition-colors duration-500 backdrop-blur-xl"
              >
                <h4 className="text-[#E1E0CC] font-medium text-lg mb-3">Our Vision</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Traditional technical hiring relies on resumes and keyword filtering. RMJ IT Solution built MicroIntern to standardize work-sample evaluations—allowing engineering teams to evaluate talent on actual codebases rather than algorithmic puzzles.
                </p>
              </motion.div>
              <div className="grid grid-cols-2 gap-6">
                <motion.div 
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-white/25 rounded-3xl p-6 transition-colors duration-500 backdrop-blur-xl"
                >
                  <h4 className="text-primary font-bold text-lg mb-2">Automated Grading</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Automated test suites and code-review rubrics for fast, objective feedback.</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 hover:border-white/25 rounded-3xl p-6 transition-colors duration-500 backdrop-blur-xl"
                >
                  <h4 className="text-primary font-bold text-lg mb-2">Global Talent</h4>
                  <p className="text-gray-500 text-xs leading-relaxed">Open technical evaluations accessible to developers across 30+ countries.</p>
                </motion.div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURES */}
      <section id="features" className="relative min-h-screen bg-black py-24 md:py-32 px-4 md:px-6">
        {/* Subtle Noise Overlay for Features Section */}
        <div className="absolute inset-0 z-0 bg-noise opacity-[0.15] pointer-events-none" />
        {/* Ambient Radial LED Orb (Griffin / Arion Framer aesthetic) */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[350px] bg-gradient-to-tr from-primary/15 via-emerald-500/10 to-transparent blur-[140px] rounded-full pointer-events-none opacity-50" />

        <div className="relative z-10 max-w-[1400px] mx-auto">
          {/* Features Header */}
          <div className="mb-16 md:mb-24 px-4">
            <WordsPullUpMultiStyle 
              segments={[
                { text: "Standardized technical evaluations.", className: "text-[#E1E0CC] block mb-2" },
                { text: "Practical tasks. Objective verification.", className: "text-gray-500 block" }
              ]}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal tracking-tight"
            />
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 md:gap-1">
            
            {/* Card 1: Video Canvas */}
            <FeatureCard delay={0.15} className="lg:col-span-1 rounded-2xl md:rounded-3xl overflow-hidden relative h-[400px] lg:h-[480px]">
              <motion.img
                initial={{ scale: 1 }}
                animate={{ scale: 1.1 }}
                transition={{ duration: 15, repeat: Infinity, repeatType: 'reverse', ease: 'linear' }}
                className="absolute inset-0 w-full h-full object-cover"
                src="/images/feature_bg.png"
                alt="Feature Background"
              />
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute bottom-6 left-6 right-6">
                <p className="text-[#E1E0CC] font-medium text-lg">Your creative canvas.</p>
              </div>
            </FeatureCard>

            {/* Card 2: Real-world Scenarios */}
            <FeatureCard delay={0.3} className="bg-[#212121] rounded-2xl md:rounded-3xl p-8 flex flex-col h-[400px] lg:h-[480px]">
              <div className="mb-8 bg-primary/10 w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center">
                <Terminal className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-2xl text-[#E1E0CC] font-medium mb-6">Authentic Coding. <span className="text-gray-500 text-base">(01)</span></h3>
              <ul className="space-y-4 flex-1">
                {[
                  'Real-world engineering challenges',
                  'No generic algorithmic puzzles',
                  'In-browser fully equipped IDE',
                  'Automated testing & validation'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-sm leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button onClick={() => setSelectedFeature(1)} className="inline-flex items-center gap-2 text-[#E1E0CC] text-sm font-medium hover:text-white transition-colors group cursor-pointer">
                  Learn more <ArrowRight className="w-4 h-4 -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </FeatureCard>

            {/* Card 3: AI Evaluations */}
            <FeatureCard delay={0.45} className="bg-[#212121] rounded-2xl md:rounded-3xl p-8 flex flex-col h-[400px] lg:h-[480px]">
              <div className="mb-8 bg-primary/10 w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center">
                <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-2xl text-[#E1E0CC] font-medium mb-6">Smart Grading. <span className="text-gray-500 text-base">(02)</span></h3>
              <ul className="space-y-4 flex-1">
                {[
                  'Instant comprehensive scoring',
                  'Best practices & style analysis',
                  'Actionable feedback for candidates',
                  'Fair & unbiased evaluations'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-sm leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button onClick={() => setSelectedFeature(2)} className="inline-flex items-center gap-2 text-[#E1E0CC] text-sm font-medium hover:text-white transition-colors group cursor-pointer">
                  Learn more <ArrowRight className="w-4 h-4 -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </FeatureCard>

            {/* Card 4: Skill Analytics */}
            <FeatureCard delay={0.6} className="bg-[#212121] rounded-2xl md:rounded-3xl p-8 flex flex-col h-[400px] lg:h-[480px]">
              <div className="mb-8 bg-primary/10 w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center">
                <LineChart className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-2xl text-[#E1E0CC] font-medium mb-6">Actionable Insights. <span className="text-gray-500 text-base">(03)</span></h3>
              <ul className="space-y-4 flex-1">
                {[
                  'Verified candidate trust scores',
                  'Detailed benchmark comparisons',
                  'In-depth performance profiling',
                  'Streamlined hiring pipelines'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-gray-400 text-sm leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <button onClick={() => setSelectedFeature(3)} className="inline-flex items-center gap-2 text-[#E1E0CC] text-sm font-medium hover:text-white transition-colors group cursor-pointer">
                  Learn more <ArrowRight className="w-4 h-4 -rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>
              </div>
            </FeatureCard>

          </div>
        </div>
      </section>

      {/* SECTION 4: FAQ */}
      <section id="faq" className="bg-[#101010] py-24 md:py-32 px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-16 md:mb-24 text-center">
            <span className="text-primary text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-6 block">
              Clear The Ambiguity
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight text-[#E1E0CC]">
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
      <footer className="bg-black pt-20 pb-10 px-6 md:px-12 relative overflow-hidden">
        <div className="absolute inset-0 z-0 bg-noise opacity-[0.1] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-20">
          
          {/* Brand Col */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-black tracking-tight text-[#E1E0CC] mb-6">Micro Intern</h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
              Practical 48-hour work trials. We replace resumes with verified, production-ready code.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-[#E1E0CC] hover:border-[#E1E0CC] transition-all cursor-pointer">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-[#E1E0CC] hover:border-[#E1E0CC] transition-all cursor-pointer">
                <Github className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-[#E1E0CC] hover:border-[#E1E0CC] transition-all cursor-pointer">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-[#E1E0CC] hover:border-[#E1E0CC] transition-all cursor-pointer">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links Col 1 */}
          <div className="md:pl-4">
            <h4 className="text-white font-medium mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#features" className="text-gray-400 hover:text-[#E1E0CC] text-sm transition-colors cursor-pointer">Features</a></li>
              <li><a href="#our story" className="text-gray-400 hover:text-[#E1E0CC] text-sm transition-colors cursor-pointer">Our Story</a></li>
              <li><a href="#faq" className="text-gray-400 hover:text-[#E1E0CC] text-sm transition-colors cursor-pointer">FAQ</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#E1E0CC] text-sm transition-colors cursor-pointer">Pricing</a></li>
            </ul>
          </div>

          {/* Links Col 2 */}
          <div>
            <h4 className="text-white font-medium mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-400 hover:text-[#E1E0CC] text-sm transition-colors cursor-pointer">Documentation</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#E1E0CC] text-sm transition-colors cursor-pointer">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#E1E0CC] text-sm transition-colors cursor-pointer">Community</a></li>
              <li><a href="#" className="text-gray-400 hover:text-[#E1E0CC] text-sm transition-colors cursor-pointer">Help Center</a></li>
            </ul>
          </div>

          {/* Newsletter Col */}
          <div>
            <h4 className="text-white font-medium mb-6">Stay Updated</h4>
            <p className="text-gray-400 text-sm mb-4">Subscribe to our newsletter for the latest platform updates.</p>
            <div className="flex gap-2">
              <input type="email" placeholder="Enter your email" className="bg-white/5 rounded-lg px-4 py-2.5 text-sm w-full text-[#E1E0CC] focus:outline-none focus:border-[#E1E0CC] transition-colors" />
              <button className="bg-[#E1E0CC] hover:bg-white text-black font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm cursor-pointer whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        {/* GIANT LOGO */}
        <div className="relative z-10 w-full flex justify-center pt-12 pb-4 overflow-hidden">
          <span className="text-[12vw] font-black tracking-tighter leading-[0.8] text-[#E1E0CC] opacity-20 select-none pointer-events-none">
            MICRO INTERN
          </span>
        </div>

        {/* Copyright Bar */}
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mt-8">
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <p className="text-xs text-gray-600 font-medium">Copyright &copy; 2026 Micro Intern Inc. All rights reserved.</p>
            <span className="hidden sm:inline text-gray-700">&bull;</span>
            <p className="text-xs text-gray-500 font-medium">
              Micro Intern &mdash; A product of{' '}
              <a
                href="https://rmjit.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E1E0CC] hover:underline font-semibold transition-colors"
              >
                RMJ IT solution
              </a>
            </p>
          </div>
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => setActivePolicyModal('terms')}
              className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer font-medium"
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => setActivePolicyModal('privacy')}
              className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer font-medium"
            >
              Privacy Policy
            </button>
            <button
              type="button"
              onClick={() => setActivePolicyModal('cookie')}
              className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer font-medium"
            >
              Cookie Policy
            </button>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedFeature !== null && (
          <FeatureModal featureId={selectedFeature} onClose={() => setSelectedFeature(null)} />
        )}
      </AnimatePresence>

      {/* ── Policy Modal for Landing Page ── */}
      {activePolicyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setActivePolicyModal(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative rounded-[32px] shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden bg-[#181818] text-white border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-7 py-5 border-b border-white/10 bg-white/5">
              <h2 className="text-lg font-bold">
                {activePolicyModal === 'privacy'
                  ? 'Privacy Policy'
                  : activePolicyModal === 'terms'
                  ? 'User Agreement & Terms of Service'
                  : 'Cookie Policy'}
              </h2>
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="overflow-y-auto px-7 py-5 text-sm leading-relaxed space-y-4 text-white/90">
              <p className="text-xs font-semibold uppercase tracking-wider opacity-60">Effective: August 2025</p>
              {activePolicyModal === 'privacy' ? (
                <>
                  <div>
                    <h3 className="font-bold mb-1">1. Data Collection & Privacy</h3>
                    <p className="opacity-80">We collect account credentials and developer metrics solely to verify your AI Trust Score and match you with relevant micro-internships.</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">2. Zero Data Selling</h3>
                    <p className="opacity-80">Your profile and repository code are never sold to third-party data brokers. You retain control over which hiring partners can view your full resume.</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">3. Candidate Rights</h3>
                    <p className="opacity-80">You can request export or permanent deletion of your profile data at any time from your account settings.</p>
                  </div>
                </>
              ) : activePolicyModal === 'terms' ? (
                <>
                  <div>
                    <h3 className="font-bold mb-1">1. Professional Conduct & Authenticity</h3>
                    <p className="opacity-80">All skill trials and submissions must represent your own authentic work. Bots or plagiarism result in immediate credential revocation.</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">2. AI Credential Verification</h3>
                    <p className="opacity-80">Our AI evaluator inspects code quality and architecture to award verified Trust Scores. Scores are recalculated dynamically as you complete trials.</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">3. Intellectual Property</h3>
                    <p className="opacity-80">You retain full IP rights over open community trial projects unless explicitly governed by a sponsored enterprise agreement.</p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <h3 className="font-bold mb-1">1. Essential Cookies Only</h3>
                    <p className="opacity-80">MicroIntern uses secure session cookies to keep you authenticated and store local preferences (such as dark mode and zero-mock state).</p>
                  </div>
                  <div>
                    <h3 className="font-bold mb-1">2. No Ad Trackers</h3>
                    <p className="opacity-80">We do not use invasive third-party advertising cookies or cross-site marketing trackers.</p>
                  </div>
                </>
              )}
            </div>
            <div className="px-7 py-4 border-t border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => setActivePolicyModal(null)}
                className="w-full py-3 rounded-2xl font-bold text-sm bg-white text-black hover:bg-gray-200 transition-all cursor-pointer"
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

// Internal component for Feature Cards animation (Griffin / Arion Framer Spotlight Card)
const FeatureCard: React.FC<{ children: React.ReactNode; className?: string; delay: number }> = ({ children, className = '', delay }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ scale: 0.95, opacity: 0, y: 24 }}
      animate={isInView ? { scale: 1, opacity: 1, y: 0 } : { scale: 0.95, opacity: 0, y: 24 }}
      transition={{ delay, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden transition-colors duration-500 border border-white/10 hover:border-white/25 bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-xl ${className}`}
    >
      {/* Dynamic Cursor Spotlight Glow */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-500 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(225, 200, 122, 0.14), transparent 40%)`,
        }}
      />
      <div className="relative z-10 h-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

// Internal component for FAQ Items animation (Framer Motion spring accordion)
const FaqItem: React.FC<{ question: string, answer: string, delay: number }> = ({ question, answer, delay }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="py-6 md:py-8 border-b border-white/10 hover:border-white/25 transition-colors cursor-pointer group"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center gap-4">
        <h4 className="text-lg md:text-xl font-medium text-[#E1E0CC] group-hover:text-white transition-colors">{question}</h4>
        <motion.div 
          animate={{ rotate: isOpen ? 45 : 0 }} 
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }} 
          className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-primary group-hover:border-primary/50 group-hover:bg-primary/10 transition-colors shrink-0"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        </motion.div>
      </div>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, marginTop: isOpen ? 16 : 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="text-gray-400 text-sm md:text-base leading-relaxed pr-12">{answer}</p>
      </motion.div>
    </motion.div>
  );
};

const featureData = {
  1: {
    title: 'Authentic Coding',
    icon: Terminal,
    content: "Our Authentic Coding trials simulate real-world engineering environments. Rather than solving abstract algorithmic puzzles, candidates work in a fully equipped, browser-based IDE on actual project tasks. They'll write tests, debug, and push code in a version-controlled environment, giving you a true measure of how they'll perform on the job."
  },
  2: {
    title: 'Smart Grading',
    icon: Cpu,
    content: "The Smart Grading system utilizes cutting-edge AI to instantly evaluate code quality, logical correctness, and adherence to industry best practices. It goes beyond simple test passing to provide nuanced feedback, style analysis, and actionable insights. This ensures a fair, unbiased, and comprehensive evaluation of every candidate."
  },
  3: {
    title: 'Actionable Insights',
    icon: LineChart,
    content: "Gain deep visibility into your talent pipeline with our Actionable Insights dashboard. We provide verified Trust Scores, peer benchmark comparisons, and detailed performance profiling. These robust metrics empower your hiring team to make data-driven decisions quickly, confidently, and efficiently."
  }
};

const FeatureModal: React.FC<{ featureId: number, onClose: () => void }> = ({ featureId, onClose }) => {
  const feature = featureData[featureId as keyof typeof featureData];
  const Icon = feature?.icon;

  if (!feature) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer" 
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-[#101010] rounded-[2rem] p-8 md:p-12 w-full max-w-2xl relative z-10 shadow-2xl"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center transition-colors text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6 bg-primary/10 w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center">
          {Icon && <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />}
        </div>
        
        <h3 className="text-3xl sm:text-4xl text-[#E1E0CC] font-medium mb-6">{feature.title}</h3>
        <p className="text-gray-400 text-base sm:text-lg leading-relaxed mb-8">
          {feature.content}
        </p>

        <button 
          onClick={onClose}
          className="bg-primary text-black font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity cursor-pointer"
        >
          Got it
        </button>
      </motion.div>
    </div>
  );
};

