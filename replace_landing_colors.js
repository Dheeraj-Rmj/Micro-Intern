const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, 'apps/web/src/components/microint/components/pages/LandingPage.tsx');

let content = fs.readFileSync(targetFile, 'utf8');

const replacements = [
  // Backgrounds
  { regex: /\bbg-black\b/g, replacement: 'bg-slate-50' },
  { regex: /bg-\[\#0A0A0A\]/g, replacement: 'bg-white' },
  { regex: /bg-\[\#101010\]/g, replacement: 'bg-slate-50' },
  { regex: /bg-\[\#1a1a1a\]/g, replacement: 'bg-white' },
  { regex: /bg-\[\#212121\]/g, replacement: 'bg-white border border-slate-200 shadow-sm' }, // FIX: Make cards light!
  { regex: /bg-white\/5/g, replacement: 'bg-slate-100' },
  { regex: /bg-white\/10/g, replacement: 'bg-slate-100' },
  { regex: /bg-white\/20/g, replacement: 'bg-slate-200' },
  
  // Text Colors
  { regex: /text-white\/60/g, replacement: 'text-slate-500' },
  { regex: /text-white\/80/g, replacement: 'text-slate-600' },
  { regex: /text-gray-400/g, replacement: 'text-slate-500' },
  { regex: /text-\[\#E1E0CC\]/g, replacement: 'text-slate-900' },
  { regex: /\btext-white\b/g, replacement: 'text-slate-900' },
  { regex: /text-\[\#DEDBC8\]/g, replacement: 'text-slate-700' },
  
  // Borders
  { regex: /border-white\/10/g, replacement: 'border-slate-200' },
  { regex: /border-white\/20/g, replacement: 'border-slate-200' },
  { regex: /border-\[\#E1E0CC\]/g, replacement: 'border-slate-300' },
  
  // Primary Accents (Gold -> Blue)
  { regex: /\btext-primary\b/g, replacement: 'text-blue-600' },
  { regex: /text-\[\#E1C87A\]/g, replacement: 'text-blue-600' },
  { regex: /\bbg-primary\b/g, replacement: 'bg-blue-600 !text-white' }, 
  { regex: /bg-primary\/10/g, replacement: 'bg-blue-50' },
  { regex: /bg-primary\/15/g, replacement: 'bg-blue-100' },
  { regex: /bg-primary\/20/g, replacement: 'bg-blue-100' },
  { regex: /border-primary\/30/g, replacement: 'border-blue-200' },
  { regex: /from-primary\/20/g, replacement: 'from-blue-100' },
  { regex: /to-primary\/5/g, replacement: 'to-blue-50' },
  { regex: /from-primary\/15/g, replacement: 'from-blue-100' },
  { regex: /shadow-\[0_0_15px_rgba\(225,200,122,0\.15\)\]/g, replacement: 'shadow-[0_4px_20px_rgba(37,99,235,0.15)]' },
  { regex: /shadow-\[0_0_30px_rgba\(225,200,122,0\.4\)\]/g, replacement: 'shadow-[0_8px_30px_rgba(37,99,235,0.4)]' },
  
  // Selection
  { regex: /selection:bg-\[\#DEDBC8\]/g, replacement: 'selection:bg-blue-200' },
  { regex: /selection:text-black/g, replacement: 'selection:text-blue-900' },
  
  // Inline styles specific to the LandingPage
  { regex: /style=\{\{ color: 'rgba\(225, 224, 204, 0\.8\)' \}\}/g, replacement: 'style={{ color: "#64748b" }}' },
  { regex: /onMouseEnter=\{\(e\) => \(e\.currentTarget\.style\.color = '\#E1E0CC'\)\}/g, replacement: 'onMouseEnter={(e) => (e.currentTarget.style.color = "#0f172a")}' },
  { regex: /onMouseLeave=\{\(e\) => \(e\.currentTarget\.style\.color = 'rgba\(225, 224, 204, 0\.8\)'\)\}/g, replacement: 'onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}' },
  { regex: /style=\{\{ color: '\#E1C87A' \}\}/g, replacement: 'style={{ color: "#2563eb" }}' }, 
];

for (const { regex, replacement } of replacements) {
  content = content.replace(regex, replacement);
}

// Special fixes for the Hero section so the text is visible over the video
// We want the tagline and description in the Hero section to remain white/gold!
// The tagline was "text-slate-900", let's change it back to white ONLY in the Hero section.
content = content.replace(/text-slate-900 font-normal"\n                  style=\{\{ fontFamily: "'Playfair Display', serif" \}\}\n                >\n                  Evaluate By Building.<br \/>\n                  <span className="italic" style=\{\{ color: "#2563eb" \}\}>Hire<\/span> By Code./g, 'text-white font-normal"\n                  style={{ fontFamily: "\'Playfair Display\', serif" }}\n                >\n                  Evaluate By Building.<br />\n                  <span className="italic" style={{ color: "#2563eb" }}>Hire</span> By Code.');

// Fix the paragraph in the hero section to be white
content = content.replace(/className="text-blue-600\/90 font-bold text-xs sm:text-sm md:text-base leading-\[1\.4\] mb-6"/g, 'className="text-white font-bold text-xs sm:text-sm md:text-base leading-[1.4] mb-6"');

// Fix the Hanging Navbar to be white
content = content.replace(/<nav className="bg-slate-50/g, '<nav className="bg-white');

// Fix the Hanging Navbar text link hovering so it is visible against white
content = content.replace(/style=\{\{ color: "#64748b" \}\}/g, 'style={{ color: "#64748b" }}');

// Fix the policy modal background which might have turned into white but with white text, or something.
// Just to be sure the policy modal is perfect:
content = content.replace(/bg-\[\#181818\]/g, 'bg-white');

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully applied accurate light theme colors to original LandingPage.tsx');
