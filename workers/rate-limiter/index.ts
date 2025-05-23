interface Env {
  TEXT2IMAGE_RATE_LIMITER: any;
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);

    const { success } = await env.TEXT2IMAGE_RATE_LIMITER.limit({
      key: pathname,
    });
    if (!success) {
      const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 150" width="500" height="150">
                    <rect width="100%" height="100%" fill="#f8d7da" />
                    <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="24" fill="#721c24">
                        Sorry! Rate limit exceeded, try again in a couple minutes.
                    </text>
                </svg>
            `;
      return new Response(svg, {
        status: 429,
        headers: {
          "Content-Type": "image/svg+xml",
        },
      });
    }

    return new Response(`Success!`);
  },
} satisfies ExportedHandler<Env>;
