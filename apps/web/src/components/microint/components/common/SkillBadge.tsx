import React from "react";
import { CheckCircle, Award, Shield } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export type SkillLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
export type SkillVerificationStatus = "CLAIMED" | "VERIFIED" | "CERTIFIED";

interface SkillBadgeProps {
  skill: string;
  level?: string;
  status: SkillVerificationStatus;
  className?: string;
}

export function SkillBadge({ skill, level, status, className = "" }: SkillBadgeProps) {
  // Determine styles and icons based on verification status
  let variantClass = "";
  let icon = null;
  let statusLabel = "";

  switch (status) {
    case "CERTIFIED":
      variantClass = "bg-gradient-to-r from-yellow-500 to-amber-600 text-white border-none shadow-sm";
      icon = <Award className="w-3.5 h-3.5 mr-1" />;
      statusLabel = "Certified";
      break;
    case "VERIFIED":
      variantClass = "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50";
      icon = <CheckCircle className="w-3.5 h-3.5 mr-1" />;
      statusLabel = "Verified";
      break;
    case "CLAIMED":
    default:
      variantClass = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
      icon = null;
      statusLabel = "Claimed";
      break;
  }

  return (
    <div title={`${skill} - ${statusLabel}${level ? ` (${level})` : ""}`}>
      <Badge 
        variant="outline" 
        className={`font-medium px-2.5 py-1 ${variantClass} ${className}`}
      >
        <div className="flex items-center">
          {icon}
          <span>{skill}</span>
          {level && (
            <span className="ml-1.5 opacity-70 text-[0.65rem] uppercase tracking-wider">
              • {level}
            </span>
          )}
        </div>
      </Badge>
    </div>
  );
}
