/**
 * Event Bridge - React Provider
 * Thin lifecycle wrapper — initializes/destroys the EventBridgeService.
 * Does NOT hold mail state — Dexie is the source of truth.
 */

"use client";

import { useEffect, useRef } from 'react';
import { appSocket } from '@/lib/sockets/socket';
import { instance } from '@/lib/api/api.instance';
import { useAppSelector } from '@/store/hooks';
import { eventBridge } from '@/lib/event-bridge';
import { installSyncGate } from '@/lib/event-bridge/sync-gate';

/** Install the sync gate interceptor once (module level) */
let gateInstalled = false;

export function EventBridgeProvider({ children }: { children: React.ReactNode }) {
  const currAcc = useAppSelector((state) => state.accounts.currAccount);
  const initializedRef = useRef(false);

  // Install sync gate on first mount (once per app lifetime)
  useEffect(() => {
    if (!gateInstalled) {
      installSyncGate(instance);
      gateInstalled = true;
    }
  }, []);

  // Initialize/destroy bridge based on account
  useEffect(() => {
    const email = currAcc?.email;
    if (!email) {
      if (initializedRef.current) {
        eventBridge.destroy();
        initializedRef.current = false;
      }
      return;
    }

    // Init the service
    eventBridge.init(email);
    initializedRef.current = true;

    // Attach to socket when it connects
    const handleConnect = () => {
      eventBridge.attach(appSocket);
    };

    // If already connected, attach immediately
    if (appSocket.connected) {
      eventBridge.attach(appSocket);
    }

    appSocket.on('connect', handleConnect);

    // On reconnect, the service internally calls resume()
    // (handled inside event-bridge.service.ts via 'reconnect' listener)

    return () => {
      appSocket.off('connect', handleConnect);
    };
  }, [currAcc?.email]);

  // Cleanup on true unmount
  useEffect(() => {
    return () => {
      eventBridge.destroy();
      initializedRef.current = false;
    };
  }, []);

  return <>{children}</>;
}
