addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event));
});

async function handleRequest(event) {
  const url = new URL(event.request.url);
  const { request } = event;
  const { headers } = request;

  const referer = headers.get("Referer") || "";
  const userAgent = headers.get("User-Agent");
  const refHost = (() => {
    try {
      return new URL(referer).hostname;
    } catch (e) {
      return "";
    }
  })();
  const uuid = getOrCreateUuid(headers);

  event.waitUntil(logAnalyticsData(event, url, uuid, userAgent, referer));

  const response = new Response(null, {
    status: 204,
    statusText: "No Content",
  });

  if (!headers.get("cookie")?.includes("uuid=")) {
    response.headers.set(
      "Set-Cookie",
      `uuid=${uuid}; Expires=${new Date(Date.now() + 365 * 86400 * 30 * 1000).toUTCString()}; Path='/';`,
    );
  }

  return response;
}

function shouldBlockRequest(refHost, userAgent, url) {
  if (!refHost || !userAgent || !url.search.includes("ga=")) {
    return true;
  }
  return false;
}

function getOrCreateUuid(headers) {
  const cookie = headers.get("cookie") || "";
  const uuidMatch = cookie.match(/uuid=([^;]+)/);
  if (uuidMatch) {
    return uuidMatch[1];
  }
  return crypto.randomUUID();
}

async function logAnalyticsData(event, url, uuid, userAgent, pageUrl) {
  const { ANALYTICS_ENGINE } = globalThis;
  const params = url.searchParams;

  const dataPoint = {
    blobs: [
      pageUrl, // Page URL
      userAgent, // User Agent
      params.get("dt") || "", // Page Title
      params.get("de") || "", // Document Encoding
      params.get("dr") || "", // Document Referrer
      params.get("ul") || "", // User Language
      params.get("sd") || "", // Screen Colors
      params.get("sr") || "", // Screen Resolution
      params.get("vp") || "", // Viewport Size
      uuid, // Client ID
    ],
    doubles: [
      parseFloat(params.get("plt") || "0"), // Page Load Time
      parseFloat(params.get("dns") || "0"), // DNS Time
      parseFloat(params.get("pdt") || "0"), // Page Download Time
      parseFloat(params.get("rrt") || "0"), // Redirect Response Time
      parseFloat(params.get("tcp") || "0"), // TCP Connect Time
      parseFloat(params.get("srt") || "0"), // Server Response Time
      parseFloat(params.get("dit") || "0"), // DOM Interactive Time
      parseFloat(params.get("clt") || "0"), // Content Loaded Time
    ],
    indexes: [
      event.request.headers.get("CF-Connecting-IP") || "", // User IP
    ],
  };

  ANALYTICS_ENGINE.writeDataPoint(dataPoint);
}
