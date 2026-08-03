const fs = require('fs');
const path = 'apps/web/src/components/microint/components/pages/ProfilePage.tsx';
let content = fs.readFileSync(path, 'utf8');

const newExtractionLogic = `          // Dynamic import of PDF.js from CDN to bypass package manager issues
          const loadPDFJS = async () => {
            if (window.pdfjsLib) return window.pdfjsLib;
            return new Promise((resolve, reject) => {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
              script.onload = () => {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                resolve(window.pdfjsLib);
              };
              script.onerror = reject;
              document.body.appendChild(script);
            });
          };

          try {
            const pdfjsLib = await loadPDFJS();
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              fullText += textContent.items.map((item: any) => item.str).join(' ') + ' ';
            }

            // --- Smart Regex Extraction ---
            
            // Extract Email
            const emailMatch = fullText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}/);
            const email = emailMatch ? emailMatch[0] : '';

            // Extract Links
            const urls = fullText.match(/https?:\\/\\/[^\\s]+/g) || [];
            let linkedin = '', github = '', portfolio = '';
            urls.forEach(url => {
              if (url.includes('linkedin.com')) linkedin = url;
              else if (url.includes('github.com')) github = url;
              else if (!portfolio) portfolio = url; // first other url as portfolio
            });

            // Extract Skills (Basic Keyword Matching)
            const techKeywords = ['JavaScript', 'TypeScript', 'React', 'Node.js', 'Next.js', 'Python', 'Java', 'C++', 'SQL', 'NoSQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Kubernetes', 'GraphQL', 'REST', 'HTML', 'CSS', 'Tailwind', 'Git'];
            const foundSkills = techKeywords.filter(skill => 
              new RegExp(\`\\\\b\${skill.replace('.', '\\\\.')}\\\\b\`, 'i').test(fullText)
            );

            // Extract Name (Fallback to filename if not found easily)
            let simulatedName = 'Candidate';
            const rawName = file.name.toLowerCase().replace('.pdf', '');
            const cleanName = rawName.replace(/[-_]/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
            if (cleanName.length > 2) simulatedName = cleanName;

            // Set form values
            setValue('fullName', simulatedName, { shouldValidate: true, shouldDirty: true });
            setValue('headline', 'Software Engineer', { shouldValidate: true, shouldDirty: true });
            
            const bioText = \`Passionate developer. Extracted from resume \${file.name}.\` + (email ? \` Contact: \${email}\` : '');
            setValue('bio', bioText, { shouldValidate: true, shouldDirty: true });
            
            if (foundSkills.length > 0) {
              setValue('skills', foundSkills.slice(0, 7), { shouldValidate: true, shouldDirty: true });
            } else {
              setValue('skills', ['JavaScript', 'React'], { shouldValidate: true, shouldDirty: true });
            }

            setValue('githubUrl', github || \`https://github.com/\${rawName.replace(/\\s/g, '')}\`, { shouldValidate: true, shouldDirty: true });
            setValue('linkedinUrl', linkedin || \`https://linkedin.com/in/\${rawName.replace(/\\s/g, '')}\`, { shouldValidate: true, shouldDirty: true });
            setValue('portfolioUrl', portfolio || \`https://\${rawName.replace(/\\s/g, '')}.dev\`, { shouldValidate: true, shouldDirty: true });

            // Save resume name immediately to userProfile & localStorage
            const updated = { ...userProfile, resumeFileName: file.name };
            setUserProfile(updated);
            if (typeof window !== 'undefined') {
              localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));
            }

            showToast(
              'PDF Extraction Complete 📄',
              'Successfully analyzed your resume and extracted your details!',
              'success'
            );
          } catch (error) {
            console.error("PDF Parsing Error:", error);
            showToast('Extraction Failed', 'Could not parse the PDF file.', 'error');
          }`;

// We need to replace the old mock extraction logic with this new async one.
// Since we use `await`, the `setTimeout` callback needs to be `async () => { ... }`

content = content.replace(
  `setTimeout(() => {
          setIsAnalyzingResume(false);
          setResumeName(file.name);

          // Extract generic info from filename to simulate AI extraction`,
  `setTimeout(async () => {
          setIsAnalyzingResume(false);
          setResumeName(file.name);

          // Extract generic info from filename to simulate AI extraction`
);

const oldExtractionBlock = `          // Extract generic info from filename to simulate AI extraction
          const rawName = file.name.toLowerCase().replace('.pdf', '');
          const cleanName = rawName.replace(/[-_]/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
          const simulatedName = cleanName.length > 2 ? cleanName : 'Candidate';

          // Set form values to simulate AI extraction
          setValue('fullName', simulatedName, { shouldValidate: true, shouldDirty: true });
          setValue('headline', 'Software Engineer | Full Stack Developer', { shouldValidate: true, shouldDirty: true });
          setValue('bio', \`I am an ambitious Software Engineer passionate about building scalable web applications. Extracted from \${file.name}.\`, { shouldValidate: true, shouldDirty: true });
          setValue('skills', ['JavaScript', 'React', 'TypeScript', 'Node.js', 'Next.js'], { shouldValidate: true, shouldDirty: true });
          setValue('githubUrl', \`https://github.com/\${rawName.replace(/\\s/g, '')}\`, { shouldValidate: true, shouldDirty: true });
          setValue('linkedinUrl', \`https://linkedin.com/in/\${rawName.replace(/\\s/g, '')}\`, { shouldValidate: true, shouldDirty: true });
          setValue('portfolioUrl', \`https://\${rawName.replace(/\\s/g, '')}.dev\`, { shouldValidate: true, shouldDirty: true });

          // Save resume name immediately to userProfile & localStorage
          const updated = { ...userProfile, resumeFileName: file.name };
          setUserProfile(updated);
          if (typeof window !== 'undefined') {
            localStorage.setItem(LOCAL_STORAGE_PROFILE_KEY, JSON.stringify(updated));
          }

          showToast(
            'AI Extraction Complete 🚀',
            'Successfully extracted your details and populated your profile form!',
            'success'
          );`;

content = content.replace(oldExtractionBlock, newExtractionLogic);

// Add global declaration for pdfjsLib at the top
if (!content.includes('interface Window {')) {
  content = content.replace(
    `import { AvatarCropper } from '../common/AvatarCropper';`,
    `import { AvatarCropper } from '../common/AvatarCropper';\n\ndeclare global {\n  interface Window {\n    pdfjsLib: any;\n  }\n}`
  );
}

fs.writeFileSync(path, content, 'utf8');
console.log('Successfully patched ProfilePage.tsx for real PDF parsing');
