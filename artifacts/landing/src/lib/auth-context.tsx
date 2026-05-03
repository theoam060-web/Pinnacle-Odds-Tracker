import { useAuth, useUser } from "@clerk/react";
import type { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useAppAuth() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { user } = useUser();

  return {
    user: user
      ? {
          id: user.id,
          email: user.primaryEmailAddress?.emailAddress ?? undefined,
        }
      : null,
    isLoaded: isLoaded ?? false,
    isSignedIn: isSignedIn ?? false,
    token: null as string | null,
    getToken: (): string | null => null,
    signOut: () => signOut({ redirectUrl: "/app/sign-in" }),
  };
}
