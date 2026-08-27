import "dotenv/config";
import { auth } from "../src/modules/auth/infrastructure/better-auth.js";

async function run() {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "testadmin@rmjit.com",
        password: "Password123!",
        name: "Test Admin",
        firstName: "Test",
        lastName: "Admin",
        role: "SUPER_ADMIN"
      }
    });
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
