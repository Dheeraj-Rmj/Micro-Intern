"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

const API_BASE_URL = process.env["NEXT_PUBLIC_API_URL"] ?? "http://localhost:5001";

export function OAuthButtons({ action = "login" }: { action?: "login" | "signup" }) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthLogin = (provider: "linkedin" | "microsoft" | "google" | "github") => {
    setLoadingProvider(provider);
    window.location.href = `${API_BASE_URL}/api/v1/auth/${provider}?action=${action}`;
  };

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => handleOAuthLogin("linkedin")}
        disabled={loadingProvider !== null}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition-all hover:border-slate-700 hover:bg-slate-800/80 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loadingProvider === "linkedin" ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        ) : (
          <svg
            className="h-5 w-5 fill-current text-[#0A66C2]"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2v-8.37H6.46M7.83 6.67a1.67 1.67 0 0 0-1.67 1.66 1.67 1.67 0 0 0 1.67 1.67 1.67 1.67 0 0 0 1.67-1.67 1.67 1.67 0 0 0-1.67-1.66Z" />
          </svg>
        )}
        <span>Continue with LinkedIn</span>
      </button>

      <button
        type="button"
        onClick={() => handleOAuthLogin("microsoft")}
        disabled={loadingProvider !== null}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-md transition-all hover:border-slate-700 hover:bg-slate-800/80 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loadingProvider === "microsoft" ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
        ) : (
          <svg
            className="h-5 w-5"
            viewBox="0 0 23 23"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path fill="#f35325" d="M1 1h10v10H1z" />
            <path fill="#81bc06" d="M12 1h10v10H12z" />
            <path fill="#05a6f0" d="M1 12h10v10H1z" />
            <path fill="#ffba08" d="M12 12h10v10H12z" />
          </svg>
        )}
        <span>Continue with Microsoft</span>
      </button>
    </div>
  );
}
