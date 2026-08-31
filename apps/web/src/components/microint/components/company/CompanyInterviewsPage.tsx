"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { interviewsApi, Interview } from "../../../../lib/api/interviews";
import {
  Sparkles,
  Plus,
  Users,
  CheckCircle2,
  Lock,
  Eye,
  Video,
  Clock,
} from "lucide-react";

export const CompanyInterviewsPage: React.FC = () => {
  const { showToast } = useApp();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(30);

  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const result = await interviewsApi.listInterviews();
        setInterviews(result?.data || []);
      } catch (err) {
        console.error("Failed to fetch interviews:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Missing Title", "Please enter an interview title.", "warning");
      return;
    }

    try {
      // Create a basic interview with 2 default AI questions for now
      const result = await interviewsApi.createInterview({
        companyId: "cl_default", // The backend extracts real ID from token usually, but typing needs something if mandatory
        title,
        description,
        timeLimitMins: timeLimit,
        passingScore: 70,
        questions: [
          {
            text: "Explain a complex technical problem you solved recently. How did you approach it?",
            category: "Behavioral",
            difficulty: "Medium",
            maxPoints: 50,
          },
          {
            text: "How do you ensure your code is maintainable and scalable?",
            category: "Technical",
            difficulty: "Hard",
            maxPoints: 50,
          }
        ]
      });

      if (result.data) {
        setInterviews((prev) => [result.data, ...prev]);
        showToast("Success", "AI Interview created successfully.", "success");
        setShowCreateModal(false);
        setTitle("");
        setDescription("");
      }
    } catch (err: any) {
      console.error(err);
      showToast("Error", "Failed to create AI Interview.", "error");
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await interviewsApi.publishInterview(id);
      setInterviews((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "PUBLISHED" } : i))
      );
      showToast("Success", "Interview published successfully.", "success");
    } catch (err) {
      console.error(err);
      showToast("Error", "Failed to publish interview.", "error");
    }
  };

  return (
    <div className="pb-12 text-[#222] max-w-[1200px] mx-auto w-full font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div>
          <h1 className="text-3xl sm:text-5xl tracking-tight font-serif font-normal text-[#222]">
            AI Interviews
          </h1>
          <p className="text-sm text-black/50 mt-2 max-w-xl">
            Configure automated AI interviews. Candidates will interact with AI agents
            who evaluate their responses based on your rubrics.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 rounded-full bg-[#111111] text-white font-bold text-sm hover:scale-105 transition-transform flex items-center gap-2 shadow-xl whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          Create AI Interview
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center text-black/40">Loading interviews...</div>
      ) : interviews.length === 0 ? (
        <div className="py-24 px-6 text-center rounded-[40px] bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm">
          <Video className="w-12 h-12 text-black/20 mx-auto mb-4" />
          <h3 className="text-2xl font-serif text-[#222]">No Interviews Configured</h3>
          <p className="text-sm text-black/50 max-w-sm mx-auto mt-2">
            Create an AI-driven interview to screen candidates automatically at scale.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-6 px-8 py-3 rounded-full bg-white text-[#222] border border-black/10 font-bold text-sm hover:bg-black/5 transition-colors"
          >
            Create First Interview
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <div
              key={interview.id}
              className="p-6 md:p-8 rounded-[40px] bg-white/60 backdrop-blur-xl border border-white/50 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md ${
                      interview.status === "PUBLISHED"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : "bg-amber-500/10 text-amber-600"
                    }`}
                  >
                    {interview.status}
                  </span>
                  <span className="text-[10px] font-bold text-black/40 uppercase flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {interview.timeLimitMins} MINS
                  </span>
                </div>
                <h3 className="text-2xl font-serif text-[#222]">
                  {interview.title}
                </h3>
                {interview.description && (
                  <p className="text-sm text-black/60 max-w-xl">
                    {interview.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs font-bold text-black/40 pt-2">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> {interview._count?.sessions || 0} Sessions
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {interview.status === "DRAFT" && (
                  <button
                    onClick={() => handlePublish(interview.id)}
                    className="px-6 py-2.5 rounded-full bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-colors shadow-sm flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Publish
                  </button>
                )}
                <button className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-black/60 hover:text-black hover:bg-black/10 transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="bg-white rounded-[40px] max-w-lg w-full p-8 shadow-2xl relative z-10">
            <h3 className="text-2xl font-serif text-[#222] mb-2">Create AI Interview</h3>
            <p className="text-sm text-black/50 mb-6">
              Configure a new automated interview. AI will generate dynamic follow-up questions.
            </p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-wider mb-2">
                  Interview Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Senior Frontend Engineer Technical Screen"
                  className="w-full px-4 py-3 rounded-2xl bg-black/5 border-none text-sm text-[#222] focus:ring-2 focus:ring-black/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for the candidate..."
                  className="w-full px-4 py-3 rounded-2xl bg-black/5 border-none text-sm text-[#222] focus:ring-2 focus:ring-black/20 min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-black/60 uppercase tracking-wider mb-2">
                  Time Limit (Minutes)
                </label>
                <input
                  type="number"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                  min="5"
                  className="w-full px-4 py-3 rounded-2xl bg-black/5 border-none text-sm text-[#222] focus:ring-2 focus:ring-black/20"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 rounded-full bg-black/5 text-[#222] font-bold text-sm hover:bg-black/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-full bg-[#111111] text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
