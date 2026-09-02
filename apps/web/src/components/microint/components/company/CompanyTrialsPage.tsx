"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { companyApi } from "../../../../lib/api/company";
import {
  Sparkles,
  Plus,
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  Lock,
  Building2,
  FileText,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
} from "lucide-react";

interface CompanyTrialItem {
  id: string;
  title: string;
  category: string;
  stipend: string;
  applicantsCount: number;
  status: "ACTIVE" | "DRAFT" | "COMPLETED";
  deadline: string;
}

export const CompanyTrialsPage: React.FC = () => {
  const { showToast } = useApp();
  const [trials, setTrials] = useState<CompanyTrialItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const result = await companyApi.getAssessments();
        const list = result?.assessments ?? [];
        if (list.length > 0) {
          const mapped: CompanyTrialItem[] = list.map((a: any) => ({
            id: a.id,
            title: a.title,
            category: a.category || a.skillsRequired?.[0] || "General",
            stipend: "Merit-Based",
            applicantsCount: 0,
            status: (
              a.status === "PUBLISHED" ? "ACTIVE"
              : a.status === "ARCHIVED" ? "COMPLETED"
              : "DRAFT"
            ) as CompanyTrialItem["status"],
            deadline: a.publishedAt
              ? `Since ${new Date(a.publishedAt).toLocaleDateString()}`
              : "Pending",
          }));
          setTrials(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch assessments:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssessments();
  }, []);

  const handleAction = async (id: string, action: "publish" | "archive" | "delete") => {
    try {
      if (action === "publish") {
        await companyApi.publishAssessment(id);
        setTrials((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "ACTIVE" } : t))
        );
        showToast("Success", "Skill trial published successfully.", "success");
      } else if (action === "archive") {
        await companyApi.archiveAssessment(id);
        setTrials((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: "COMPLETED" } : t))
        );
        showToast("Success", "Skill trial hidden successfully.", "success");
      } else if (action === "delete") {
        await companyApi.deleteAssessment(id);
        setTrials((prev) => prev.filter((t) => t.id !== id));
        showToast("Success", "Skill trial deleted successfully.", "success");
      }
    } catch (err) {
      console.error(`Failed to ${action} assessment:`, err);
      showToast("Error", `Failed to ${action} skill trial.`, "error");
    }
  };

  const handleCreateTrial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Missing Title", "Please enter a skill trial title.", "warning");
      return;
    }

    // Optimistic local update
    const tempId = `temp-${Date.now()}`;
    const newTrial: CompanyTrialItem = {
      id: tempId,
      title,
      category,
      stipend: "Merit-Based",
      applicantsCount: 0,
      status: "DRAFT",
      deadline: "Pending",
    };
    setTrials((prev) => [newTrial, ...prev]);
    setTitle("");
    setShowCreateModal(false);

    try {
      const res = await companyApi.createAssessment({
        title,
        description: `${category} skill trial`,
        instructions: `Please complete this ${category} trial.`,
        skillsRequired: [category],
        durationMinutes: 120,
        passingScore: 70,
        isPublic: true,
        tasks: [
          {
            title: "Initial Assessment",
            description: `Complete the initial required steps for this ${category} trial.`,
            taskType: "SHORT_ANSWER",
            sortOrder: 1,
            maxPoints: 100,
          }
        ]
      });
      const created = res?.data;
      if (created?.id) {
        // Replace temp entry with real one
        setTrials((prev) =>
          prev.map((t) =>
            t.id === tempId ? { ...newTrial, id: created.id, status: "DRAFT" } : t,
          ),
        );
      }
      showToast(
        "Assessment Created",
        `"${title}" has been created. Publish it to make it live.`,
        "success",
      );
    } catch (err: any) {
      console.error(err);
      // Remove optimistic update on failure
      setTrials((prev) => prev.filter((t) => t.id !== tempId));
      const msg = err?.response?.data?.error?.message || err?.message || "Failed to save skill trial to backend.";
      showToast("Error", msg, "error");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-black/5 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-500 font-mono text-xs font-bold uppercase tracking-wider">
              ENTERPRISE TRIALS
            </span>
            <span className="text-xs font-mono text-black/50 dark:text-white/50">
              ENTERPRISE ORGANIZATION
            </span>
          </div>
          <h1 className="text-3xl font-bold font-serif text-black dark:text-white">
            Manage Skill Trials
          </h1>
          <p className="text-sm text-black/60 dark:text-white/70 mt-1">
            Create practical skill trials to discover top engineering and design talent.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Skill Trial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm">
          <p className="text-xs text-black/50 dark:text-white/60 font-medium">
            Active Skill Trials
          </p>
          <p className="text-3xl font-serif font-bold text-black dark:text-white mt-1">
            {trials.length}
          </p>
        </div>
        <div className="p-6 rounded-[28px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm">
          <p className="text-xs text-black/50 dark:text-white/60 font-medium">
            Trial Completion Rate
          </p>
          <p className="text-3xl font-serif font-bold text-emerald-500 mt-1">94.2%</p>
        </div>
      </div>

      <div className="space-y-4">
        {trials.map((t) => (
          <div
            key={t.id}
            className="p-7 rounded-[32px] bg-white dark:bg-[#0A0A0A] border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all space-y-4 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-black/5 dark:bg-white/5 font-mono text-xs font-bold text-black/70 dark:text-white/70">
                {t.category}
              </span>
              <span
                className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold ${
                  t.status === "ACTIVE"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                }`}
              >
                {t.status}
              </span>
            </div>

            <h3 className="text-xl font-bold font-serif text-black dark:text-white">{t.title}</h3>

            <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5 text-xs text-black/70 dark:text-white/70 font-mono">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-indigo-500" />
                <span>{t.applicantsCount} Candidates Applied</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-black/5 dark:border-white/5">
              {t.status === "DRAFT" || t.status === "COMPLETED" ? (
                <button
                  onClick={() => handleAction(t.id, "publish")}
                  className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-emerald-500/10 hover:text-emerald-500 text-black/70 dark:text-white/70 font-semibold text-xs transition-all flex items-center gap-1.5 flex-1 justify-center"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Publish / Unhide
                </button>
              ) : (
                <button
                  onClick={() => handleAction(t.id, "archive")}
                  className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-amber-500/10 hover:text-amber-500 text-black/70 dark:text-white/70 font-semibold text-xs transition-all flex items-center gap-1.5 flex-1 justify-center"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  Hide
                </button>
              )}
              <button
                onClick={() => handleAction(t.id, "delete")}
                className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-rose-500/10 hover:text-rose-500 text-black/70 dark:text-white/70 font-semibold text-xs transition-all flex items-center gap-1.5 justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md p-8 rounded-[36px] bg-white dark:bg-[#0A0A0A] border border-black/10 dark:border-white/10 shadow-2xl space-y-6 animate-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-serif font-bold text-black dark:text-white">
                Post New Enterprise Trial
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTrial} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-black/70 dark:text-white/80 mb-1">
                  Trial Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. AI Copilot UI Component / GraphQL Sync"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-xs text-black dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black/70 dark:text-white/80 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="e.g. Data Science, iOS Dev, Full Stack"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/10 dark:border-white/10 text-xs text-black dark:text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-black/10 dark:border-white/10 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all shadow-md cursor-pointer"
                >
                  Publish Trial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
