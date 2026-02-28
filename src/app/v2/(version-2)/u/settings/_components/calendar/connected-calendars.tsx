"use client";

import { memo, useState, useCallback } from "react";
import { Plus, Trash2, RefreshCw, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SettingsSection } from "../shared";
import type { ICalenderConfig } from "@/lib/types/get-user-settings-response";

type CalendarEntry = ICalenderConfig["config"][number];

/* ---- validation ---- */
function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "webcal:";
  } catch {
    return false;
  }
}

/* ---- status badge colour mapping ---- */
function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "synced":
      return "default";
    case "syncing":
      return "secondary";
    case "error":
      return "destructive";
    default:
      return "outline";
  }
}

/* ---- props ---- */
interface ConnectedCalendarsProps {
  calendars: CalendarEntry[];
  disabled: boolean;
  onAdd: (entry: CalendarEntry) => void;
  onRemove: (calendarId: string) => void;
}

/* ---- Add-calendar dialog (internal) ---- */
function AddCalendarDialog({
  disabled,
  onAdd,
}: {
  disabled: boolean;
  onAdd: (entry: CalendarEntry) => void;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});

  const reset = useCallback(() => {
    setName("");
    setUrl("");
    setErrors({});
  }, []);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Calendar name is required";
    if (!url.trim()) next.url = "Calendar URL is required";
    else if (!isValidUrl(url.trim())) next.url = "Must be a valid http/https/webcal URL";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const entry: CalendarEntry = {
      calendar_id: crypto.randomUUID(),
      calendar_name: name.trim(),
      calender_url: url.trim(),
      sync_status: "pending",
      last_synced_at: null,
      sync_error: null,
    };
    onAdd(entry);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add calendar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add external calendar</DialogTitle>
          <DialogDescription>
            Connect a CalDAV or ICS calendar by providing its URL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="cal-name">Calendar name</Label>
            <Input
              id="cal-name"
              placeholder="Work calendar"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
            />
            {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cal-url">Calendar URL</Label>
            <Input
              id="cal-url"
              placeholder="https://calendar.example.com/feed.ics"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setErrors((p) => ({ ...p, url: undefined })); }}
            />
            {errors.url && <p className="text-destructive text-xs">{errors.url}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); setOpen(false); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Add</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---- Main connected-calendars component ---- */
function ConnectedCalendars({
  calendars,
  disabled,
  onAdd,
  onRemove,
}: ConnectedCalendarsProps) {
  return (
    <SettingsSection
      title="Connected calendars"
      description="External calendars synced to your account"
    >
      <div className="space-y-4">
        {calendars.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No external calendars connected yet.
          </p>
        ) : (
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {calendars.map((cal) => (
                  <TableRow key={cal.calendar_id}>
                    <TableCell className="font-medium text-sm">
                      {cal.calendar_name}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <span className="text-xs text-muted-foreground truncate max-w-[240px] inline-block">
                        {cal.calender_url}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusVariant(cal.sync_status)}>
                        {cal.sync_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => onRemove(cal.calendar_id)}
                        disabled={disabled}
                        aria-label={`Remove ${cal.calendar_name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <AddCalendarDialog disabled={disabled} onAdd={onAdd} />
      </div>
    </SettingsSection>
  );
}

export default memo(ConnectedCalendars);
