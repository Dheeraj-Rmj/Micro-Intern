const fs = require("fs");
const path = require("path");

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const dirFile = path.join(dir, file);
    const dirent = fs.statSync(dirFile);
    if (dirent.isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith(".tsx") || dirFile.endsWith(".ts")) {
        filelist.push(dirFile);
      }
    }
  }
  return filelist;
};

const componentsDir = path.resolve(__dirname, "apps/web/src/components/microint");
const allFiles = walkSync(componentsDir);

let replaceCount = 0;

allFiles.forEach((file) => {
  let content = fs.readFileSync(file, "utf8");
  let originalContent = content;

  const opacities = ["5", "10", "20", "30", "40", "50", "60"];
  const prefixes = ["bg", "border", "shadow", "from", "text"];

  prefixes.forEach((prefix) => {
    opacities.forEach((op) => {
      const target = new RegExp(`${prefix}-\\[var\\(--brand-primary\\)\\]\\/${op}`, "g");
      const replacement = `${prefix}-[#D4AF37]/${op} dark:${prefix}-[#C5F015]/${op}`;
      content = content.replace(target, replacement);
    });
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, "utf8");
    replaceCount++;
    console.log("Patched opacities in", file.split("/").pop());
  }
});

console.log(`Finished patching opacities. Modified ${replaceCount} files.`);
