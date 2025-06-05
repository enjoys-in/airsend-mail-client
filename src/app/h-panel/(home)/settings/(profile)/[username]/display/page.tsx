import { Separator } from "@/components/ui/separator";
import React from "react";
import { DisplayForm } from "./display-form";

function DisplayPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Display</h3>
        <p className="text-sm text-muted-foreground">
          Turn items on or off to control what&apos;s displayed in the app.
        </p>
      </div>
      <Separator />
      <DisplayForm />
    </div>
  );
}

export default DisplayPage;
