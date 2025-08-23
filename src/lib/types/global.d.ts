
declare global {
  interface Window {
    MyAppVersion: string
    emlformat: {
      read: (raw: string, cb: (err: any, data: Record<string, any>) => void) => void;
    };
  }
}

export { }
