"use client";

import { memo, useState, useCallback, useEffect } from "react";
import { Plus, Trash2, RefreshCw, Loader2, Calendar, Globe } from "lucide-react";
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
import { toast } from "sonner";
import type { CalDevCalendar, CalDevSubscription } from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-types";
import {
  getSession,
  getAccountId,
  getCalendars,
  deleteCalendar,
  getSubscriptions,
  createSubscription,
  deleteSubscription,
  syncSubscription,
  buildBackendConfigArray,
} from "@/app/v2/(version-2)/(home)/calender/_lib/caldev-api";

/* ---- validation ---- */
function isValidUrl(str: string): boolean {
  try {
    const url = new URL(str);
    return url.protocol === "https:" || url.protocol === "http:" || url.protocol === "webcal:";
  } catch {
    return false;
  }
}

/* ---- props ---- */
interface ConnectedCalendarsProps {
  disabled: boolean;
  /** Called with the updated config array whenever calendars change */
  onConfigSync?: (config: ReturnType<typeof buildBackendConfigArray>) => void;
}

/* ---- Add-subscription dialog (internal) ---- */
function AddSubscriptionDialog({
  disabled,
  onAdd,
}: {
  disabled: boolean;
  onAdd: (sourceUrl: string, displayName: string) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await onAdd(url.trim(), name.trim());
      reset();
      setOpen(false);
    } catch {
      // parent handles toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={disabled}>
          <Plus className="h-4 w-4 mr-1.5" />
          Add external calendar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add external calendar</DialogTitle>
          <DialogDescription>
            Subscribe to a Google Calendar, Outlook, or any ICS feed URL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="sub-name">Display name</Label>
            <Input
              id="sub-name"
              placeholder="Indian Holidays"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
            />
            {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="sub-url">ICS feed URL</Label>
            <Input
              id="sub-url"
              placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setErrors((p) => ({ ...p, url: undefined })); }}
            />
            {errors.url && <p className="text-destructive text-xs">{errors.url}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); setOpen(false); }} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Subscribe
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---- Main connected-calendars component ---- */
function ConnectedCalendars({ disabled, onConfigSync }: ConnectedCalendarsProps) {
  const [calendars, setCalendars] = useState<CalDevCalendar[]>([]);
  const [subscriptions, setSubscriptions] = useState<CalDevSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [accountId, setAccountId] = useState("");

  /* ---- fetch calendars + subscriptions from CalDev ---- */
  const fetchData = useCallback(async () => {
    if (disabled) return;
    setLoading(true);
    try {
      const session = await getSession();
      const acctId = getAccountId(session);
      setAccountId(acctId);

      const [cals, subs] = await Promise.all([
        getCalendars(acctId),
        getSubscriptions(),
      ]);
      setCalendars(cals);
      setSubscriptions(subs);
      onConfigSync?.(buildBackendConfigArray(cals));
    } catch (err) {
      console.error("[ConnectedCalendars] fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [disabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ---- delete a JMAP calendar ---- */
  const handleDeleteCalendar = useCallback(async (calId: string) => {
    if (!accountId) return;
    try {
      await deleteCalendar(accountId, calId);
      const updated = calendars.filter((c) => c.id !== calId);
      setCalendars(updated);
      onConfigSync?.(buildBackendConfigArray(updated));
      toast.success("Calendar deleted.");
    } catch {
      toast.error("Failed to delete calendar.");
    }
  }, [accountId, calendars, onConfigSync]);

  /* ---- add a subscription ---- */
  const handleAddSubscription = useCallback(async (sourceUrl: string, displayName: string) => {
    try {
      const result = await createSubscription({ source_url: sourceUrl, display_name: displayName });
      setSubscriptions((prev) => [...prev, result.subscription]);
      toast.success("Subscription added. Sync is running in the background.");
    } catch {
      toast.error("Failed to add subscription.");
      throw new Error("failed");
    }
  }, []);

  /* ---- delete a subscription ---- */
  const handleDeleteSubscription = useCallback(async (subId: string) => {
    try {
      await deleteSubscription(subId, true);
      setSubscriptions((prev) => prev.filter((s) => s.id !== subId));
      toast.success("Subscription removed.");
    } catch {
      toast.error("Failed to remove subscription.");
    }
  }, []);

  /* ---- sync a subscription ---- */
  const handleSyncSubscription = useCallback(async (subId: string) => {
    try {
      const updated = await syncSubscription(subId);
      setSubscriptions((prev) => prev.map((s) => (s.id === subId ? updated : s)));
      toast.success("Sync completed.");
    } catch {
      toast.error("Failed to sync.");
    }
  }, []);

  if (disabled) return null;

  return (
    <>
      {/* ---- JMAP Calendars ---- */}
      <SettingsSection
        title="Your calendars"
        description="Calendars on your CalDAV server"
      >
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading calendars...</span>
            </div>
          ) : calendars.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No calendars found.
            </p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Color</TableHead>
                    <TableHead>Timezone</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {calendars.map((cal) => (
                    <TableRow key={cal.id}>
                      <TableCell className="font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {cal.name}
                          {cal.is_default && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              Default
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3.5 w-3.5 rounded-full border"
                            style={{ backgroundColor: cal.color }}
                          />
                          <span className="text-xs text-muted-foreground">{cal.color}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{cal.timezone}</span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-muted-foreground">
                          {cal.is_readonly ? "Read-only" : "Read-write"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {!cal.is_default && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteCalendar(cal.id)}
                            aria-label={`Delete ${cal.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </SettingsSection>

      {/* ---- External Subscriptions ---- */}
      <SettingsSection
        title="External calendars"
        description="ICS feeds and external calendar subscriptions"
      >
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading subscriptions...</span>
            </div>
          ) : subscriptions.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No external calendars subscribed yet.
            </p>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Source</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <div
                            className="h-3 w-3 rounded-full border"
                            style={{ backgroundColor: sub.color }}
                          />
                          {sub.display_name}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-xs text-muted-foreground truncate max-w-[200px] inline-block">
                          {sub.source_type}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">{sub.events_count}</span>
                      </TableCell>
                      <TableCell>
                        {sub.last_error ? (
                          <Badge variant="destructive" className="text-[10px]">Error</Badge>
                        ) : sub.is_enabled ? (
                          <Badge variant="default" className="text-[10px]">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">Disabled</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleSyncSubscription(sub.id)}
                            aria-label={`Sync ${sub.display_name}`}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteSubscription(sub.id)}
                            aria-label={`Remove ${sub.display_name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <AddSubscriptionDialog disabled={disabled} onAdd={handleAddSubscription} />
        </div>
      </SettingsSection>
    </>
  );
}

export default memo(ConnectedCalendars);
