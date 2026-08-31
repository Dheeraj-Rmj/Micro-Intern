"use client";
import React, { useState } from "react";
import { useApp } from "../../context/AppContext";
import {
  Users,
  Key,
  Mail,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  Building2,
} from "lucide-react";

interface RecruiterSeat {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  assignedTrials: number;
  status: "ACTIVE" | "SUSPENDED";
  created: string;
}
import { companyApi } from "../../../../lib/api/company";

export const CompanyRecruitersPage: React.FC = () => {
  const { showToast, companyProfile } = useApp();
  const [recruiters, setRecruiters] = useState<RecruiterSeat[]>([]);

  const companyDomain = companyProfile?.companyName
    ? companyProfile.companyName.toLowerCase().replace(/[^a-z0-9]/g, "") || "company"
    : "company";
  const companyEmailDomain = `${companyDomain}.microintern`;

  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMembers = React.useCallback(async () => {
    try {
      const res = await companyApi.getMembers();
      if (Array.isArray(res.data)) {
        const mapped = res.data
          // Only show RECRUITER-role members (exclude the COMPANY_OWNER themselves)
          .filter((m: any) => m.role === "RECRUITER")
          .map((m: any) => ({
            id: m.userId,
            name: m.userDetails?.firstName
              ? `${m.userDetails.firstName} ${m.userDetails.lastName}`
              : "Pending User",
            email: m.userDetails?.email || `pending-${m.id}@${companyEmailDomain}`,
            roleTitle: m.role,
            assignedTrials: 0,
            status: m.userDetails?.status || "ACTIVE",
            created: new Date(m.joinedAt || m.createdAt).toLocaleDateString(),
          }));
        setRecruiters(mapped);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
      showToast("Error", "Failed to load team members", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast, companyEmailDomain]);

  React.useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);


  const handleCopyCredentials = (email: string) => {
    const textToCopy = `Login: ${email} | Password: MicroIntern#Recruit2026!`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedEmail(email);
    showToast("Credentials Copied", `Copied login ID & temp password for ${email}.`, "success");
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleRevokeSeat = async (id: string, name: string) => {
    try {
      await companyApi.removeMember(id);
      setRecruiters((prev) => prev.filter((r) => r.id !== id));
      showToast("Recruiter Seat Revoked", `Access for ${name} has been terminated.`, "info");
    } catch (err) {
      console.error(err);
      showToast("Error", "Failed to remove team member", "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider">
              ENTERPRISE RECRUITER GOVERNANCE
            </span>
            <span className="text-xs font-mono text-black/50 dark:text-white/50">
              DOMAIN: @{companyEmailDomain}
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-black dark:text-white">
            Manage Recruiter Accounts & Corporate Logins
          </h1>
          <p className="text-sm text-black/60 dark:text-white/70 mt-1">
            Generate and administer official MicroIntern recruiter credentials for your enterprise
            hiring team.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 font-mono text-xs">
          <Building2 className="w-4 h-4 text-amber-500" />
          <span className="text-black dark:text-white font-bold">ENTERPRISE ORGANIZATION</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Right Column: Active Recruiter Accounts List */}
        <div className="lg:col-span-12 space-y-6">
          <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <h2 className="text-xl font-serif text-black dark:text-white">
                  Active Enterprise Recruiter Credentials ({recruiters.length})
                </h2>
                <p className="text-xs text-black/50 dark:text-white/60 mt-0.5">
                  Recruiters can log into MicroIntern with these credentials to evaluate applicants
                  and issue offers.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold">
                100% Domain Protected
              </span>
            </div>

            <div className="space-y-4">
              {recruiters.map((rec) => (
                <div
                  key={rec.id}
                  className="p-5 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/5 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-amber-500/30"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-base text-black dark:text-white">
                        {rec.name}
                      </span>
                      <span className="text-xs text-black/60 dark:text-white/60 font-medium">
                        — {rec.roleTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-amber-500" />
                      <span className="font-mono text-xs font-bold text-amber-500">
                        {rec.email}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-[11px] font-mono text-black/50 dark:text-white/50">
                      <span>Seat ID: {rec.id}</span>
                      <span>•</span>
                      <span>Assigned to {rec.assignedTrials} active skill trials</span>
                      <span>•</span>
                      <span>Created {rec.created}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={() => handleCopyCredentials(rec.email)}
                      className="px-4 py-2.5 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold text-xs hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      title="Copy Login Credentials & Temporary Password"
                    >
                      {copiedEmail === rec.email ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Login & Password</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleRevokeSeat(rec.id, rec.name)}
                      className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 transition-colors cursor-pointer"
                      title="Revoke Recruiter Access"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
