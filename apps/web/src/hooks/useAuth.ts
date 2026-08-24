import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiClient, setAccessToken, clearAccessToken } from "@/lib/api/client";
import { useAuthStore } from "@/stores/auth.store";

import type {
  LoginDto,
  RegisterCandidateDto,
  LoginResponse,
  AuthUserResponse,
} from "@microintern/shared";

/**
 * Auth query keys — consistent key factory.
 */
export const authKeys = {
  all: ["auth"] as const,
  me: () => [...authKeys.all, "me"] as const,
};

/**
 * Fetch current authenticated user.
 * Called once on app init to hydrate auth state from a valid session.
 */
export function useCurrentUser() {
  const { setUser, setAuthenticated } = useAuthStore();

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: async () => {
      const response = await apiClient.get<{ data: AuthUserResponse }>("/auth/me");
      const user = response.data.data;
      setUser(user);
      setAuthenticated(true);
      return user;
    },
    retry: false, // Don't retry — 401 means unauthenticated
    staleTime: 5 * 60 * 1000, // Consider fresh for 5 minutes
  });
}

/**
 * Login mutation.
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser, setAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async (dto: LoginDto) => {
      const response = await apiClient.post<{ data: LoginResponse }>("/auth/login", dto);
      return response.data.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.token);
      setUser(data.user);
      setAuthenticated(true);

      // Seed the cache with user data
      queryClient.setQueryData(authKeys.me(), data.user);

      toast.success("Welcome back!");

      // Role-based redirect
      const redirectMap: Record<string, string> = {
        CANDIDATE: "/dashboard",
        COMPANY_OWNER: "/company/dashboard",
        RECRUITER: "/recruiter/dashboard",
        ADMIN: "/admin/dashboard",
        SUPER_ADMIN: "/admin/dashboard",
      };

      const destination = redirectMap[data.user.role] ?? "/dashboard";
      router.push(destination);
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Login failed. Please check your credentials.");
    },
  });
}

/**
 * Register candidate mutation.
 */
export function useRegisterCandidate() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { setUser, setAuthenticated } = useAuthStore();

  return useMutation({
    mutationFn: async (dto: RegisterCandidateDto) => {
      const response = await apiClient.post<{ data: LoginResponse }>(
        "/auth/register/candidate",
        dto,
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      setAccessToken(data.token);
      setUser(data.user);
      setAuthenticated(true);
      queryClient.setQueryData(authKeys.me(), data.user);

      toast.success("Account created! Welcome to MicroIntern.");
      router.push("/dashboard/onboarding");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Registration failed. Please try again.");
    },
  });
}

/**
 * Logout mutation.
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { reset } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("/auth/logout");
    },
    onSettled: () => {
      // Always clear local state, even if API call fails
      clearAccessToken();
      reset();
      queryClient.clear();
      router.push("/auth/login");
    },
  });
}
