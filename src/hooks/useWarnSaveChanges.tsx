import { useState, useRef,useEffect } from 'react';

import { useRouter } from 'next/router';

export function useWarnIfUnsavedChanges(hasPendingChanges: React.MutableRefObject<boolean>) {
  useEffect(() => {
    const handleUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingChanges.current) {
        const message = "Changes you made may not be saved.";
        e.preventDefault();
        // Required for some browsers
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);
}

type UseUnsavedChangesPromptOptions = {
  isDirty: boolean;
};

export function useUnsavedChangesPrompt({ isDirty }: UseUnsavedChangesPromptOptions) {
  const router = useRouter();
  const [showPrompt, setShowPrompt] = useState(false);
  const [nextRoute, setNextRoute] = useState<string | null>(null);

  useEffect(() => {
    const handleRouteChangeStart = (url: string) => {
      if (isDirty) {
        setShowPrompt(true);
        setNextRoute(url);
        throw "Navigation blocked due to unsaved changes.";
      }
    };

    router.events.on("routeChangeStart", handleRouteChangeStart);

    return () => {
      router.events.off("routeChangeStart", handleRouteChangeStart);
    };
  }, [isDirty]);

  const confirmLeave = () => {
    if (nextRoute) {
      setShowPrompt(false);
      router.push(nextRoute);
    }
  };

  const cancelLeave = () => {
    setShowPrompt(false);
    setNextRoute(null);
  };

  return { showPrompt, confirmLeave, cancelLeave };
}
