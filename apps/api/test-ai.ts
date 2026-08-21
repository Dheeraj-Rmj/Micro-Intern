import { createAIGateway } from './src/infrastructure/ai/index.js';

async function main() {
  console.log("Checking AI Gateway...");
  const engine = createAIGateway();
  const results = await engine.healthCheckAll();
  console.log(JSON.stringify(results, null, 2));
}

main().catch(console.error);
