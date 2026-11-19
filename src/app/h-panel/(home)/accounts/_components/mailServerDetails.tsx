import { Pill, Section } from "@/components/h-panel/kit";

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
    <Section
      title="Mail server settings"
      description={`Use these settings to set up ${selectedAccount.email} in a mail client, for incoming (IMAP) and outgoing (SMTP) mail.`}
    >
      <div className="grid gap-6 md:grid-cols-2">
        {/* Incoming (IMAP) */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-medium">Incoming mail (IMAP)</h3>
            {!selectedAccount.enable_imap && <Pill tone="red">Not enabled</Pill>}
          </div>
          <div className="divide-y divide-border/70 text-sm">
            <ServerRow label="Host" value={"mail.enjoys.in"} />
            <ServerRow label="Port" value={`993 (secure: true)`} />
            <ServerRow label="Username / email" value={selectedAccount.email} />
            <ServerRow label="Password" value={selectedAccount.password} masked />
          </div>
        </div>

        {/* Outgoing (SMTP) */}
        <div>
          <div className="mb-3 flex items-center gap-2">
            <h3 className="text-sm font-medium">Outgoing mail (SMTP)</h3>
            {!selectedAccount.enable_smtp && <Pill tone="red">Not enabled</Pill>}
          </div>
          <div className="divide-y divide-border/70 text-sm">
            <ServerRow label="Host" value={"mail.enjoys.in"} />
            <ServerRow label="Port" value={`587 (secure: false)`} />
            <ServerRow label="Username / email" value={selectedAccount.email} />
            <ServerRow label="Password" value={selectedAccount.password} masked />
          </div>
        </div>
      </div>

      <p className="mt-5 text-xs text-muted-foreground">
        If your mail client supports SSL/TLS, always enable secure connections for better privacy and security.
      </p>
    </Section>
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
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] truncate text-right font-mono text-xs">
        {masked ? "••••••••" : value}
      </span>
    </div>
  );
}
