"use client";

import { memo, useState, useCallback, useEffect, useRef } from "react";
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
        <Button variant="outline" size="sm" disabled={disabled} className="h-8 rounded-xl text-xs sm:text-sm gap-1.5">
          <Plus className="size-3.5" />
          Add External Feed
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Subscribe to External Calendar</DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            Import read-only feeds from Google Calendar, Outlook 365, or any webcal ICS URL.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="sub-name" className="text-xs sm:text-sm font-medium">Display Name</Label>
            <Input
              id="sub-name"
              placeholder="e.g. Company Holidays or Family Schedule"
              value={name}
              onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: undefined })); }}
              className="h-9 text-xs sm:text-sm rounded-xl"
            />
            {errors.name && <p className="text-destructive text-xs">{errors.name}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sub-url" className="text-xs sm:text-sm font-medium">ICS Feed URL</Label>
            <Input
              id="sub-url"
              placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setErrors((p) => ({ ...p, url: undefined })); }}
              className="h-9 text-xs sm:text-sm rounded-xl"
            />
            {errors.url && <p className="text-destructive text-xs">{errors.url}</p>}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="ghost" onClick={() => { reset(); setOpen(false); }} disabled={loading} className="rounded-xl">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="rounded-xl px-4">
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

  const onConfigSyncRef = useRef(onConfigSync);
  useEffect(() => {
    onConfigSyncRef.current = onConfigSync;
  }, [onConfigSync]);

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
      onConfigSyncRef.current?.(buildBackendConfigArray(updated));
      toast.success("Calendar deleted.");
    } catch {
      toast.error("Failed to delete calendar.");
    }
  }, [accountId, calendars]);

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
    <div className="space-y-6">
      {/* ---- JMAP Calendars ---- */}
      <SettingsSection
        title="Your Personal Calendars"
        description="Native calendars hosted on your private CalDAV account"
        icon={<Calendar className="size-4" />}
      >
        <div className="pt-2">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading calendars...</span>
            </div>
          ) : calendars.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No calendars created yet.
            </p>
          ) : (
            <>
              {/* Desktop / Tablet Table */}
              <div className="hidden sm:block rounded-xl border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs">
                      <TableHead>Calendar</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Timezone</TableHead>
                      <TableHead className="hidden md:table-cell">Permissions</TableHead>
                      <TableHead className="w-[50px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calendars.map((cal) => (
                      <TableRow key={cal.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <div
                              className="size-3 rounded-full shrink-0 border border-border/50"
                              style={{ backgroundColor: cal.color }}
                            />
                            <span>{cal.name}</span>
                            {cal.is_default && (
                              <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                                Default
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs font-mono text-muted-foreground">{cal.color}</span>
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
                              className="size-8 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteCalendar(cal.id)}
                              aria-label={`Delete ${cal.name}`}
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List */}
              <div className="sm:hidden space-y-2.5">
                {calendars.map((cal) => (
                  <div key={cal.id} className="p-3 rounded-xl border border-border/60 bg-background/50 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="size-3 rounded-full shrink-0 border border-border/50"
                        style={{ backgroundColor: cal.color }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-foreground truncate">{cal.name}</span>
                          {cal.is_default && (
                            <Badge variant="secondary" className="text-[9px] py-0 px-1">
                              Default
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground block">{cal.timezone}</span>
                      </div>
                    </div>
                    {!cal.is_default && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteCalendar(cal.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </SettingsSection>

      {/* ---- External Subscriptions ---- */}
      <SettingsSection
        title="Subscribed External Calendars"
        description="Read-only ICS calendar feeds synchronized from external services"
        icon={<Globe className="size-4" />}
        action={<AddSubscriptionDialog disabled={disabled} onAdd={handleAddSubscription} />}
      >
        <div className="pt-2">
          {loading ? (
            <div className="flex items-center justify-center py-6 text-xs text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading subscriptions...</span>
            </div>
          ) : subscriptions.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              No external calendars subscribed yet.
            </p>
          ) : (
            <>
              {/* Desktop / Tablet Table */}
              <div className="hidden sm:block rounded-xl border border-border/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 text-xs">
                      <TableHead>Feed Name</TableHead>
                      <TableHead className="hidden md:table-cell">Type</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Sync Status</TableHead>
                      <TableHead className="w-[80px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((sub) => (
                      <TableRow key={sub.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium text-xs sm:text-sm">
                          <div className="flex items-center gap-2">
                            <Globe className="size-3.5 text-muted-foreground" />
                            <div
                              className="size-2.5 rounded-full shrink-0 border"
                              style={{ backgroundColor: sub.color }}
                            />
                            <span>{sub.display_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="text-xs text-muted-foreground uppercase font-mono">{sub.source_type}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs text-muted-foreground">{sub.events_count} events</span>
                        </TableCell>
                        <TableCell>
                          {sub.last_error ? (
                            <Badge variant="destructive" className="text-[10px]">Sync Error</Badge>
                          ) : sub.is_enabled ? (
                            <Badge variant="secondary" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Active</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Disabled</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-foreground"
                              onClick={() => handleSyncSubscription(sub.id)}
                              title="Sync now"
                            >
                              <RefreshCw className="size-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDeleteSubscription(sub.id)}
                              title="Remove subscription"
                            >
                              <Trash2 className="size-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List */}
              <div className="sm:hidden space-y-2.5">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="p-3 rounded-xl border border-border/60 bg-background/50 flex items-center justify-between gap-2">
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <div
                          className="size-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="text-xs font-medium text-foreground truncate">{sub.display_name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span>{sub.events_count} events</span>
                        {sub.last_error ? (
                          <Badge variant="destructive" className="text-[9px] py-0 px-1">Error</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[9px] py-0 px-1">Active</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleSyncSubscription(sub.id)}
                      >
                        <RefreshCw className="size-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteSubscription(sub.id)}
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </SettingsSection>
    </div>
  );
}

export default memo(ConnectedCalendars);
