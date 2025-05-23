import IPParser from "./ip-parser";
import blockList from "./block-list-ipv4.txt";

interface Env {
  KV_STORAGE: KVNamespace;
  WORKER_SITE: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const ip = getIp(request);
      if (ip !== "::1") {
        return await runVpnBlocker(request, env);
      } else {
        return forwardRequest(request, env);
      }
    } catch (e) {
      throw "Server Error";
    }
  },
} satisfies ExportedHandler<Env>;

function forwardRequest(request, env) {
  // Forward the request to the origin
  return env.WORKER_SITE.fetch(request);
}

const getIp = (request) => {
  try {
    try {
      const ipv4 = IPParser.parseIP(request.headers.get("CF-Connecting-IP"));
      return ipv4;
    } catch (e) {
      const v6ToV4 = IPParser.parseIP(request.headers.get("Cf-Pseudo-IPv4"));
      return v6ToV4;
    }
  } catch (e) {
    const fallback = request.headers.get("CF-Connecting-IP") as string;
    if (!fallback) {
      throw "Missing CF-Connecting-IP header";
    }
    return fallback;
  }
};

function runVpnBlocker(request, env) {
  const reqIp = getIp(request).join(".");

  if (!reqIp) {
    return new Response("Missing IP address", { status: 400 });
  }

  const blockListContent: string = blockList as unknown as string;

  const blocked = blockListContent
    .split("\n")
    .some((cidr: string) => IPParser.isInRange(reqIp, cidr));

  if (blocked) {
    return new Response("Access Denied.\nReason: VPN Detected!\nCode: 403", {
      status: 403,
    });
  }
  return forwardRequest(request, env);
}
