import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ServerDetailsProps {
  selectedAccount: {
    email: string;
    password: string;
    enable_imap: boolean;
    enable_smtp: boolean;
  };
}

export function MailServerDetails({ selectedAccount }: ServerDetailsProps) {
  return (
    <div className="space-y-8 mt-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1 text-center md:text-left">
        <h2 className="text-2xl font-bold tracking-tight text-primary">
          Mail Server Configuration
        </h2>
        <p className="text-sm text-muted-foreground">
          Use these settings to configure your mail client for both incoming
          (IMAP) and outgoing (SMTP) connections.
        </p>
      </div>

      {/* Grid for IMAP and SMTP */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Incoming (IMAP) */}
        <Card className="p-6 border shadow-sm rounded-xl bg-card hover:shadow-md transition-shadow">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Incoming Mail (IMAP)
            </CardTitle>
            {!selectedAccount.enable_imap && (
              <CardDescription className="text-destructive mt-1 text-xs font-medium">
                IMAP is not enabled for this account.
              </CardDescription>
            )}
          </CardHeader>
          <div className="space-y-3 text-sm">
            <ServerRow label="Host" value={"mail.enjoys.in"} />
            <ServerRow label="Port" value={`993} (secure: true)`} />
            <ServerRow label="Username / Email" value={selectedAccount.email} />
            <ServerRow
              label="Password"
              value={selectedAccount.password}
              masked
            />
          </div>
        </Card>

        {/* Outgoing (SMTP) */}
        <Card className="p-6 border shadow-sm rounded-xl bg-card hover:shadow-md transition-shadow">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg font-semibold text-foreground">
              Outgoing Mail (SMTP)
            </CardTitle>
            {!selectedAccount.enable_smtp && (
              <CardDescription className="text-destructive mt-1 text-xs font-medium">
                SMTP is not enabled for this account.
              </CardDescription>
            )}
          </CardHeader>
          <div className="space-y-3 text-sm">
            <ServerRow label="Host" value={"mail.enjoys.in"} />
            <ServerRow label="Port" value={`587 (secure: false)`} />
            <ServerRow label="Username / Email" value={selectedAccount.email} />
            <ServerRow
              label="Password"
              value={selectedAccount.password}
              masked
            />
          </div>
        </Card>
      </div>

      {/* Footer Note */}
      <div className="text-xs text-muted-foreground text-center md:text-left">
        ⚙️ If your email client supports SSL/TLS, always enable secure
        connections for better privacy and security.
      </div>
    </div>
  );
}

function ServerRow({
  label,
  value,
  masked,
}: {
  label: string;
  value: string;
  masked?: boolean;
}) {
  return (
    <div className="flex justify-between items-center border-b border-border pb-1">
      <span className="font-medium text-foreground/80">{label}</span>
      <span className="font-mono text-foreground/70 text-right truncate max-w-[60%]">
        {masked ? "••••••••" : value}
      </span>
    </div>
  );
}
