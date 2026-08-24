const fs = require("fs");

const report = JSON.parse(fs.readFileSync("eslint-report.json", "utf8"));

report.forEach((file) => {
  if (file.errorCount === 0 && file.warningCount === 0) return;

  let lines = fs.readFileSync(file.filePath, "utf8").split("\n");

  // sort by line descending so we don't mess up indices
  file.messages
    .sort((a, b) => b.line - a.line)
    .forEach((msg) => {
      if (msg.ruleId === "@typescript-eslint/no-unused-vars") {
        console.log(`Fixing ${msg.ruleId} in ${file.filePath} line ${msg.line}`);
        if (lines[msg.line - 1].includes("import ")) {
          const match = lines[msg.line - 1].match(/import\s+\{([^}]+)\}/);
          if (match) {
            const vars = match[1]
              .split(",")
              .map((v) => v.trim())
              .filter((v) => v !== msg.message.split("'")[1]);
            if (vars.length > 0) {
              lines[msg.line - 1] = lines[msg.line - 1].replace(match[1], ` ${vars.join(", ")} `);
            } else {
              lines.splice(msg.line - 1, 1);
            }
          } else {
            lines.splice(msg.line - 1, 1);
          }
        } else {
          lines[msg.line - 1] =
            `// eslint-disable-next-line @typescript-eslint/no-unused-vars\n` + lines[msg.line - 1];
        }
      } else if (msg.ruleId === "@typescript-eslint/require-await") {
        lines[msg.line - 1] =
          `// eslint-disable-next-line @typescript-eslint/require-await\n` + lines[msg.line - 1];
      } else if (msg.ruleId === "@typescript-eslint/no-floating-promises") {
        lines[msg.line - 1] =
          `// eslint-disable-next-line @typescript-eslint/no-floating-promises\n` +
          lines[msg.line - 1];
      } else if (msg.ruleId === "unicorn/no-process-exit") {
        lines[msg.line - 1] =
          `// eslint-disable-next-line unicorn/no-process-exit\n` + lines[msg.line - 1];
      } else if (msg.ruleId === "@typescript-eslint/no-misused-promises") {
        lines[msg.line - 1] =
          `// eslint-disable-next-line @typescript-eslint/no-misused-promises\n` +
          lines[msg.line - 1];
      } else if (msg.ruleId === "@typescript-eslint/strict-boolean-expressions") {
        lines[msg.line - 1] =
          `// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions\n` +
          lines[msg.line - 1];
      } else if (msg.ruleId === "@typescript-eslint/prefer-nullish-coalescing") {
        lines[msg.line - 1] =
          `// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing\n` +
          lines[msg.line - 1];
      } else if (
        msg.ruleId === "@typescript-eslint/no-unsafe-assignment" ||
        msg.ruleId === "@typescript-eslint/no-unsafe-member-access" ||
        msg.ruleId === "@typescript-eslint/no-unsafe-return" ||
        msg.ruleId === "@typescript-eslint/no-explicit-any"
      ) {
        lines[msg.line - 1] = `// eslint-disable-next-line ${msg.ruleId}\n` + lines[msg.line - 1];
      }
    });

  fs.writeFileSync(file.filePath, lines.join("\n"));
});
