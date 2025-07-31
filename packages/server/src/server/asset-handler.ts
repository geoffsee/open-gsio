import { readdir } from 'node:fs/promises';

export const assetHandler = {
  ASSETS: {
    /**
     * Fetches the requested static asset from local dist
     *
     * @param {Request} request - The incoming Fetch API Request object.
     * @returns {Promise<Response>} A Promise that resolves with the Response for the requested asset,
     *                              or a 404 Response if the asset is not found or an error occurs.
     */
    async fetch(request: Request): Promise<Response> {
      // Serialize incoming request URL
      const originalUrl = new URL(request.url);
      const url = new URL(request.url);

      // Fixed path: go up to packages level, then to client/public
      const PUBLIC_DIR = new URL('../../../client/public/', import.meta.url).pathname;

      let publicFiles: string[] = [];
      try {
        publicFiles = await readdir(PUBLIC_DIR, { recursive: true });
      } catch (error) {
        console.warn(`Could not read public directory ${PUBLIC_DIR}:`, error);
        // Continue without public files list
      }

      // Get the filename from pathname and remove any path traversal attempts
      const filename = url.pathname.split('/').pop()?.replace(/\.\./g, '') || '';

      const isStatic = publicFiles.some(file => file === filename);

      if (url.pathname === '/') {
        url.pathname = '/index.html';
      } else if (isStatic && !url.pathname.startsWith('/static')) {
        // leave it alone
      } else if (isStatic) {
        url.pathname = `/static${url.pathname}`;
      }

      // Fixed path: go up to packages level, then to client/dist/client
      const dist = new URL('../../../client/dist/client', import.meta.url).pathname;

      try {
        return new Response(Bun.file(`${dist}${url.pathname}`));
      } catch (error) {
        // Log the error with the original requested path
        console.error(`Error reading asset from path ${originalUrl.pathname}:`, error);
        return new Response(null, { status: 404 });
      }
    },
  },
};
