'use client';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Key,
  Mail,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  ShieldAlert,
  Building2,
  Lock,
} from 'lucide-react';

interface RecruiterSeat {
  id: string;
  name: string;
  email: string;
  roleTitle: string;
  assignedTrials: number;
  status: 'ACTIVE' | 'SUSPENDED';
  created: string;
}

const INITIAL_RECRUITERS: RecruiterSeat[] = [];
import { companyApi } from '../../../../lib/api/company';

export const CompanyRecruitersPage: React.FC = () => {
  const { showToast } = useApp();
  const [recruiters, setRecruiters] = useState<RecruiterSeat[]>([]);
  const [fullName, setFullName] = useState('');
  const [handle, setHandle] = useState('');
  const [roleTitle, setRoleTitle] = useState('Technical Recruiter');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await companyApi.getMembers();
        if (res.data?.members) {
          const mapped = res.data.members.map((m: any) => ({
            id: m.userId,
            name: m.userDetails?.firstName ? `${m.userDetails.firstName} ${m.userDetails.lastName}` : 'Pending User',
            email: m.userDetails?.email || `pending-${m.id}@company.microintern`,
            roleTitle: m.role,
            assignedTrials: 0,
            status: m.status || 'ACTIVE',
            created: new Date(m.joinedAt || m.createdAt).toLocaleDateString(),
          }));
          setRecruiters(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch members:', err);
        showToast('Error', 'Failed to load team members', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMembers();
  }, []);

  const handleGenerateLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !handle.trim()) {
      showToast('Missing Details', 'Please enter recruiter name and login handle.', 'warning');
      return;
    }

    const cleanedHandle = handle.toLowerCase().replace(/\s+/g, '.');
    const newEmail = `${cleanedHandle}@company.microintern`;

    try {
      const res = await companyApi.inviteMember(newEmail, roleTitle);
      
      const newRecruiter: RecruiterSeat = {
        id: res.data.userId || `REC-${Math.floor(100 + Math.random() * 900)}`,
        name: fullName,
        email: newEmail,
        roleTitle: roleTitle,
        assignedTrials: 0,
        status: 'ACTIVE',
        created: 'Just now',
      };

      setRecruiters([newRecruiter, ...recruiters]);
      setFullName('');
      setHandle('');
      setRoleTitle('Technical Talent Recruiter');

      showToast(
        'Recruiter Seat Created!',
        `Generated corporate credentials: ${newEmail}. Login password ready to copy.`,
        'success'
      );
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to invite team member', 'error');
    }
  };

  const handleCopyCredentials = (email: string) => {
    const textToCopy = `Login: ${email} | Password: MicroIntern#Recruit2026!`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedEmail(email);
    showToast('Credentials Copied', `Copied login ID & temp password for ${email}.`, 'success');
    setTimeout(() => setCopiedEmail(null), 2500);
  };

  const handleRevokeSeat = async (id: string, name: string) => {
    try {
      await companyApi.removeMember(id);
      setRecruiters((prev) => prev.filter((r) => r.id !== id));
      showToast('Recruiter Seat Revoked', `Access for ${name} has been terminated.`, 'info');
    } catch (err) {
      console.error(err);
      showToast('Error', 'Failed to remove team member', 'error');
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
              DOMAIN: @company.microintern
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-black dark:text-white">
            Manage Recruiter Accounts & Corporate Logins
          </h1>
          <p className="text-sm text-black/60 dark:text-white/70 mt-1">
            Generate and administer official MicroIntern recruiter credentials for your enterprise hiring team.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 font-mono text-xs">
          <Building2 className="w-4 h-4 text-amber-500" />
          <span className="text-black dark:text-white font-bold">ENTERPRISE ORGANIZATION</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Generate New Recruiter Login Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-7 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-5">
            <div className="flex items-center gap-2.5 border-b border-black/5 dark:border-white/10 pb-4">
              <UserPlus className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-serif text-black dark:text-white">
                Generate Recruiter Login
              </h2>
            </div>

            <form onSubmit={handleGenerateLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black/70 dark:text-white/80 mb-1">
                  Recruiter Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ananya Rao"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-xs text-black dark:text-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/70 dark:text-white/80 mb-1">
                  Login Handle (Domain: @company.microintern)
                </label>
                <div className="flex items-center rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 overflow-hidden">
                  <input
                    type="text"
                    placeholder="e.g. ananya.r"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full px-3 py-2.5 bg-transparent text-xs text-black dark:text-white focus:outline-none font-mono"
                  />
                  <span className="px-3 py-2.5 bg-black/5 dark:bg-white/5 text-[11px] font-mono font-bold text-amber-500 shrink-0">
                    @company.microintern
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/70 dark:text-white/80 mb-1">
                  Role Title
                </label>
                <select
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-xs text-black dark:text-white focus:outline-none"
                >
                  <option value="Technical Recruiter">Technical Recruiter</option>
                  <option value="Senior Engineering Recruiter">Senior Engineering Recruiter</option>
                  <option value="University & Bootcamp Lead">University & Bootcamp Lead</option>
                  <option value="AI Apprenticeship Director">AI Apprenticeship Director</option>
                </select>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-600 dark:text-amber-400 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Automated Credential Generation</span>
                </div>
                <p className="text-[11px] opacity-90">
                  New seat will automatically receive temporary access key <code className="font-mono">MicroIntern#Recruit2026!</code> and access to enterprise candidate pipelines.
                </p>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>Create & Authorize Recruiter Login</span>
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Active Recruiter Accounts List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/10 pb-5">
              <div>
                <h2 className="text-xl font-serif text-black dark:text-white">
                  Active Enterprise Recruiter Credentials ({recruiters.length})
                </h2>
                <p className="text-xs text-black/50 dark:text-white/60 mt-0.5">
                  Recruiters can log into MicroIntern with these credentials to evaluate applicants and issue offers.
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
