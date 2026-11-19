import {
  createContext,
  type PropsWithChildren,
  useEffect,
  useRef,
} from "react";
import { authClient } from "@tasks/_lib/auth-client";
import { descriptionSaveQueue } from "@tasks/_lib/description-save-queue";
import type { User } from "@tasks/_types/user";
import { BootFrame } from "../../common/boot-frame";

const { useSession } = authClient;

export const AuthContext = createContext<{
  user: User | null | undefined;
  isLoading: boolean;
  refetchUser: () => Promise<void>;
}>({
  user: undefined,
  isLoading: true,
  refetchUser: async () => {},
});

function AuthProvider({ children }: PropsWithChildren) {
  const { data, isPending, refetch, error } = useSession();
  // Only hold the tree back during the *first* session fetch. Better
  // Auth re-fetches the session on window focus; if we kept returning
  // nothing while those background fetches are pending we'd unmount the
  // entire route tree on every alt-tab, which tore down the Turnstile
  // iframe and forced a re-challenge.
  const previousOwner = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    if (isPending || error) return;
    const owner = data?.user.id ?? null;
    if (previousOwner.current !== owner) descriptionSaveQueue.clear();
    previousOwner.current = owner;
  }, [data?.user.id, isPending, error]);
  const hasLoadedOnce = useRef(false);
  if (!isPending) {
    hasLoadedOnce.current = true;
  }

  if (isPending && !hasLoadedOnce.current) {
    return <BootFrame />;
  }

  return (
    <AuthContext.Provider
      value={{
        user: (data?.user as User | null | undefined) ?? null,
        isLoading: isPending,
        refetchUser: async () => {
          await refetch({ query: { disableCookieCache: true } });
        },
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
