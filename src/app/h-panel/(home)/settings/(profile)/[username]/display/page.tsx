import { PageHeader } from "@/components/h-panel/kit";
import React from "react";
import { DisplayForm } from "./display-form";

function DisplayPage() {
  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Display"
        description="Turn items on or off to control what's displayed in the app."
      />
      <DisplayForm />
    </div>
  );
}

export default DisplayPage;
