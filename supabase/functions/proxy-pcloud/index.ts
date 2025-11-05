// Proxy pCloud public links to a direct stream with proper CORS and Range support
// This hides pCloud UI and serves only the video bytes

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Origin, Range, Content-Type, Authorization, Accept",
};

serve(async (req: Request) => {
  const { method } = req;
  if (method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const target = url.searchParams.get("url");

    if (!code && !target) {
      return new Response(JSON.stringify({ error: "Missing 'code' or 'url' query param" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let upstreamUrl = "";
    if (code) {
      // Use pCloud public link with download params to get the file stream
      upstreamUrl = `https://u.pcloud.link/publink/show?code=${encodeURIComponent(code)}&download=1&type=video`;
    } else if (target) {
      upstreamUrl = target;
    }

    // Forward Range for seeking support
    const forwardHeaders = new Headers();
    const range = req.headers.get("range");
    if (range) forwardHeaders.set("range", range);
    forwardHeaders.set("user-agent", req.headers.get("user-agent") || "Mozilla/5.0");

    const upstreamResp = await fetch(upstreamUrl, { headers: forwardHeaders, redirect: "follow" });

    // Pass through important headers
    const resHeaders = new Headers(corsHeaders);
    const pass = [
      "content-type",
      "content-length",
      "content-range",
      "accept-ranges",
      "etag",
      "last-modified",
      "cache-control",
    ];
    pass.forEach((h) => {
      const v = upstreamResp.headers.get(h);
      if (v) resHeaders.set(h, v);
    });

    // Default to a common video content-type if missing
    if (!resHeaders.get("content-type")) {
      resHeaders.set("content-type", "video/mp4");
    }

    return new Response(upstreamResp.body, {
      status: upstreamResp.status,
      headers: resHeaders,
    });
  } catch (e) {
    console.error("proxy-pcloud error", e);
    return new Response(JSON.stringify({ error: "Proxy error", details: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});