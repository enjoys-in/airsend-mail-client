import { Metadata } from 'next';
import { 
  Server, ShieldCheck, Zap, Lock, Filter, ArrowRightLeft, 
  ArrowDownToLine, EyeOff, MailCheck, Send, Layers, 
  HardDrive, Globe, Webhook, Fingerprint, CalendarClock,
  ArrowRight, ArrowDown, ArrowUp, Smartphone, Database, Mail, Activity, Radio, Component
} from 'lucide-react';
import React from 'react';

export const metadata: Metadata = {
  title: 'How We Handle Emails | AirSend',
  description: 'A comprehensive technical overview of the AirSend email processing architecture, encompassing security, anti-spam, and advanced delivery pipelines.',
};

export default function HowWeHandleMailsPage() {
  return (
    <div className="container mx-auto px-4 py-16 md:py-24 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500">
          How We Handle Emails
        </h1>
        <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
          A deeply engineered architecture designed for extreme performance, rigorous security, and uncompromising privacy. Every message is processed through a robust, multi-stage pipeline.
        </p>
      </div>

      <div className="space-y-20">
        
        {/* Architecture Overview */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Server className="w-8 h-8 text-blue-500" />
            <h2 className="text-3xl font-bold">Architecture Overview</h2>
          </div>
          
          <ArchitectureFlow />
          
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <FeatureCard 
              icon={<ArrowDownToLine className="w-6 h-6" />}
              title="Scalable Edge Nodes"
              description="Dedicated Stage 0 SMTP listeners for fast acceptance (<200ms) with mid-stream back-pressure. Our resilient outbound nodes use a custom Go-built MTA ensuring advanced TCP pooling, retries, and comprehensive DSN generation."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="High-Speed Queues"
              description="Messages seamlessly enter a Redis-backed multi-stage worker pipeline, handling intense workloads through distributed streams without blocking vital SMTP connections."
            />
            <FeatureCard 
              icon={<HardDrive className="w-6 h-6" />}
              title="Secure At-Rest Storage"
              description="High-speed PostgreSQL stores account metadata, attachments sit in S3-compatible endpoints, while the mail payloads themselves are safeguarded by dual-layer AES and PGP encryption."
            />
          </div>
        </section>

        {/* The Inbound Pipeline */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <ArrowRightLeft className="w-8 h-8 text-indigo-500" />
            <h2 className="text-3xl font-bold">The Inbound Pipeline</h2>
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-8 text-lg">
            Incoming emails pass through four stringent, specialized stages to guarantee fast routing, accurate spam detection, and protocol compliance.
          </p>
          <div className="bg-white dark:bg-neutral-900 rounded-xl p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <ul className="space-y-10 relative">
              <li className="relative">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-black">0</span>
                  Edge Acceptance Layer
                </h3>
                <ul className="grid sm:grid-cols-2 gap-3 text-sm text-neutral-600 dark:text-neutral-400 pl-11 marker:text-indigo-500 list-disc">
                  <li><strong>Instant Blacklist Check:</strong> Redis & DNS Spamhaus RBL lookups drop attacks immediately.</li>
                  <li><strong>Bounce Envelope Detection:</strong> Instant VERP recognition limits processing overhead.</li>
                  <li><strong>Early Rejection:</strong> System accounts (noreply/postmaster) are protected before bodies are parsed.</li>
                  <li><strong>Quota Guard & Size Limits:</strong> Checks usage capacities instantly and enforces explicit max message sizes mid-stream.</li>
                </ul>
              </li>
              <li className="relative">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-black">1</span>
                  Anti-Spam & Authentication 
                </h3>
                <ul className="grid sm:grid-cols-2 gap-3 text-sm text-neutral-600 dark:text-neutral-400 pl-11 marker:text-indigo-500 list-disc">
                  <li><strong>Duplicate Prevention:</strong> Advanced SHA-256 fingerprinting drops spam bursts entirely.</li>
                  <li><strong>Parallel Verification:</strong> PTR, MX, SPF, DKIM, and DMARC evaluated synchronously.</li>
                  <li><strong>TOML-Driven Scoring engine:</strong> Uses DNSBL APIs, OpenPhish, and rule-based DSL logic.</li>
                  <li><strong>Sieve Filter Engine:</strong> Enforces JSON-based rule sets dynamically sorting into folders.</li>
                  <li><strong>ARC Sealing:</strong> Applies comprehensive ARC cryptographic signatures maintaining chain of custody.</li>
                </ul>
              </li>
              <li className="relative">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-black">2</span>
                  Delivery & Real-Time Sync
                </h3>
                <ul className="grid sm:grid-cols-2 gap-3 text-sm text-neutral-600 dark:text-neutral-400 pl-11 marker:text-indigo-500 list-disc">
                  <li><strong>Privacy Stripping:</strong> Intercepts and blocks tracking pixels and URL parameters.</li>
                  <li><strong>Smart Threading:</strong> Deep header analysis groups conversations intelligently.</li>
                  <li><strong>Automatic Responders:</strong> Distinct queues handle looping, auto-replies, and vacation behaviors.</li>
                  <li><strong>Real-time Dispatches:</strong> Socket.IO & Redis Pub/Sub fire inbound notifications instantly.</li>
                </ul>
              </li>
              <li className="relative">
                <h3 className="text-xl font-bold mb-3 flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-sm font-black">3</span>
                  Bounce DSN Management
                </h3>
                <ul className="grid sm:grid-cols-2 gap-3 text-sm text-neutral-600 dark:text-neutral-400 pl-11 marker:text-indigo-500 list-disc">
                  <li><strong>RFC 3464 Compliance:</strong> Standardized multi-part human/machine delivery status generation.</li>
                  <li><strong>Parameter Support:</strong> Respects extensive DSN preferences like RET=FULL/HDRS and NOTIFY logic.</li>
                  <li><strong>Smart Classification:</strong> Seamlessly differentiates between 4xx and 5xx errors translating to user-friendly messages.</li>
                </ul>
              </li>
            </ul>
          </div>
        </section>

        {/* Outbound Features */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <Send className="w-8 h-8 text-teal-500" />
            <h2 className="text-3xl font-bold">The Outbound Pipeline</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <FeatureCard 
              icon={<Filter className="w-6 h-6" />}
              title="Submission & Rate Limiting"
              description="Secure Port 587 handoffs utilizing PLAIN, LOGIN, and XOAUTH2. Tiered per-user rate limits (minute/hour/day) and robust quota verification."
            />
            <FeatureCard 
              icon={<Globe className="w-6 h-6" />}
              title="API Submission & Multi-Provider Bridge"
              description="Full REST API dispatch capability with smart failover strategies wrapping numerous providers (Sendgrid, Resend, etc.) or our custom MTA."
            />
            <FeatureCard 
              icon={<Fingerprint className="w-6 h-6" />}
              title="DKIM & Cryptography"
              description="Dynamically signs payloads at the application level ensuring zero-trust. Sent duplicates are similarly backed by PGP at-rest encryption within your secure sent folder."
            />
            <FeatureCard 
              icon={<Layers className="w-6 h-6" />}
              title="Automated DNS Management"
              description="Automatically scaffolds optimal SPF, DKIM, DMARC, MX, MTA-STS, and Autodiscover records enabling fully compliant domain onboarding."
            />
          </div>
        </section>

        {/* Privacy & Anti-Spam */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <ShieldCheck className="w-8 h-8 text-green-500" />
            <h2 className="text-3xl font-bold">Privacy & Anti-Spam Protection</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex gap-4">
              <EyeOff className="w-8 h-8 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Tracking Protection</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Proactively strips 1x1 pixels and intrusive parameters like <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">utm_*</code> or <code className="bg-neutral-100 dark:bg-neutral-800 px-1 rounded">fbclid</code>. We operate a highly scalable Image Proxy Server that scrubs referrers and ensures zero data leaks when opening messages.
                </p>
              </div>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-xl p-6 border border-neutral-200 dark:border-neutral-800 shadow-sm flex gap-4">
              <MailCheck className="w-8 h-8 text-green-500 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Multi-vector Spam Defense</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                  Leverages multi-layer heuristic evaluations spanning continuous OpenPhish indexing, disposable-domain trapping, IPv6 zone resolution, and explicit attachment classification algorithms.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Security & Webhooks */}
        <section className="grid md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-8 h-8 text-red-500" />
              <h2 className="text-3xl font-bold">At-Rest PGP</h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4">
              Messages are isolated and sealed cryptographically before permanent disk allocation.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-500" />
                Dual-layer: OpenPGP encrypt + Database AES wrapping.
              </li>
              <li className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-500" />
                Argon2id key derivation securely caches private components.
              </li>
              <li className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                <div className="mt-1 w-2 h-2 rounded-full bg-red-500" />
                SRS implementations strictly isolate redirected chains.
              </li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Webhook className="w-8 h-8 text-pink-500" />
              <h2 className="text-3xl font-bold">Event & Webhooks</h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4">
              Integrate smoothly into backend infrastructure through exhaustive system dispatches.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                <div className="mt-1 w-2 h-2 rounded-full bg-pink-500" />
                Publishes rich payloads covering Delivery, Bounce, Rejection, and Failures.
              </li>
              <li className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                <div className="mt-1 w-2 h-2 rounded-full bg-pink-500" />
                Secured strictly via HMAC-SHA256 authenticated signatures.
              </li>
              <li className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                <div className="mt-1 w-2 h-2 rounded-full bg-pink-500" />
                Real-time connection bridging streams direct into frontend sockets.
              </li>
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-6">
              <CalendarClock className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl font-bold">Routine Telemetry</h2>
            </div>
            <p className="text-neutral-600 dark:text-neutral-400 text-lg mb-4">
              Persistent, resilient background workers ensure zero maintenance degradation.
            </p>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                <div className="mt-1 w-2 h-2 rounded-full bg-yellow-500" />
                Automatically purges orphaned multi-part objects and abandoned caches.
              </li>
              <li className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                <div className="mt-1 w-2 h-2 rounded-full bg-yellow-500" />
                ICS calendar consumer seamlessly parses incoming RSVP requests.
              </li>
              <li className="flex items-start gap-2 text-neutral-700 dark:text-neutral-300">
                <div className="mt-1 w-2 h-2 rounded-full bg-yellow-500" />
                MTA-STS adherence validates strict transport layer securities.
              </li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white dark:bg-neutral-900/50 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-blue-500/50 transition-colors">
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">{title}</h3>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function ArchitectureFlow() {
  return (
    <div className="w-full">
      <div className="bg-white dark:bg-neutral-900/50 rounded-2xl border border-neutral-200 dark:border-neutral-800 p-8 py-16 overflow-x-auto shadow-sm relative mb-8">
        <div className="min-w-[900px] flex flex-col items-center relative gap-0">
          
          {/* Top: Browser UI */}
          <div className="z-10 relative flex justify-center w-full">
            <FlowNode icon={<Globe className="text-blue-500 w-6 h-6" />} label="Shared Client UI" desc="Next.js / Browser" />
          </div>

          {/* Paths down from UI to multiple backends */}
          <div className="flex w-[660px] justify-between relative h-24 mt-2">
             <svg className="absolute top-0 left-0 w-full h-full -z-10" style={{ strokeDasharray: "4 4", strokeLinecap: "round" }}>
                {/* To Go Backends */}
                <path d="M 330 0 L 330 15 L 50 15 L 50 96" fill="transparent" stroke="currentColor" className="text-emerald-300 dark:text-emerald-800" strokeWidth="2.5" />
                {/* To Express */}
                <path d="M 330 0 L 330 96" fill="transparent" stroke="currentColor" className="text-indigo-300 dark:text-indigo-800" strokeWidth="2.5" />
                {/* To Sockets */}
                <path d="M 330 0 L 330 15 L 610 15 L 610 96" fill="transparent" stroke="currentColor" className="text-red-200 dark:text-red-900/60" strokeWidth="2.5" />
             </svg>
             
             <div className="absolute top-6 left-[30px] bg-white dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-emerald-600 uppercase tracking-widest rounded-full border border-emerald-200 dark:border-emerald-900 shadow-sm">Go Microservices</div>
             <div className="absolute top-6 left-[285px] bg-white dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-indigo-500 uppercase tracking-widest rounded-full border border-indigo-100 dark:border-indigo-900 shadow-sm">Node REST API</div>
             <div className="absolute top-6 right-[40px] bg-white dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-red-500 uppercase tracking-widest rounded-full border border-red-100 dark:border-red-900 shadow-sm">WebSockets</div>
             
             <ArrowDown className="absolute bottom-1 left-[38px] w-6 h-6 text-emerald-400 dark:text-emerald-700" />
             <ArrowDown className="absolute bottom-1 left-[318px] w-6 h-6 text-indigo-300 dark:text-indigo-800" />
             <ArrowRightLeft className="absolute bottom-1 right-[38px] w-6 h-6 text-red-300 dark:text-red-800" />
          </div>

          {/* Middle: Go Backends, Express API & Socket.IO */}
          <div className="flex w-[820px] justify-between z-10 pt-2 px-8">
             <div className="flex border border-emerald-200 dark:border-emerald-900 rounded-2xl bg-emerald-50/50 dark:bg-emerald-900/10 p-2 gap-2 relative shadow-sm">
               <span className="absolute -top-3 left-4 bg-white dark:bg-neutral-900 px-2 text-[10px] font-bold text-emerald-600 tracking-widest uppercase rounded border border-emerald-200 dark:border-emerald-800">Go Backend</span>
               <FlowNode minimal icon={<CalendarClock className="text-emerald-500 w-5 h-5" />} label="Calendar" desc="ICS / Sync" />
               <FlowNode minimal icon={<Component className="text-emerald-500 w-5 h-5" />} label="Workspace" desc="Teams" />
               <FlowNode minimal icon={<MailCheck className="text-emerald-500 w-5 h-5" />} label="IMAP" desc="Sync Layer" />
             </div>
             
             <div className="flex gap-16 pl-6">
               <FlowNode icon={<Server className="text-indigo-500 w-6 h-6" />} label="Express API" desc="Core Web App" />
               <FlowNode icon={<Radio className="text-red-500 w-6 h-6" />} label="Socket.IO Node" desc="Real-time Events" />
             </div>
          </div>

          {/* Path down to BullMQ Worker (Only from Express & Sockets) */}
          <div className="flex w-[260px] justify-between relative h-24 mt-2 ml-[350px]">
             <svg className="absolute top-0 left-0 w-full h-full -z-10" style={{ strokeDasharray: "4 4", strokeLinecap: "round" }}>
                <path d="M 0 0 L 0 80 L 130 80 L 130 96" fill="transparent" stroke="currentColor" className="text-yellow-400 dark:text-yellow-700" strokeWidth="2.5" />
                <path d="M 260 0 L 260 80 L 130 80 L 130 96" fill="transparent" stroke="currentColor" className="text-pink-300 dark:text-pink-800" strokeWidth="2.5" />
             </svg>
             
             <div className="absolute top-10 left-[-30px] bg-white dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-yellow-600 uppercase tracking-widest rounded-full border border-yellow-200 dark:border-yellow-900 shadow-sm z-10">Queue Jobs</div>
             <div className="absolute top-10 right-[-30px] bg-white dark:bg-neutral-900 px-2 py-0.5 text-[10px] font-bold text-pink-500 uppercase tracking-widest rounded-full border border-pink-200 dark:border-pink-900 shadow-sm z-10">Pub/Sub Events</div>
             
             <ArrowDown className="absolute bottom-1 left-[118px] w-6 h-6 text-yellow-500 dark:text-yellow-700" />
             <ArrowUp className="absolute top-2 right-[-12px] w-6 h-6 text-pink-400 dark:text-pink-700" />
          </div>

          {/* Bottom: External World, BullMQ, Data */}
          <div className="z-10 flex gap-12 pt-2 items-center w-full justify-end pr-8">
             <FlowNode icon={<Database className="text-neutral-500 w-6 h-6" />} label="Data Store" desc="PostgreSQL" />
             
             <div className="relative">
               <FlowNode icon={<Zap className="text-orange-500 w-6 h-6" />} label="BullMQ Workers" desc="Redis Queues" />
               <div className="absolute top-8 left-[-40px] flex items-center gap-1 opacity-50">
                 <ArrowRightLeft className="w-5 h-5 text-neutral-400" />
               </div>
               <div className="absolute top-8 right-[-50px] flex items-center gap-1 opacity-50">
                 <ArrowRightLeft className="w-5 h-5 text-neutral-400" />
               </div>
             </div>

             <FlowNode icon={<ShieldCheck className="text-teal-500 w-6 h-6" />} label="Custom MTA" desc="Ports 25 & 587" />
          </div>

        </div>
      </div>

      {/* Explanatory blocks */}
      <div className="grid md:grid-cols-2 gap-8 bg-neutral-50 dark:bg-neutral-900/40 p-6 sm:p-8 rounded-2xl border border-neutral-100 dark:border-neutral-800 mb-12">
        <div>
           <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Globe className="w-5 h-5 text-blue-500"/> Shared Frontend UI</h3>
           <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
             Our Next.js frontend intelligently routes actions to totally distinct backends depending on the domain. Core mail reading and sending happen via the <strong>Express API</strong>, while real-time incoming mail alerts are continuously streamed through the parallel <strong>Socket.IO</strong> connection. Modern features like Workspace collaboration, Calendar syncing, and IMAP bridges hit our ultra-fast <strong>Go Microservices</strong>.
           </p>
        </div>
        <div>
           <h3 className="text-lg font-bold mb-3 flex items-center gap-2"><Zap className="w-5 h-5 text-orange-500"/> The Worker & MTA Layer</h3>
           <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
             When you send an email, Express drops a job into the <strong>BullMQ/Redis Queues</strong>. The background workers pick it up, format the email, apply tracking/PGP, and hand it to our <strong>Custom MTA</strong> for outbound routing across ports 25 and 587. When the MTA receives a delivery receipt, it drops a message via Redis Pub/Sub back up to <strong>Socket.IO</strong>, which alerts your browser UI.
           </p>
        </div>
      </div>
    </div>
  )
}

function FlowNode({ icon, label, desc, minimal = false }: { icon: React.ReactNode, label: string, desc?: string, minimal?: boolean }) {
  if (minimal) {
     return (
        <div className="flex flex-col items-center text-center w-24 relative p-2">
          <div className="w-10 h-10 bg-white dark:bg-neutral-800 rounded-xl flex items-center justify-center shadow-sm border border-neutral-100 dark:border-neutral-700 mb-2 z-10">
            {icon}
          </div>
          <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{label}</span>
          {desc && <span className="text-[9px] text-neutral-500 mt-0.5 uppercase tracking-wide font-semibold">{desc}</span>}
        </div>
     )
  }

  return (
    <div className="flex flex-col items-center text-center w-36 relative">
      <div className="w-16 h-16 bg-white dark:bg-neutral-800 rounded-2xl flex items-center justify-center shadow-lg border border-neutral-100 dark:border-neutral-700 mb-3 z-10 relative">
        {icon}
      </div>
      <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{label}</span>
      {desc && <span className="text-[11px] text-neutral-500 mt-1 uppercase tracking-wide font-semibold">{desc}</span>}
    </div>
  )
}
