import { useEffect } from "react";
import useGetConfig from "@tasks/_hooks/queries/config/use-get-config";
import { useInstanceNameStore } from "@tasks/_store/instance-name";

/** Keeps the page title suffix in step with the configured instance name. */
export function InstanceNameSync() {
  const { data: config } = useGetConfig();
  const setInstanceName = useInstanceNameStore(
    (state) => state.setInstanceName,
  );
  const instanceName = config?.instanceName;

  useEffect(() => {
    if (instanceName) setInstanceName(instanceName);
  }, [instanceName, setInstanceName]);

  return null;
}
