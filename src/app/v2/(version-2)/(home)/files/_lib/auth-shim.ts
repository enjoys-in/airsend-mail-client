"use client";

export const authClient: any = {
  useSession: () => ({
    data: {
      user: {
        id: "current-user",
        name: "User",
        email: "user@airsend.in",
        image: null,
      },
      session: {
        id: "current-session",
        userId: "current-user",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    },
    isPending: false,
  }),
  getSession: async () => ({
    data: {
      user: {
        id: "current-user",
        name: "User",
        email: "user@airsend.in",
        image: null,
      },
      session: {
        id: "current-session",
        userId: "current-user",
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
      },
    },
  }),
  signIn: {
    social: async (_opts?: any) => ({ data: null, error: null }),
    email: async (_opts?: any) => ({ data: null, error: null }),
  },
  signUp: {
    email: async (_opts?: any) => ({ data: null, error: null }),
  },
  signOut: async () => {},
  unlinkAccount: async (_provider?: string, _accountId?: string) => ({ error: null }),
  linkSocial: async (_opts?: any) => {},
  changePassword: async (_opts?: any) => {},
  changeEmail: async (_opts?: any) => {},
  updateUser: async (_opts?: any) => {},
  forgetPassword: async (_opts?: any) => ({ data: null, error: null }),
  resetPassword: async (_opts?: any) => ({ data: null, error: null }),
  checkout: async (_opts?: any) => ({ data: null, error: null }),
  customer: {
    subscriptions: {
      list: async (_opts?: any) => ({ data: { result: { items: [] } }, error: null }),
    },
  },
  customerPortal: async () => {},
};

export default authClient;
