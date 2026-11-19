import { createFileRoute } from "@tanstack/react-router";
import { ErrorTest } from "@tasks/_components/ui/error-test";

export const Route = createFileRoute("/test-error")({
  component: TestErrorComponent,
});

function TestErrorComponent() {
  return (
    <div className="min-h-svh bg-background">
      <ErrorTest />
    </div>
  );
}
