"use client";
import React from "react";
import { useApp } from "../../context/AppContext";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbsProps {
  currentTitle: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentTitle }) => {
  const { currentRoute, setCurrentRoute, role } = useApp();

  const isCompany = role === "company" || currentRoute.startsWith("company-");

  return (
    <nav className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6 py-1">
      <button
        onClick={() => setCurrentRoute(isCompany ? "company-dashboard" : "dashboard")}
        className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer text-slate-900 dark:text-slate-100"
      >
        <Home className="w-3.5 h-3.5" />
        <span>{isCompany ? "Company Dashboard" : "Dashboard"}</span>
      </button>

      {currentTitle !== "Candidate Dashboard" && currentTitle !== "Company Dashboard" && (
        <>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <span className="text-slate-900 dark:text-slate-100 font-semibold">{currentTitle}</span>
        </>
      )}
    </nav>
  );
};
