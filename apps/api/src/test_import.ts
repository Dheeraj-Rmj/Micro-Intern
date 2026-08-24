import { createContainer } from "./core/container.js";
import { createApp } from "./core/app.js";
createContainer();
console.log("createApp imported successfully");
createApp();
console.log("createApp executed successfully");
// eslint-disable-next-line unicorn/no-process-exit
process.exit(0);
