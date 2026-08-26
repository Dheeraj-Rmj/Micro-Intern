import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: process.env["NEXT_PUBLIC_API_URL"] ? `${process.env["NEXT_PUBLIC_API_URL"]}/api/v1/auth` : "https://micro-intern-4stz.onrender.com/api/v1/auth",
});
