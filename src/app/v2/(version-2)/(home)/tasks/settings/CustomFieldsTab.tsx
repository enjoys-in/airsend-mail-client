"use client";

import React, { useState } from "react";
import { Plus, Trash2, Hash, Type, Calendar, CheckSquare } from "lucide-react";
import { type TaskCustomField } from "../_lib/tasks-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function CustomFieldsTab() {
  const [fields, setFields] = useState<TaskCustomField[]>([
    { id: "cf-1", name: "Story Points", type: "number" },
    { id: "cf-2", name: "Sprint", type: "text" },
  ]);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<TaskCustomField["type"]>("text");

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    setFields((prev) => [
      ...prev,
      {
        id: `cf-${Date.now()}`,
        name: fieldName.trim(),
        type: fieldType,
      },
    ]);
    setFieldName("");
    toast.success("Custom field added");
  };

  const handleDeleteField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
    toast.success("Custom field removed");
  };

  const renderIcon = (type: TaskCustomField["type"]) => {
    switch (type) {
      case "number": return <Hash className="size-3.5 text-muted-foreground" />;
      case "date": return <Calendar className="size-3.5 text-muted-foreground" />;
      case "checkbox": return <CheckSquare className="size-3.5 text-muted-foreground" />;
      default: return <Type className="size-3.5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-4 py-2">
      <div>
        <h4 className="text-xs font-semibold text-foreground">Custom Fields</h4>
        <p className="text-[11px] text-muted-foreground">
          Define custom attributes attached to tasks in this project
        </p>
      </div>

      <div className="space-y-2 max-h-52 overflow-y-auto">
        {fields.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between rounded-lg border border-border/40 bg-card px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-2">
              {renderIcon(f.type)}
              <span className="font-medium text-foreground">{f.name}</span>
              <span className="text-[10px] text-muted-foreground capitalize font-mono">({f.type})</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDeleteField(f.id)}
              className="size-6 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAddField} className="flex items-center gap-2 pt-2 border-t border-border/40">
        <Input
          value={fieldName}
          onChange={(e) => setFieldName(e.target.value)}
          placeholder="Field name (e.g. Budget)"
          className="h-8 text-xs flex-1"
          required
        />
        <Select value={fieldType} onValueChange={(val) => setFieldType(val as any)}>
          <SelectTrigger className="h-8 text-xs w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text" className="text-xs">Text</SelectItem>
            <SelectItem value="number" className="text-xs">Number</SelectItem>
            <SelectItem value="date" className="text-xs">Date</SelectItem>
            <SelectItem value="checkbox" className="text-xs">Checkbox</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" type="submit" disabled={!fieldName.trim()} className="h-8 text-xs gap-1 shrink-0">
          <Plus className="size-3" />
          Add
        </Button>
      </form>
    </div>
  );
}
