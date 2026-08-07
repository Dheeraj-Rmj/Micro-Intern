const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'apps/web/src');

const replacements = [
  { regex: /bg-\[#F3F2EA\]/g, replacement: 'bg-[#FAFAFA]' },
  { regex: /text-\[#111111\]/g, replacement: 'text-black' },
  { regex: /text-\[#E1E0CC\]/g, replacement: 'text-white' },
  { regex: /bg-\[#E1E0CC\]/g, replacement: 'bg-white' },
  { regex: /bg-\[#101010\]/g, replacement: 'bg-[#0A0A0A]' },
  { regex: /border-\[#E1E0CC\]/g, replacement: 'border-white/20' },
  { regex: /selection:bg-\[#DEDBC8\]/g, replacement: 'selection:bg-gray-200' },
  { regex: /selection:text-black/g, replacement: 'selection:text-gray-900' }
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let modified = false;

      for (const { regex, replacement } of replacements) {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      }

      if (modified) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

console.log('Starting color replacement...');
processDirectory(srcDir);
console.log('Done!');
