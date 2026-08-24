const fs = require("fs");
const path = require("path");

const files = [
  "apps/web/src/components/microint/components/auth/SignInPage.tsx",
  "apps/web/src/components/microint/components/auth/SignUpPage.tsx",
];

files.forEach((file) => {
  const fullPath = path.resolve(__dirname, file);
  if (!fs.existsSync(fullPath)) {
    console.error("File not found:", fullPath);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");

  // Replace Lime Green with Gold for backgrounds and text
  // We use dark:bg-[#C5F015] so it stays lime in dark mode, but Gold in light mode
  content = content.replace(/bg-\[#C5F015\]/g, "bg-[#D4AF37] dark:bg-[#C5F015]");
  content = content.replace(/text-\[#C5F015\]/g, "text-[#D4AF37] dark:text-[#C5F015]");

  // For text inside the gold button, we need text-white in light mode, text-black in dark mode
  // But wait! If light mode button is Gold, text-white looks good. If dark mode button is Lime, text-black looks good.
  // Actually, I'll just change the button text colors if they are explicitly text-black or text-white.
  content = content.replace(/text-black font-medium/g, "text-white dark:text-black font-medium");
  content = content.replace(
    /text-black dark:text-white font-semibold/g,
    "text-white dark:text-black font-semibold",
  );
  content = content.replace(
    /text-black font-bold py-3.5/g,
    "text-white dark:text-black font-bold py-3.5",
  );

  // Change the light mode background to pure white instead of gray
  content = content.replace(/bg-\[#F1F2F4\]/g, "bg-white");

  fs.writeFileSync(fullPath, content, "utf8");
  console.log("Patched colors in", file);
});
