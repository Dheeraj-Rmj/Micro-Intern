"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import { authService } from "../services/auth.service";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schemas";

export function ForgotPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotMutation = useMutation({
    mutationFn: (data: ForgotPasswordFormData) => authService.forgotPassword(data.email),
    onSuccess: () => {
      setApiError(null);
      setIsSuccess(true);
    },
    onError: (error: unknown) => {
      let message = "Failed to send reset email. Please try again.";
      if (typeof error === "object" && error !== null && "response" in error) {
        const errObj = error as {
          response?: { data?: { message?: string } };
        };
        if (errObj.response?.data?.message) {
          message = errObj.response.data.message;
        }
      }
      setApiError(message);
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    forgotMutation.mutate(data);
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">Check your email</h3>
        <p className="mt-2 text-sm text-slate-400">
          We have sent password reset instructions to your email address.
        </p>
        <Link
          href="/auth/login"
          className="mt-8 flex items-center gap-2 text-sm font-semibold text-blue-400 transition-colors hover:text-blue-300"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign in</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError !== null && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-300">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{apiError}</span>
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-300"
          >
            Email Address
          </label>
          <div className="mt-1.5">
            <input
              id="email"
              type="email"
              placeholder="candidate@example.com"
              {...register("email")}
              disabled={forgotMutation.isPending}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50"
            />
            {errors.email !== undefined && (
              <p className="mt-1.5 text-xs font-medium text-red-400">{errors.email.message}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={forgotMutation.isPending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {forgotMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Sending instructions...</span>
            </>
          ) : (
            <span>Send Reset Instructions</span>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <Link
          href="/auth/login"
          className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Sign in</span>
        </Link>
      </div>
    </div>
  );
}
