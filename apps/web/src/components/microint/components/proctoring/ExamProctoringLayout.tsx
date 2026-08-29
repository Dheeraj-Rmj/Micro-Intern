"use client";

import React, { useState, useEffect, useRef } from "react";
import { Lock, AlertTriangle, Monitor, Camera, Mic, Play, ShieldAlert } from "lucide-react";

interface ExamProctoringLayoutProps {
  children: React.ReactNode;
  onViolation: (violationType: string) => void;
  isProctored: boolean;
}

export const ExamProctoringLayout: React.FC<ExamProctoringLayoutProps> = ({
  children,
  onViolation,
  isProctored,
}) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isProctored) return;
    
    const handleFullscreenChange = () => {
      const isFs = !!document.fullscreenElement;
      setIsFullscreen(isFs);
      if (hasStarted && !isFs) {
        onViolation("EXITED_FULLSCREEN");
      }
    };

    const handleVisibilityChange = () => {
      if (hasStarted && document.visibilityState === "hidden") {
        onViolation("TAB_SWITCH_OR_MINIMIZED");
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      if (hasStarted) {
        e.preventDefault();
        onViolation("COPY_ATTEMPT");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (hasStarted) {
        e.preventDefault();
      }
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("contextmenu", handleContextMenu);
      
      // Cleanup media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [hasStarted, isProctored, onViolation]);

  const requestPermissionsAndFullscreen = async () => {
    try {
      setError(null);
      // 1. Request Media Permissions
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermissions(true);

      // 2. Request Fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }

      setHasStarted(true);
    } catch (err: any) {
      console.error("Proctoring setup failed:", err);
      setError("Please allow camera and microphone access, and ensure your browser supports fullscreen mode to begin the exam.");
    }
  };

  if (!isProctored) {
    return <>{children}</>;
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 text-slate-200">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-xl flex flex-col items-center text-center space-y-6">
          <div className="w-16 h-16 bg-brand-500/10 rounded-full flex items-center justify-center mb-2">
            <Lock className="w-8 h-8 text-brand-500" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-100 mb-2">Secure Exam Environment</h2>
            <p className="text-sm text-slate-400">
              This assessment requires a proctored environment. To ensure fairness, you must grant the following permissions before starting:
            </p>
          </div>

          <div className="w-full space-y-3 text-left bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
            <div className="flex items-center gap-3">
              <Camera className="w-5 h-5 text-indigo-400" />
              <span className="text-sm font-medium">Camera Access</span>
            </div>
            <div className="flex items-center gap-3">
              <Mic className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium">Microphone Access</span>
            </div>
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-amber-400" />
              <span className="text-sm font-medium">Fullscreen Mode</span>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-left w-full">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            onClick={requestPermissionsAndFullscreen}
            className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg"
          >
            <Play className="w-5 h-5 fill-current" />
            Start Secure Exam
          </button>
        </div>
        
        {/* Hidden video element just to keep stream active if needed */}
        <video ref={videoRef} autoPlay muted playsInline className="hidden" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-950">
      {/* Small floating indicator for proctoring */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-slate-800 rounded-full pl-3 pr-4 py-1.5 shadow-2xl">
        <div className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
        </div>
        <span className="text-xs font-semibold text-slate-200 tracking-wide uppercase">Proctoring Active</span>
      </div>
      
      {/* Candidate's small webcam preview */}
      <div className="fixed bottom-4 left-4 z-50 w-48 aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800/80">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
      </div>

      {!isFullscreen && (
        <div className="fixed inset-0 z-[100] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6 text-center">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full space-y-6">
            <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto" />
            <h3 className="text-xl font-bold text-slate-100">Fullscreen Required</h3>
            <p className="text-sm text-slate-400">
              You have exited fullscreen mode. This is recorded as a violation. Please return to fullscreen to continue the exam.
            </p>
            <button
              onClick={requestPermissionsAndFullscreen}
              className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 px-4 rounded-xl transition-all"
            >
              Return to Fullscreen
            </button>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};
