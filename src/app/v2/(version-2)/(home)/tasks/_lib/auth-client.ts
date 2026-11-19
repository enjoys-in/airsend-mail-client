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
import { getTasksApiUrl, resolveApiBaseUrl } from "@tasks/_packages/libs/api-url";
import { ac, admin, member, owner, viewer } from "./permissions";

// Session and workspace calls go straight to the Kaneo backend (/api/auth/*). It reads the AirSend `access_token`
// cookie, which the browser sends because credentials are included and the backend is on the same site.
const apiUrl = new URL(resolveApiBaseUrl(getTasksApiUrl()));
const getBaseURL = () => apiUrl.origin;
const authBasePath = `${apiUrl.pathname.replace(/\/+$/, "")}/auth`;

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
  basePath: authBasePath,
  fetchOptions: { credentials: "include" },
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
