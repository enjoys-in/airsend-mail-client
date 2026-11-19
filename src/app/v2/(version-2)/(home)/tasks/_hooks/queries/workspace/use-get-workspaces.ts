import { authClient } from "@tasks/_lib/auth-client";

function useGetWorkspaces() {
  const {
    data: organizations,
    error,
    isPending,
  } = authClient.useListOrganizations();

  return {
    data: organizations,
    error,
    isLoading: isPending,
    isError: !!error,
  };
}

export default useGetWorkspaces;
