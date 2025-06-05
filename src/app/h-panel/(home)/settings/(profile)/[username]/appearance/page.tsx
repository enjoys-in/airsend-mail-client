import * as React from "react"; 
import { Separator } from "@/components/ui/separator";
import { AppearanceForm } from "./appearance-form";

function Appearancepage() { 
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Appearance</h2>
        <p className="text-sm text-muted-foreground">
          Customize the appearance of the app. Automatically switch between day
          and night themes.
        </p>
      </div>
      <Separator />
      <AppearanceForm />
    </div>
  );
}
export default Appearancepage;
