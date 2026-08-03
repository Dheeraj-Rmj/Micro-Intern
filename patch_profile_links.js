const fs = require('fs');
const path = 'apps/web/src/components/microint/components/pages/ProfilePage.tsx';
let content = fs.readFileSync(path, 'utf8');

const validationFunction = `            // Validate Link Helper
            const validateLink = async (url: string, type: 'github' | 'linkedin' | 'portfolio', expectedName: string) => {
              if (!url) return '';
              try {
                const res = await fetch('/api/validate-link', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ url, type, expectedName })
                });
                if (!res.ok) return url; // Fallback to returning URL if API crashes
                const data = await res.json();
                if (data.isValid) return url;
                
                // Show a small warning toast if link is fake
                showToast('Link Validation Failed', \`\${type} URL was found to be invalid or fake: \${data.reason}\`, 'warning');
                return '';
              } catch (e) {
                return url; // fallback to URL if network error
              }
            };
`;

const newLinkLogic = `${validationFunction}
            // Run validations concurrently for speed
            const [validGithub, validLinkedin, validPortfolio] = await Promise.all([
              validateLink(github || \`https://github.com/\${rawName.replace(/\\s/g, '')}\`, 'github', simulatedName),
              validateLink(linkedin || \`https://linkedin.com/in/\${rawName.replace(/\\s/g, '')}\`, 'linkedin', simulatedName),
              validateLink(portfolio || \`https://\${rawName.replace(/\\s/g, '')}.dev\`, 'portfolio', simulatedName)
            ]);

            if (validGithub) setValue('githubUrl', validGithub, { shouldValidate: true, shouldDirty: true });
            if (validLinkedin) setValue('linkedinUrl', validLinkedin, { shouldValidate: true, shouldDirty: true });
            if (validPortfolio) setValue('portfolioUrl', validPortfolio, { shouldValidate: true, shouldDirty: true });
`;

// Find where the old SetValue URLs are:
const oldLinkLogic = `            setValue('githubUrl', github || \`https://github.com/\${rawName.replace(/\\s/g, '')}\`, { shouldValidate: true, shouldDirty: true });
            setValue('linkedinUrl', linkedin || \`https://linkedin.com/in/\${rawName.replace(/\\s/g, '')}\`, { shouldValidate: true, shouldDirty: true });
            setValue('portfolioUrl', portfolio || \`https://\${rawName.replace(/\\s/g, '')}.dev\`, { shouldValidate: true, shouldDirty: true });`;

if (content.includes(oldLinkLogic)) {
    content = content.replace(oldLinkLogic, newLinkLogic);
    fs.writeFileSync(path, content, 'utf8');
    console.log('Successfully patched ProfilePage.tsx to use validation API');
} else {
    console.log('Could not find old link logic in ProfilePage.tsx');
}
