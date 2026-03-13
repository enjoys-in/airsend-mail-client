import { Card, CardContent } from "@/components/ui/card";
import { __config } from "@/constants/config";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import StickyNote from "@/app/h-panel/(home)/api/_components/StickyNote";
import Link from "next/link";

export default function ApiDocs() {
  return (
    <div className="flex">
      <div className="flex-1 md:p-6 p-4">
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Link href="/docs/getting-started">
                {" "}
                <h1 className="text-2xl text-blue-800 dark:text-blue-300 underline md:text-3xl font-bold">
                  See Docs
                </h1>
              </Link>
              <Badge
                variant="secondary"
                className="bg-orange-500 text-netural-500 dark:text-gray-200"
              >
                Beta
              </Badge>
            </div>

            <Alert variant={"destructive"}>
              <AlertTitle className="text-orange-500 text-2xl">
                <strong>Warning</strong>
              </AlertTitle>
              <AlertDescription className="text-netural-800 dark:text-gray-400 text-sm font-sans">
                Never Expose API Keys on the Frontend Since frontend code is
                visible to users, exposing API keys in requests (even in
                headers) makes them vulnerable. Instead, use a backend proxy
              </AlertDescription>
            </Alert>

            <Alert variant={"default"}>
              <AlertTitle className="text-orange-500 text-2xl">
                <strong>Use a Backend Proxy (Recommended)</strong>
              </AlertTitle>
              <AlertDescription className="text-netural-800 dark:text-gray-400 text-sm font-sans">
                Never Expose API Keys on the Frontend Since frontend code is
                visible to users, exposing API keys in requests (even in
                headers) makes them vulnerable. Instead, use a backend proxy
              </AlertDescription>
            </Alert>
            <Alert variant={"default"}>
              <AlertTitle className="text-orange-500 text-2xl">
                <strong>Restrict API Usage by IP or Domain</strong>
              </AlertTitle>
              <AlertDescription className="text-netural-800 dark:text-gray-400 text-sm font-sans">
                If you're using third-party APIs, check if they allow you to
                restrict access by: IP Address: Only allow requests from your
                backend server IP. Referrer Header / CORS: Only allow requests
                from specific domains.
              </AlertDescription>
            </Alert>
            <Alert variant={"default"}>
              <AlertTitle className="text-orange-500 text-2xl">
                <strong> Use OAuth or JWT Tokens for Authentication</strong>
              </AlertTitle>
              <AlertDescription className="text-netural-800 dark:text-gray-400 text-sm font-sans">
                Instead of API keys, use a secure authentication mechanism:
                OAuth: Many APIs offer OAuth authentication, which provides
                temporary access tokens. JWT (JSON Web Token): Authenticate
                users via JWT tokens instead of exposing API secrets.
              </AlertDescription>
            </Alert>

            <Alert variant={"default"}>
              <AlertTitle className="text-orange-500 text-2xl">
                <strong> Implement Rate Limiting & Logging</strong>
              </AlertTitle>
              <AlertDescription className="text-netural-800 dark:text-gray-400 text-sm font-sans">
                To prevent abuse: Rate Limiting: Limit the number of requests
                per user/IP using tools like express-rate-limit. Logging &
                Monitoring: Monitor API usage with logs to detect suspicious
                activity.
              </AlertDescription>
            </Alert>
          </div>

          <Card className="rounded-none">
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <pre>
                  <code className="text-sm text-gray-400 whitespace-pre">
                    {`
import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.post('/api/proxy-endpoint', async (req, res) => {
  try {
    const response = await axios.post('https://thirdparty.com/api', req.body, {
      headers: {
        'API-KEY': process.env.API_KEY,
        'API-SECRET': process.env.API_SECRET,
      },
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Something went wrong' });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
`}
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <StickyNote />
    </div>
  );
}
