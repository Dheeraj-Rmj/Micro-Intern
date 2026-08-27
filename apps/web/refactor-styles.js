const fs = require('fs');

const files = [
  'apps/web/src/components/microint/components/pages/NetworkPage.tsx',
  'apps/web/src/components/microint/components/pages/ProfilePage.tsx',
  'apps/web/src/components/microint/components/pages/DiscoverTrialsPage.tsx',
  'apps/web/src/components/microint/components/pages/MyApplicationsPage.tsx',
  'apps/web/src/components/microint/components/pages/SubmissionsPage.tsx',
  'apps/web/src/components/microint/components/pages/WorkspacePage.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    
    // Replace card backgrounds
    content = content.replace(/bg-white dark:bg-\[#0A0A0A\]/g, 'bg-white/60 backdrop-blur-xl');
    content = content.replace(/bg-white dark:bg-black/g, 'bg-white/60 backdrop-blur-xl');
    content = content.replace(/bg-white/g, 'bg-white/60 backdrop-blur-xl'); // blanket replace
    
    // Replace borders
    content = content.replace(/border-black\/5 dark:border-white\/10/g, 'border-white/50');
    content = content.replace(/border-gray-100 dark:border-white\/10/g, 'border-white/50');
    content = content.replace(/border-black\/10 dark:border-white\/10/g, 'border-white/50');
    
    // Replace text colors
    content = content.replace(/text-black dark:text-white/g, 'text-[#222]');
    content = content.replace(/text-black\/60 dark:text-white\/60/g, 'text-[#666]');
    content = content.replace(/text-black\/50 dark:text-white\/50/g, 'text-[#888]');
    content = content.replace(/text-gray-500 dark:text-gray-400/g, 'text-[#666]');
    content = content.replace(/text-gray-900 dark:text-white/g, 'text-[#222]');
    
    // Pill toggles
    content = content.replace(/bg-\[#111111\] dark:bg-white text-white dark:text-black/g, 'bg-[#333333] text-white');
    content = content.replace(/bg-black text-white dark:bg-white dark:text-black/g, 'bg-[#333333] text-white');
    
    // Remove all remaining dark mode classes
    content = content.replace(/dark:[a-z0-9-\/\[\]#]+/g, '');
    
    // Clean up multiple spaces left by replacing dark classes with empty string
    content = content.replace(/ +/g, ' ');
    content = content.replace(/ className=" "/g, ' className=""');

    fs.writeFileSync(file, content);
    console.log(`Refactored ${file}`);
  } else {
    console.log(`Not found: ${file}`);
  }
});
