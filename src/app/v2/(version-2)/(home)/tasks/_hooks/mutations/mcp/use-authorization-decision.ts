import { useMutation } from "@tanstack/react-query";
import { submitMcpAuthorizationDecision } from "@tasks/_fetchers/mcp/submit-authorization-decision";
import { toast } from "@tasks/_lib/toast";

export function useMcpAuthorizationDecision() {
  return useMutation({
    mutationFn: ({
      requestId,
      approved,
    }: {
      requestId: string;
      approved: boolean;
    }) => submitMcpAuthorizationDecision(requestId, approved),
    onError: (error) => toast.error(error.message),
  });
}
