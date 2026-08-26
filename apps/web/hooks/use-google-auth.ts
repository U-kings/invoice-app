import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/useAuthStore";
import { toast } from "@workspace/ui/components/toast";

interface GoogleAuthPayload {
  idToken: string;
  terms: boolean;
}

export function useGoogleAuth() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation({
    mutationFn: async (payload: GoogleAuthPayload) => {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.add({
          title: "Google Authentication failed",
          description: data.error || "Could not log in via Google",
          type: "error",
        });
        throw new Error(data.error || "Authentication failed");
      }
      return data; // Expected backend object payload format: { access_token: '...', user: {...} }
    },
    onSuccess: (data) => {
      // 1. Core synchronization with your established Zustand store state
      setAuth(data.user, data.access_token);
      
      toast.add({
        title: "Welcome back 👋",
        description: "Successfully authenticated via Google.",
        type: "success",
      });

      // 2. Redirect to dashboard application scope
      router.push("/dashboard");
    },
  });
}
