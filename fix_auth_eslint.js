const fs = require('fs');
const path = require('path');

function addRolePresentation(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Fix 1: <div ... onClick={...}> -> <div role="presentation" ... onClick={...}>
  content = content.replace(/<div\n(\s*)className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"/g, '<div\n$1role="presentation"\n$1className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"');

  // Fix 2: <div\n  className="relative rounded-[32px] ..."\n  onClick={(e) => e.stopPropagation()}\n>
  content = content.replace(/<div\n(\s*)className="relative rounded-\[32px\]/g, '<div\n$1role="presentation"\n$1className="relative rounded-[32px]');

  fs.writeFileSync(filePath, content, 'utf8');
}

addRolePresentation(path.join(__dirname, 'apps/web/src/components/microint/components/auth/SignInPage.tsx'));
addRolePresentation(path.join(__dirname, 'apps/web/src/components/microint/components/auth/SignUpPage.tsx'));
console.log('Fixed ESLint warnings in Auth pages.');
