const fs = require("fs");
const path = require("path");

const targetFile = path.join(
  __dirname,
  "apps/web/src/components/microint/components/pages/LandingPage.tsx",
);

let content = fs.readFileSync(targetFile, "utf8");

const replacements = [
  // Fix the Logo div to a button
  {
    regex:
      /<div \n                className="flex items-center cursor-pointer sm:pr-2 select-none" \n                onClick=\{\(\) => window.scrollTo\(\{ top: 0, behavior: 'smooth' \}\)\}\n              >/,
    replacement:
      '<button \n                type="button"\n                className="flex items-center cursor-pointer sm:pr-2 select-none" \n                onClick={() => window.scrollTo({ top: 0, behavior: \'smooth\' })}\n              >',
  },
  {
    regex:
      /<img src="\/MI.png" alt="Micro Intern Icon" className="h-6 sm:h-8 w-auto object-contain drop-shadow-md" \/>\n              <\/div>/,
    replacement:
      '{/* eslint-disable-next-line @next/next/no-img-element */}\n                <img src="/MI.png" alt="Micro Intern Icon" className="h-6 sm:h-8 w-auto object-contain drop-shadow-md" />\n              </button>',
  },

  // Fix the policy modal backdrops to have role="presentation"
  {
    regex:
      /<div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick=\{\(\) => setActivePolicyModal\(null\)\}>/,
    replacement:
      '<div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setActivePolicyModal(null)}>',
  },
  {
    regex:
      /<div\n            className="relative rounded-\[32px\] shadow-2xl w-full max-w-lg max-h-\[80vh\] flex flex-col overflow-hidden bg-\[\#181818\] text-slate-900 border border-slate-200"\n            onClick=\{\(e\) => e.stopPropagation\(\)\}\n          >/,
    replacement:
      '<div\n            role="presentation"\n            className="relative rounded-[32px] shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden bg-white text-slate-900 border border-slate-200"\n            onClick={(e) => e.stopPropagation()}\n          >',
  },

  // Fix the subscribe button
  {
    regex:
      /<button className="bg-\[\#E1E0CC\] hover:bg-white text-black font-semibold px-4 py-2\.5 rounded-lg transition-colors text-sm cursor-pointer whitespace-nowrap">/,
    replacement:
      '<button className="bg-slate-900 hover:bg-slate-800 text-white font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm cursor-pointer whitespace-nowrap">',
  },

  // Fix the pricing button or policy got it button
  {
    regex:
      /className="w-full py-3 rounded-2xl font-bold text-sm bg-white text-black hover:bg-gray-200 transition-all cursor-pointer"/g,
    replacement:
      'className="w-full py-3 rounded-2xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer"',
  },
];

for (const { regex, replacement } of replacements) {
  content = content.replace(regex, replacement);
}

fs.writeFileSync(targetFile, content, "utf8");
console.log("Successfully applied ESLint and button fixes to LandingPage.tsx");
