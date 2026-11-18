"use client";

import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WorkspaceErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("WorkspaceErrorBoundary caught an error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-[300px] w-full flex-1 flex-col items-center justify-center p-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4 shadow-sm">
            <AlertTriangle className="size-7" />
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            {this.props.fallbackTitle || "Something went wrong in this workspace view"}
          </h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            {this.state.error?.message || "An unexpected error occurred while loading this view."}
          </p>
          <div className="mt-5 flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="gap-2"
            >
              <RefreshCw className="size-3.5" />
              Try again
            </Button>
            <Link href="/v2/workspace">
              <Button size="sm" className="gap-2">
                <Home className="size-3.5" />
                Workspace Home
              </Button>
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WorkspaceErrorBoundary;
