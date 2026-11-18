import assert from "node:assert/strict";
import { resolveSafeRedirect as r, withToken } from "./safe-redirect";
const SITE = "https://airsend.in";
const ok = (raw: string) => assert.ok(r(raw, SITE), `should allow ${raw}`);
const no = (raw: string | null) => assert.equal(r(raw, SITE), null, `should refuse ${raw}`);

// the exact case from the report
const pasted = "http://localhost:8085/api/auth/callback?return_to=http%3A%2F%2Flocalhost%3A5173%2F";
ok(pasted);
assert.equal(withToken(r(pasted, SITE)!, "T").searchParams.get("token"), "T");
assert.equal(withToken(r(pasted, SITE)!, "T").searchParams.get("return_to"), "http://localhost:5173/"); // untouched

ok("/v2/u/mail/inbox"); ok("https://meet.airsend.in/x"); ok("https://airsend.in/a"); ok("http://localhost:3000/x"); ok("https://localhost:5173");
no(null); no(""); no("/v2"); no("/v2/"); no("https://evil.com"); no("//evil.com"); no("https://airsend.in.evil.com");
no("https://evil.com/.airsend.in"); no("https://airsend.in@evil.com"); no("http://airsend.in"); // http on a real domain
no("http://127.0.0.1:3000"); no("https://airsend.com"); no("https://airsend.in.localhost.evil.com"); no("javascript:alert(1)"); no("data:text/html,x"); no("https://notairsend.in");
assert.equal(withToken(new URL("https://a.airsend.in/?token=keep"), "T").searchParams.get("token"), "keep");
console.log("safe-redirect: all cases passed");
