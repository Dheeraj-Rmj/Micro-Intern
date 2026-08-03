const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const componentsDir = path.resolve(__dirname, 'apps/web/src/components/microint');
const allFiles = walkSync(componentsDir);

let replaceCount = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Replace Tailwind hardcoded hex with CSS variable
  content = content.replace(/bg-\[#C5F015\]/g, 'bg-[var(--brand-primary)]');
  content = content.replace(/text-\[#C5F015\]/g, 'text-[var(--brand-primary)]');
  content = content.replace(/border-\[#C5F015\]/g, 'border-[var(--brand-primary)]');
  content = content.replace(/shadow-\[#C5F015\]/g, 'shadow-[var(--brand-primary)]');
  content = content.replace(/fill="#C5F015"/g, 'fill="var(--brand-primary)"');
  content = content.replace(/stroke="#C5F015"/g, 'stroke="var(--brand-primary)"');
  content = content.replace(/stopColor="#C5F015"/g, 'stopColor="var(--brand-primary)"');

  // Also replace any leftover dark:bg-[#C5F015] from the previous auth script
  content = content.replace(/dark:bg-\[#C5F015\]/g, 'bg-[var(--brand-primary)]');
  content = content.replace(/bg-\[#D4AF37\]/g, 'bg-[var(--brand-primary)]');
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    replaceCount++;
    console.log('Patched colors in', file.split('/').pop());
  }
});

console.log(`Finished patching colors. Modified ${replaceCount} files.`);
