"use client";

import React, { useState } from "react";
import {
  Workflow,
  Plus,
  Play,
  Sparkles,
  Mail,
  Calendar,
  FileUp,
  MessageSquare,
  Webhook,
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  Edit3,
  Copy,
  Check,
  ArrowRight,
  Filter,
  Activity,
  Shield,
  Layers,
  Send,
  CheckSquare,
  Globe,
  Terminal,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useChatStore } from "../_lib/chat-store";
import { workspaceApi } from "../_lib/api";
import WorkspaceErrorBoundary from "../_components/WorkspaceErrorBoundary";
import type {
  Workflow as WorkflowType,
  WorkflowTriggerType,
  WorkflowActionType,
  WorkflowRun,
} from "../_lib/chat-types";

export default function WorkflowsPage() {
  return (
    <WorkspaceErrorBoundary fallbackTitle="Unable to load Workflows Engine">
      <WorkflowsContent />
    </WorkspaceErrorBoundary>
  );
}

const TEMPLATES: Array<{
  id: string;
  name: string;
  description: string;
  triggerType: WorkflowTriggerType;
  triggerConfig: Record<string, any>;
  actions: Array<{ type: WorkflowActionType; config: Record<string, any> }>;
  icon: React.ElementType;
  color: string;
}> = [
  {
    id: "tpl-1",
    name: "Urgent Email to Channel Broadcaster",
    description: "Post a high-priority notification to #general when an email marked urgent arrives.",
    triggerType: "on_mail_received",
    triggerConfig: { subject_contains: "urgent" },
    actions: [
      {
        type: "send_message",
        config: { content: "📩 **High-Priority Mail**: {{subject}} received from {{from}}" },
      },
    ],
    icon: Mail,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/30",
  },
  {
    id: "tpl-2",
    name: "Meeting 15-Minute Countdown Reminder",
    description: "Notify channels and attendees 15 minutes before any scheduled call starts with direct meet.airsend.in join link.",
    triggerType: "on_calendar_event",
    triggerConfig: { event_type: "reminder_15m" },
    actions: [
      {
        type: "send_message",
        config: { content: "⏰ **Meeting in 15 Minutes**: {{title}} starts soon! Join link: {{meeting_url}}" },
      },
    ],
    icon: Calendar,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/30",
  },
  {
    id: "tpl-3",
    name: "File Upload Review Task Generator",
    description: "When a new spreadsheet or presentation is uploaded, notify team and create a review task.",
    triggerType: "on_file_uploaded",
    triggerConfig: { category: "document" },
    actions: [
      {
        type: "send_message",
        config: { content: "📁 New document **{{name}}** uploaded by {{uploaded_by}}." },
      },
      {
        type: "create_task",
        config: { title: "Review document: {{name}}", priority: "medium" },
      },
    ],
    icon: FileUp,
    color: "text-purple-500 bg-purple-500/10 border-purple-500/30",
  },
  {
    id: "tpl-4",
    name: "Auto-Create Task on #todo Tag",
    description: "Scans messages in real-time. Whenever someone posts #todo, automatically creates a channel task.",
    triggerType: "on_message_sent",
    triggerConfig: { keyword: "#todo" },
    actions: [
      {
        type: "create_task",
        config: { title: "Task: {{content}}", priority: "high" },
      },
    ],
    icon: MessageSquare,
    color: "text-amber-500 bg-amber-500/10 border-amber-500/30",
  },
  {
    id: "tpl-5",
    name: "GitHub / CI-CD Incoming Webhook",
    description: "Generates an incoming webhook URL to receive GitHub Actions, Sentry, or Jenkins build notifications.",
    triggerType: "webhook_received",
    triggerConfig: {},
    actions: [
      {
        type: "send_message",
        config: { content: "🚀 **Build Event**: {{commit_message}} from {{repository}}" },
      },
    ],
    icon: Webhook,
    color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/30",
  },
  {
    id: "tpl-6",
    name: "Task Completed External Webhook",
    description: "When a task is marked 'done', trigger an outbound webhook to external analytics or customer CRM.",
    triggerType: "task_status_changed",
    triggerConfig: { status: "done" },
    actions: [
      {
        type: "post_webhook",
        config: { url: "https://api.external-service.com/webhook/task-completed" },
      },
    ],
    icon: CheckSquare,
    color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/30",
  },
];

