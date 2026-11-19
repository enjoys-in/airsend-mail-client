import * as React from "react";
import { PageHeader } from "@/components/h-panel/kit";
import { AppearanceForm } from "./appearance-form";

function Appearancepage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Appearance"
        description="Customize the appearance of the app. Automatically switch between day and night themes."
      />
      <AppearanceForm />
    </div>
  );
}
export default Appearancepage;
