"use client";
import React, { useState, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import { interviewsApi, InterviewSession, InterviewQuestion } from "../../../../lib/api/interviews";
import {
  Video,
  Clock,
  Send,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  AlertCircle
} from "lucide-react";

// For this example, we expect the parent/router to pass the sessionId as a prop or query param.
// Assuming we pull it from local state or route for now.
// Usually you'd use a router hook like useParams().
export const InterviewSessionPage: React.FC = () => {
  const { currentRoute, setCurrentRoute, showToast } = useApp();
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // In a real app with next/router, you'd pull sessionId from url.
    // For this context-based router, we'll try to find a session from the backend.
    // Let's just fetch the first "INVITED" or "STARTED" session for this candidate.
    const fetchSession = async () => {
      try {
        const res = await interviewsApi.getMySessions();
        const active = res.data.find(s => s.status === "INVITED" || s.status === "STARTED");
        if (active) {
          setSessionId(active.id);
          
          if (active.status === "INVITED") {
            await interviewsApi.startSession(active.id);
          }
          
          const fullSession = await interviewsApi.getSession(active.id);
          setSession(fullSession.data);
          
          // Pre-fill answer if exists
          const currentQ = fullSession.data.interview.questions?.[0];
          const existingAns = fullSession.data.answers?.find(a => a.questionId === currentQ?.id);
          if (existingAns) setAnswerText(existingAns.answerText);
          
        } else {
          showToast("No active interviews", "You do not have any pending AI interviews.", "info");
          setCurrentRoute("dashboard");
        }
      } catch (err) {
        console.error(err);
        showToast("Error", "Failed to load interview session.", "error");
        setCurrentRoute("dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [setCurrentRoute, showToast]);

  const questions = session?.interview.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  
  const handleSaveAnswer = async () => {
    if (!sessionId || !currentQuestion) return;
    try {
      await interviewsApi.submitAnswer(sessionId, currentQuestion.id, answerText);
      showToast("Saved", "Answer autosaved.", "success");
    } catch (err) {
      console.error(err);
      showToast("Error", "Failed to save answer.", "error");
    }
  };

  const handleNext = async () => {
    await handleSaveAnswer();
    if (currentQuestionIndex < questions.length - 1) {
      const nextQ = questions[currentQuestionIndex + 1];
      if (!nextQ) return;
      const existingAns = session?.answers?.find(a => a.questionId === nextQ.id);
      setAnswerText(existingAns?.answerText || "");
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      const prevQ = questions[currentQuestionIndex - 1];
      if (!prevQ) return;
      const existingAns = session?.answers?.find(a => a.questionId === prevQ.id);
      setAnswerText(existingAns?.answerText || "");
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    await handleSaveAnswer();
    try {
      await interviewsApi.submitSession(sessionId);
      showToast("Submitted", "Interview submitted for AI evaluation.", "success");
      setCurrentRoute("submissions");
    } catch (err) {
      console.error(err);
      showToast("Error", "Failed to submit interview.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-black/50">Loading Interview Environment...</div>;
  }

  if (!session || !currentQuestion) {
    return <div className="p-12 text-center text-black/50">Interview not found.</div>;
  }

  return (
    <div className="pb-12 text-[#222] max-w-[1000px] mx-auto w-full font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-xs font-bold text-black/40 uppercase tracking-widest flex items-center gap-1.5 mb-2">
            <Video className="w-3.5 h-3.5" /> AI INTERVIEW IN PROGRESS
          </span>
          <h1 className="text-3xl sm:text-4xl tracking-tight font-serif font-normal text-[#222]">
            {session.interview.title}
          </h1>
        </div>
        <div className="px-4 py-2 rounded-xl bg-black/5 flex items-center gap-2">
          <Clock className="w-4 h-4 text-black/50" />
          <span className="text-sm font-bold">{session.interview.timeLimitMins} Mins Total</span>
        </div>
      </div>

      <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[32px] p-8 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h3>
          <span className="text-xs font-bold px-3 py-1 bg-black/5 rounded-md text-black/50 uppercase">
            {currentQuestion.category || "General"}
          </span>
        </div>
        
        <div className="p-6 bg-[#111111] rounded-2xl text-white">
          <p className="text-lg leading-relaxed font-serif">
            {currentQuestion.text}
          </p>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-bold text-black/60 uppercase tracking-wider">
            Your Response
          </label>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your answer here..."
            className="w-full min-h-[200px] p-6 rounded-2xl bg-black/5 border-none text-base text-[#222] focus:ring-2 focus:ring-black/20"
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-black/5">
          <button
            onClick={handlePrev}
            disabled={currentQuestionIndex === 0}
            className="px-6 py-3 rounded-full bg-black/5 text-[#222] font-bold text-sm hover:bg-black/10 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveAnswer}
              className="px-6 py-3 rounded-full bg-black/5 text-[#222] font-bold text-sm hover:bg-black/10 transition-colors"
            >
              Save Draft
            </button>
            
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 rounded-full bg-[#111111] text-white font-bold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-xl"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={isSubmitting}
                className="px-6 py-3 rounded-full bg-emerald-500 text-white font-bold text-sm hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-xl disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : (
                  <>
                    <Send className="w-4 h-4" /> Finish & Submit
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
