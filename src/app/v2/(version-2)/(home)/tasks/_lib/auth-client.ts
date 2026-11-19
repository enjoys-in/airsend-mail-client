import { apiKeyClient } from "@better-auth/api-key/client";
import {
  adminClient,
  anonymousClient,
  deviceAuthorizationClient,
  emailOTPClient,
  inferAdditionalFields,
  inferOrgAdditionalFields,
  lastLoginMethodClient,
  magicLinkClient,
  organizationClient,
} from "better-auth/client/plugins";
import type { AccessControl } from "better-auth/plugins/access";
import { createAuthClient } from "better-auth/react";
import { ac, admin, member, owner, viewer } from "./permissions";

// Auth requests go through the same-origin Next.js proxy (/api/tasks/auth/*),
// which forwards to the Kaneo backend's /api/auth/*. An absolute
// NEXT_PUBLIC_TASKS_API_URL (direct backend access) is also supported.
const publicApiUrl = process.env.NEXT_PUBLIC_TASKS_API_URL || "/api/tasks";
const isAbsoluteApiUrl = /^https?:\/\//.test(publicApiUrl);

const getBaseURL = () => {
  if (!isAbsoluteApiUrl) {
    return typeof window === "undefined"
      ? "http://localhost"
      : window.location.origin;
  }
  const url = new URL(publicApiUrl);
  return `${url.protocol}//${url.host}`;
};

const authBasePath = isAbsoluteApiUrl
  ? "/api/auth"
  : `${publicApiUrl.replace(/\/+$/, "")}/auth`;

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  basePath: authBasePath,
  plugins: [
    anonymousClient(),
    lastLoginMethodClient(),
    magicLinkClient(),
    emailOTPClient(),
    organizationClient({
      // Same widening as the server plugin in `apps/api/src/auth.ts`: our
      // narrow `statement` shape makes `ac`'s inferred `newRole` generic
      // incompatible with better-auth's looser `AccessControl` type.
      ac: ac as AccessControl,
      roles: {
        viewer,
        member,
        admin,
        owner,
      },
      dynamicAccessControl: {
        enabled: true,
      },
      schema: inferOrgAdditionalFields({
        invitation: {
          additionalFields: {
            projectAccess: {
              type: "string",
              input: true,
              required: false,
            },
            projectIds: {
              type: "string[]",
              input: true,
              required: false,
            },
          },
        },
      }),
    }),
    deviceAuthorizationClient(),
    apiKeyClient(),
    adminClient(),
    inferAdditionalFields({
      user: {
        locale: {
          type: "string",
          required: false,
          input: true,
        },
      },
    }),
  ],
});
