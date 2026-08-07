const fs = require('fs');
const path = require('path');

function fixRolePresentation(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all <div ... onClick={...} that don't have role="presentation"
  // It's easier to just find `onClick={` and ensure the parent has role="presentation" if it's a div.
  // We'll use a regex replacement. This matches <div ... onClick= and adds role="presentation"
  
  // Replace <div onClick with <div role="presentation" onClick
  content = content.replace(/<div\s+([^>]*?)onClick=/g, (match, p1) => {
    if (p1.includes('role=')) return match; // already has a role
    return `<div role="presentation" ${p1}onClick=`;
  });
  
  // Replace <span onClick with <span role="presentation" onClick
  content = content.replace(/<span\s+([^>]*?)onClick=/g, (match, p1) => {
    if (p1.includes('role=')) return match;
    return `<span role="presentation" ${p1}onClick=`;
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed roles in ${filePath}`);
}

const dashboardPath = 'c:\\Users\\vyshn\\Downloads\\Micro-Intern\\apps\\web\\src\\components\\microint\\components\\pages\\CandidateDashboard.tsx';
const landingPath = 'c:\\Users\\vyshn\\Downloads\\Micro-Intern\\apps\\web\\src\\components\\microint\\components\\pages\\LandingPage.tsx';

fixRolePresentation(dashboardPath);
fixRolePresentation(landingPath);