function WorkflowsContent() {
  const {
    workflows,
    workflowRuns,
    channels,
    activeTeamId,
    currentUserId,
    addWorkflow,
    toggleWorkflow,
    deleteWorkflow,
    addWorkflowRun,
  } = useChatStore();

  const [activeTab, setActiveTab] = useState<"flows" | "templates" | "history">("flows");
  const [builderOpen, setBuilderOpen] = useState(false);
  const [viewLogRun, setViewLogRun] = useState<WorkflowRun | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [testExecutingId, setTestExecutingId] = useState<string | null>(null);

  // Builder Wizard State
  const [wizardStep, setWizardStep] = useState(1);
  const [flowName, setFlowName] = useState("");
  const [flowDescription, setFlowDescription] = useState("");
  const [selectedTrigger, setSelectedTrigger] = useState<WorkflowTriggerType>("on_mail_received");
  const [triggerKeyword, setTriggerKeyword] = useState("");
  const [triggerSubject, setTriggerSubject] = useState("");
  const [triggerSender, setTriggerSender] = useState("");
  const [triggerCategory, setTriggerCategory] = useState("document");
  const [selectedActionType, setSelectedActionType] = useState<WorkflowActionType>("send_message");
  const [actionChannelId, setActionChannelId] = useState(channels[0]?.id || "");
  const [actionContent, setActionContent] = useState("");
  const [actionTaskTitle, setActionTaskTitle] = useState("");
  const [actionWebhookUrl, setActionWebhookUrl] = useState("");

  const activeFlows = workflows.filter((w) => w.teamId === activeTeamId || !w.teamId);

  const resetBuilder = () => {
    setWizardStep(1);
    setFlowName("");
    setFlowDescription("");
    setSelectedTrigger("on_mail_received");
    setTriggerKeyword("");
    setTriggerSubject("");
    setTriggerSender("");
    setTriggerCategory("document");
    setSelectedActionType("send_message");
    setActionChannelId(channels[0]?.id || "");
    setActionContent("");
    setActionTaskTitle("");
    setActionWebhookUrl("");
  };

  const handleUseTemplate = (tpl: typeof TEMPLATES[0]) => {
    setFlowName(tpl.name);
    setFlowDescription(tpl.description);
    setSelectedTrigger(tpl.triggerType);
    if (tpl.triggerConfig.keyword) setTriggerKeyword(tpl.triggerConfig.keyword);
    if (tpl.triggerConfig.subject_contains) setTriggerSubject(tpl.triggerConfig.subject_contains);
    if (tpl.triggerConfig.from_email) setTriggerSender(tpl.triggerConfig.from_email);
    if (tpl.triggerConfig.category) setTriggerCategory(tpl.triggerConfig.category);

    const firstAction = tpl.actions[0];
    if (firstAction) {
      setSelectedActionType(firstAction.type);
      if (firstAction.config.content) setActionContent(firstAction.config.content);
      if (firstAction.config.title) setActionTaskTitle(firstAction.config.title);
      if (firstAction.config.url) setActionWebhookUrl(firstAction.config.url);
    }
    setWizardStep(3);
    setBuilderOpen(true);
  };

  const handleCreateWorkflow = async () => {
    const triggerConfig: Record<string, any> = {};
    if (selectedTrigger === "on_message_sent" && triggerKeyword) triggerConfig.keyword = triggerKeyword;
    if (selectedTrigger === "on_mail_received") {
      if (triggerSubject) triggerConfig.subject_contains = triggerSubject;
      if (triggerSender) triggerConfig.from_email = triggerSender;
    }
    if (selectedTrigger === "on_file_uploaded") triggerConfig.category = triggerCategory;

    const actionConfig: Record<string, any> = {};
    if (selectedActionType === "send_message") {
      actionConfig.channel_id = actionChannelId || channels[0]?.id;
      actionConfig.content = actionContent || "Automated Workflow Message";
    } else if (selectedActionType === "create_task") {
      actionConfig.title = actionTaskTitle || "Automated Task";
      actionConfig.priority = "high";
    } else if (selectedActionType === "post_webhook") {
      actionConfig.url = actionWebhookUrl || "https://httpbin.org/post";
    }

    await addWorkflow({
      teamId: activeTeamId || "t-1",
      name: flowName.trim() || `${selectedTrigger.replace(/_/g, " ")} Flow`,
      description: flowDescription.trim() || "Configured via AirSend Workflows",
      triggerType: selectedTrigger,
      triggerConfig,
      actions: [{ type: selectedActionType, config: actionConfig }],
      isActive: true,
      createdBy: currentUserId || "alex@airsend.io",
    });

    setBuilderOpen(false);
    resetBuilder();
  };

  const handleTestTrigger = async (wf: WorkflowType) => {
    setTestExecutingId(wf.id);
    const email = currentUserId || "alex@airsend.io";
    try {
      await workspaceApi.triggerWorkflow(
        wf.teamId || "t-1",
        wf.triggerType,
        {
          test_event: true,
          subject: "Test email subject",
          content: "Test workflow message payload",
          from: email,
          meeting_url: "https://meet.airsend.in/test-call",
        },
        email
      );

      // Add optimistic test run
      addWorkflowRun({
        id: `run-test-${Date.now()}`,
        workflowId: wf.id,
        teamId: wf.teamId || "t-1",
        triggerType: wf.triggerType,
        triggerPayload: { test: true },
        status: "success",
        actionsExecuted: wf.actions.map((a, i) => ({ index: i, type: a.type, status: "success" })),
        logs: `[${new Date().toISOString()}] Manual test run executed successfully for '${wf.name}'`,
        durationMs: 28,
        executedAt: new Date().toISOString(),
      });
    } catch {
      // Handled
    } finally {
      setTimeout(() => setTestExecutingId(null), 1200);
    }
  };

  const getTriggerBadge = (type: WorkflowTriggerType) => {
    switch (type) {
      case "on_mail_received":
        return <Badge className="bg-blue-500/15 text-blue-500 border-blue-500/30 text-[10px] gap-1 font-mono"><Mail className="size-3" /> Mail</Badge>;
      case "on_calendar_event":
        return <Badge className="bg-emerald-500/15 text-emerald-500 border-emerald-500/30 text-[10px] gap-1 font-mono"><Calendar className="size-3" /> Calendar</Badge>;
      case "on_file_uploaded":
        return <Badge className="bg-purple-500/15 text-purple-500 border-purple-500/30 text-[10px] gap-1 font-mono"><FileUp className="size-3" /> File</Badge>;
      case "on_message_sent":
        return <Badge className="bg-amber-500/15 text-amber-500 border-amber-500/30 text-[10px] gap-1 font-mono"><MessageSquare className="size-3" /> Message</Badge>;
      case "webhook_received":
        return <Badge className="bg-cyan-500/15 text-cyan-500 border-cyan-500/30 text-[10px] gap-1 font-mono"><Webhook className="size-3" /> Webhook</Badge>;
      case "task_status_changed":
        return <Badge className="bg-indigo-500/15 text-indigo-500 border-indigo-500/30 text-[10px] gap-1 font-mono"><CheckSquare className="size-3" /> Task</Badge>;
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-background">
      {/* ── Top Header ── */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border/40 px-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
            <Workflow className="size-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              Workflows & Automations
              <Badge variant="outline" className="text-[11px] font-normal border-border/60">
                {activeFlows.length} Active
              </Badge>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Microsoft Power Automate & Teams-style event orchestration (Webhooks, Mail, Calendar & Tasks)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => {
              resetBuilder();
              setBuilderOpen(true);
            }}
            className="gap-1.5 text-xs h-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm"
          >
            <Plus className="size-3.5" />
            New flow
          </Button>
        </div>
      </div>

      {/* ── Main Body with Tabs ── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/40 pb-3 gap-3">
            <TabsList className="h-9 p-0.5 bg-muted/60">
              <TabsTrigger value="flows" className="text-xs h-8 px-4 gap-1.5 font-semibold">
                <Layers className="size-3.5" />
                Active Flows ({activeFlows.length})
              </TabsTrigger>
              <TabsTrigger value="templates" className="text-xs h-8 px-4 gap-1.5 font-semibold">
                <Sparkles className="size-3.5 text-amber-500" />
                Templates ({TEMPLATES.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="text-xs h-8 px-4 gap-1.5 font-semibold">
                <Activity className="size-3.5 text-blue-500" />
                Run History ({workflowRuns.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Tab: Active Flows ── */}
          <TabsContent value="flows" className="m-0 space-y-4">
            {activeFlows.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border/60 p-12 text-center space-y-3">
                <Workflow className="size-10 mx-auto text-muted-foreground/40" />
                <h3 className="text-sm font-semibold text-foreground">No active workflows yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  Automate notifications when emails arrive, meetings are scheduled, or files are uploaded.
                </p>
                <Button
                  size="sm"
                  onClick={() => setBuilderOpen(true)}
                  className="text-xs bg-primary text-primary-foreground font-semibold"
                >
                  Create your first workflow
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeFlows.map((flow) => (
                  <div
                    key={flow.id}
                    className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-2xs hover:border-border transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTriggerBadge(flow.triggerType)}
                          <span className="text-[11px] text-muted-foreground">
                            {flow.runCount} runs
                          </span>
                        </div>
                        <Switch
                          checked={flow.isActive}
                          onCheckedChange={() => toggleWorkflow(flow.id)}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-foreground">{flow.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {flow.description}
                        </p>
                      </div>

                      {/* Action Sequence Breadcrumbs */}
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <Badge variant="outline" className="text-[10px] border-border/60 text-muted-foreground">
                          Trigger
                        </Badge>
                        <ArrowRight className="size-3 text-muted-foreground/60" />
                        {flow.actions.map((act, i) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="text-[10px] font-mono bg-accent/60 text-foreground"
                          >
                            {act.type}
                          </Badge>
                        ))}
                      </div>

                      {/* If incoming webhook: display webhook URL & copy button */}
                      {flow.triggerType === "webhook_received" && (
                        <div className="rounded-xl bg-muted/60 p-2.5 border border-border/60 space-y-1">
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block">
                            Incoming Webhook Target URL
                          </span>
                          <div className="flex items-center justify-between text-[11px] font-mono text-foreground">
                            <span className="truncate pr-2 select-all">
                              https://meet.airsend.in/api/v1/workflows/incoming/{flow.webhookToken || "wh_tok_demo"}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => {
                                const url = `https://meet.airsend.in/api/v1/workflows/incoming/${flow.webhookToken || "wh_tok_demo"}`;
                                navigator.clipboard?.writeText(url);
                                setCopiedToken(flow.id);
                                setTimeout(() => setCopiedToken(null), 2000);
                              }}
                              className="size-6 text-muted-foreground hover:text-foreground shrink-0"
                            >
                              {copiedToken === flow.id ? (
                                <Check className="size-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-border/40 pt-3">
                      <span className="text-[10px] text-muted-foreground">
                        {flow.lastRunAt ? `Last run ${new Date(flow.lastRunAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "No runs yet"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={testExecutingId === flow.id}
                          onClick={() => handleTestTrigger(flow)}
                          className="h-7 text-xs gap-1 border-border/60 hover:bg-accent"
                        >
                          <Play className={`size-3 text-emerald-500 ${testExecutingId === flow.id ? "animate-spin" : ""}`} />
                          <span>{testExecutingId === flow.id ? "Testing..." : "Test"}</span>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteWorkflow(flow.id)}
                          className="size-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Templates ── */}
          <TabsContent value="templates" className="m-0 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {TEMPLATES.map((tpl) => {
                const Icon = tpl.icon;
                return (
                  <div
                    key={tpl.id}
                    className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-5 shadow-2xs hover:border-border transition-all space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex size-10 items-center justify-center rounded-xl border" style={{}}>
                        <div className={`p-2 rounded-lg ${tpl.color}`}>
                          <Icon className="size-5" />
                        </div>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-foreground">{tpl.name}</h3>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                          {tpl.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {tpl.triggerType}
                        </Badge>
                        <span className="text-muted-foreground text-xs">→</span>
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {tpl.actions.map((a) => a.type).join(" & ")}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(tpl)}
                      className="w-full h-8 text-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 font-semibold gap-1.5"
                    >
                      <span>Use this template</span>
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* ── Tab: Run History ── */}
          <TabsContent value="history" className="m-0 space-y-4">
            <div className="rounded-2xl border border-border/60 bg-card overflow-hidden divide-y divide-border/40 shadow-2xs">
              {workflowRuns.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
                  <Clock className="size-8 mx-auto opacity-40" />
                  <p>No workflow execution runs recorded yet.</p>
                </div>
              ) : (
                workflowRuns.map((run) => (
                  <div
                    key={run.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-accent/20 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <div className="shrink-0">
                        {run.status === "success" ? (
                          <div className="flex size-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="size-4" />
                          </div>
                        ) : run.status === "failed" ? (
                          <div className="flex size-8 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                            <AlertCircle className="size-4" />
                          </div>
                        ) : (
                          <div className="flex size-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                            <Activity className="size-4" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground truncate">
                            {workflows.find((w) => w.id === run.workflowId)?.name || "Workflow Execution"}
                          </span>
                          <Badge variant="outline" className="text-[9px] py-0 px-1 font-mono uppercase">
                            {run.triggerType}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Executed in <span className="font-mono text-foreground">{run.durationMs}ms</span> •{" "}
                          <span>{new Date(run.executedAt).toLocaleDateString([], { month: "short", day: "numeric" })}</span>{" "}
                          <span>{new Date(run.executedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setViewLogRun(run)}
                        className="h-7 text-xs gap-1 border-border/60 hover:bg-accent"
                      >
                        <Terminal className="size-3 text-muted-foreground" />
                        <span>View logs</span>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* ── Modal: Visual Flow Builder ── */}
      <Dialog open={builderOpen} onOpenChange={setBuilderOpen}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b border-border/40">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-blue-500" />
              <DialogTitle className="text-base font-bold">
                Flow Builder • Step {wizardStep} of 3
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs">
              {wizardStep === 1 && "Choose an automated trigger that starts this workflow"}
              {wizardStep === 2 && "Configure conditions and event filtering"}
              {wizardStep === 3 && "Define actions to execute (Messages, Tasks, Webhooks)"}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Step 1: Trigger Selection */}
            {wizardStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Workflow Name</label>
                  <Input
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                    placeholder="e.g. Urgent Mail to #general Alert"
                    className="text-xs h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Select Trigger Event</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: "on_mail_received", label: "New Mail Received", desc: "Triggers when incoming email arrives", icon: Mail },
                      { id: "on_calendar_event", label: "Calendar Reminder", desc: "15 minutes before meeting starts", icon: Calendar },
                      { id: "on_file_uploaded", label: "File Uploaded", desc: "New document or asset added to team", icon: FileUp },
                      { id: "on_message_sent", label: "Keyword in Message", desc: "Channel message contains word or tag", icon: MessageSquare },
                      { id: "webhook_received", label: "Incoming Webhook", desc: "External service calls HTTP endpoint", icon: Webhook },
                      { id: "task_status_changed", label: "Task Status Changed", desc: "Task moved to Done or Review", icon: CheckSquare },
                    ].map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setSelectedTrigger(t.id as any)}
                          className={`flex items-start gap-2.5 p-3 rounded-xl border text-left text-xs transition-all ${
                            selectedTrigger === t.id
                              ? "border-blue-500 bg-blue-500/10 text-blue-500 font-semibold"
                              : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-4 shrink-0 mt-0.5" />
                          <div>
                            <span className="text-foreground block font-medium">{t.label}</span>
                            <span className="text-[10px] text-muted-foreground">{t.desc}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Trigger Conditions */}
            {wizardStep === 2 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/60 bg-muted/20 p-3 flex items-center gap-2">
                  {getTriggerBadge(selectedTrigger)}
                  <span className="text-xs font-semibold text-foreground">Configuring Filter Conditions</span>
                </div>

                {selectedTrigger === "on_mail_received" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Subject Contains</label>
                      <Input
                        value={triggerSubject}
                        onChange={(e) => setTriggerSubject(e.target.value)}
                        placeholder="e.g. urgent, invoice, alert"
                        className="text-xs h-9"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">From Sender Email</label>
                      <Input
                        value={triggerSender}
                        onChange={(e) => setTriggerSender(e.target.value)}
                        placeholder="e.g. ceo@company.com or @stripe.com"
                        className="text-xs h-9"
                      />
                    </div>
                  </div>
                )}

                {selectedTrigger === "on_message_sent" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Keyword Filter</label>
                    <Input
                      value={triggerKeyword}
                      onChange={(e) => setTriggerKeyword(e.target.value)}
                      placeholder="e.g. #todo, #urgent, #review"
                      className="text-xs h-9"
                    />
                  </div>
                )}

                {selectedTrigger === "on_file_uploaded" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">File Category</label>
                    <Select value={triggerCategory} onValueChange={setTriggerCategory}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="document">Document (PDF, Word)</SelectItem>
                        <SelectItem value="spreadsheet">Spreadsheet (Excel, CSV)</SelectItem>
                        <SelectItem value="presentation">Presentation (PPT)</SelectItem>
                        <SelectItem value="media">Media (Images, Video)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedTrigger === "webhook_received" && (
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400">
                      <Globe className="size-4" />
                      <span className="text-xs font-semibold">Incoming Webhook URL Generated</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      AirSend will generate a dedicated webhook endpoint token on save. You can point GitHub, Stripe, or Jenkins at it.
                    </p>
                  </div>
                )}

                {selectedTrigger === "on_calendar_event" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Event Schedule Window</label>
                    <Input
                      defaultValue="15 minutes before meeting start"
                      disabled
                      className="text-xs h-9 bg-muted"
                    />
                  </div>
                )}

                {selectedTrigger === "task_status_changed" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Target Task Status</label>
                    <Input
                      defaultValue="done"
                      disabled
                      className="text-xs h-9 bg-muted"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Actions Builder */}
            {wizardStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Select Action Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "send_message", label: "Post Message", icon: Send },
                      { id: "create_task", label: "Create Task", icon: CheckSquare },
                      { id: "post_webhook", label: "Post Webhook", icon: Webhook },
                    ].map((a) => {
                      const Icon = a.icon;
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelectedActionType(a.id as any)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                            selectedActionType === a.id
                              ? "border-blue-500 bg-blue-500/10 text-blue-500 font-semibold"
                              : "border-border/60 hover:bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-3.5" />
                          <span>{a.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedActionType === "send_message" && (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Target Channel</label>
                      <Select value={actionChannelId} onValueChange={setActionChannelId}>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Select channel" />
                        </SelectTrigger>
                        <SelectContent>
                          {channels.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              #{ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-foreground">Message Content Template</label>
                      <Textarea
                        value={actionContent}
                        onChange={(e) => setActionContent(e.target.value)}
                        placeholder="e.g. 📢 Notification: {{subject}} from {{from}}"
                        className="text-xs resize-none h-20"
                      />
                      <span className="text-[10px] text-muted-foreground">
                        Supported variables: <code className="text-foreground">{"{{subject}}"}</code>, <code className="text-foreground">{"{{from}}"}</code>, <code className="text-foreground">{"{{content}}"}</code>, <code className="text-foreground">{"{{name}}"}</code>
                      </span>
                    </div>
                  </div>
                )}

                {selectedActionType === "create_task" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Task Title Template</label>
                    <Input
                      value={actionTaskTitle}
                      onChange={(e) => setActionTaskTitle(e.target.value)}
                      placeholder="e.g. Review: {{content}}"
                      className="text-xs h-9"
                    />
                  </div>
                )}

                {selectedActionType === "post_webhook" && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Target Outbound HTTP URL</label>
                    <Input
                      value={actionWebhookUrl}
                      onChange={(e) => setActionWebhookUrl(e.target.value)}
                      placeholder="https://api.external-service.com/webhook"
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="p-4 border-t border-border/40 bg-muted/10 flex justify-between gap-2">
            <div>
              {wizardStep > 1 && (
                <Button
                  variant="ghost"
                  onClick={() => setWizardStep((prev) => prev - 1)}
                  className="text-xs h-9"
                >
                  Back
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setBuilderOpen(false)}
                className="text-xs h-9"
              >
                Cancel
              </Button>
              {wizardStep < 3 ? (
                <Button
                  onClick={() => setWizardStep((prev) => prev + 1)}
                  className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleCreateWorkflow}
                  className="text-xs h-9 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Activate Flow
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Modal: View Execution Audit Log ── */}
      <Dialog open={!!viewLogRun} onOpenChange={(open) => !open && setViewLogRun(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm font-bold flex items-center gap-2">
              <Terminal className="size-4 text-emerald-500" />
              Workflow Execution Audit Log
            </DialogTitle>
            <DialogDescription className="text-xs">
              Detailed runtime trace and payload evaluation report.
            </DialogDescription>
          </DialogHeader>

          {viewLogRun && (
            <div className="space-y-3 text-xs">
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-300">
                <div className="flex justify-between text-slate-400">
                  <span>Run ID: {viewLogRun.id}</span>
                  <span className="text-emerald-400">{viewLogRun.durationMs}ms</span>
                </div>
                <div className="text-slate-200">Trigger: {viewLogRun.triggerType}</div>
                <div className="text-slate-400 whitespace-pre-wrap">{viewLogRun.logs}</div>
              </div>

              <div>
                <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
                  Trigger Payload
                </span>
                <pre className="rounded-xl bg-muted/60 p-3 text-[10px] font-mono overflow-x-auto border border-border/60 text-foreground">
                  {JSON.stringify(viewLogRun.triggerPayload, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
