
import type { NextRequest } from 'next/server';

export const runtime = 'edge';
type ResponseInfo = {
  url: string;
  host: string,
  status: number;
  statusText: string;
  duration?: string | null;
  icons: {
    sizes?: string;
    href: string;
  }[]
}
// Fetch favicons from a given URL and return ResponseInfo
const getFavicons = async ({ url, headers }: { url: string, headers?: Headers }): Promise<ResponseInfo> => {
  const newUrl = new URL(url); // Create a URL object to extract the host

  try {
    // Perform the fetch request with optional headers and redirection follow
    const response = await fetch(newUrl.toString(), {
      method: "GET",
      redirect: "follow",
      headers
    });

    const body = await response.text();
    const responseUrl = new URL(response.url);

    // Regex to match <link> tags with "rel" containing "icon"
    const regex = /<link[^>]*rel=['"]?[^\s]*icon['"]?[^>]*?>/gi;
    const matches = Array.from(body.matchAll(regex));
    const icons: { sizes: string, href: string }[] = [];

    matches.forEach((match) => {
      const linkTag = match[0];

      // Extract href value
      const hrefMatch = linkTag.match(/href=['"]?([^\s>'"]*)['"]?/i);
      const href = hrefMatch ? hrefMatch[1] : null;

      // Extract sizes value
      const sizesMatch = linkTag.match(/sizes=['"]?([^\s>'"]*)['"]?/i);
      const sizes = sizesMatch ? sizesMatch[1] : null;

      if (href) {
        icons.push({
          sizes: sizes || 'unknown',
          href: (href.startsWith('http') || href.startsWith('data:image')) ? href : `${responseUrl.protocol}//${responseUrl.host}${/^\/.*/.test(href) ? href : `/${href}`}`
        });
      }
    });

    return {
      url: responseUrl.href,
      host: responseUrl.host,
      status: response.status,
      statusText: response.statusText,
      icons
    };
  } catch (error: any) {
    console.error(`Error fetching favicons: ${error.message}`);
    return {
      url: newUrl.href,
      host: newUrl.host,
      status: 500,
      statusText: 'Failed to fetch icons',
      icons: []
    };
  }
};

// Function to fetch favicon from alternative sources
const proxyFavicon = async ({ domain }: { domain: string; }) => {
  // List of alternative sources to fetch favicons
  const sources = [
    `https://www.google.com/s2/favicons?domain=${domain}`,
    `https://icons.duckduckgo.com/ip3/${domain}.ico`
    // `https://icon.horse/icon/${domain}`
  ];
  let response: Response = new Response("", {
    status: 500
  });

  // Attempt to fetch favicon from each source
  for (const source of sources) {
    try {
      response = await fetch(source, {
        redirect: 'follow'
      });
      if (response.ok) {
        console.log("icon source ok:", source);
        break;
      }
    } catch (error: any) {
      console.error(`Error fetching proxy favicon: ${error.message}`, source);
    }
  }
  if (!response.ok) {
    const firstLetter = domain.charAt(0).toUpperCase();
    const svgContent = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#cccccc"/>
        <text x="50%" y="50%" font-size="48" text-anchor="middle" dominant-baseline="middle" fill="#000000">${firstLetter}</text>
      </svg>
    `;
    return new Response(svgContent, {
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=86400',
        'Content-Type': 'image/svg+xml'
      }
    });
  } else {
    // Return the fetched favicon
    return new Response(response.body, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/x-icon',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

};
export async function GET(request: NextRequest, { params }: any ) {
  const startTime = Date.now();
  const { domain } = await params;

  // Validate domain name format
  if (!/([a-z0-9-]+\.)+[a-z0-9]{1,}$/.test(domain)) {
    return new Response(`Invalid domain name format${domain}`, { status: 400 });
  }

  // Define a helper function to handle the response
  const handleResponse = (data: ResponseInfo, status: number, statusText: string) => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(3);
    return new Response(JSON.stringify({ ...data, duration }, null, 2), {
      status,
      statusText,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  // Fetch favicons using HTTP
  let data: ResponseInfo = { url: '', host: '', status: 500, statusText: '', icons: [] };
  let url = `http://${domain}`;

  try {
    data = await getFavicons({ url });
    if (data.status === 530) return handleResponse(data, 530, 'Error 530');
    if (data.icons.length > 0) return handleResponse(data, 200, 'ok');
  } catch (error: any) {
    console.error('Error fetching HTTP favicons:', error.message);
  }

  // Retry with HTTPS
  url = `https://${domain}`;
  try {
    data = await getFavicons({ url });
    if (data.status === 530) return handleResponse(data, 530, 'Error 530');
    if (data.icons.length > 0) return handleResponse(data, 200, 'ok');
  } catch (error: any) {
    console.error('Error fetching HTTPS favicons:', error.message);
  }

  // Try alternative sources
  const sources = [
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(domain)}.ico`,
    `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=100`,
  ];

  const icons: { href: string; sizes?: string; }[] = [];

  for (const source of sources) {
    try {
      const response = await fetch(source, {
        method: request.method,
        headers: request.headers,
        redirect: 'follow'
      });

      if (response.ok) {
        icons.push({ href: source, sizes: "unknown" });
      }
    } catch (error: any) {
      console.error(`Error fetching from ${source}: ${error.message}`);
    }
  }

  // If all attempts fail, use a placeholder SVG
  if (icons.length === 0) {
    const firstLetter = domain.charAt(0).toUpperCase();
    const svgContent = `
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#cccccc"/>
        <text x="50%" y="50%" font-size="48" text-anchor="middle" dominant-baseline="middle" fill="#000000">${firstLetter}</text>
      </svg>
    `;
    const base64Svg = `data:image/svg+xml;base64,${btoa(svgContent)}`;
    icons.push({
      sizes: '100x100',
      href: base64Svg
    });
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(3);
  return new Response(JSON.stringify({ url, host: new URL(url).host, status: 200, statusText: "ok", icons, duration: `${duration} s` }, null, 2), {
    status: 200,
    statusText: "ok",
    headers: { 'Content-Type': 'application/json' }
  });
}