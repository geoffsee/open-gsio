import { handleSsr } from '@open-gsio/client/server/index.ts';
import { types } from 'mobx-state-tree';

export default types
  .model('StaticAssetStore', {})
  .volatile(self => ({
    env: {} as Env,
    ctx: {} as ExecutionContext,
  }))
  .actions(self => ({
    setEnv(env: Env) {
      self.env = env;
    },
    setCtx(ctx: ExecutionContext) {
      self.ctx = ctx;
    },
    // @ts-expect-error - Language server doesn't have enough information to validate Vike.PageContext.env
    handleSsr: handleSsr,
    async handleStaticAssets(request: Request, env: Env) {
      try {
        return await env.ASSETS.fetch(request);
      } catch (error) {
        console.error('Error serving static asset:', error);
        return new Response('Asset not found', { status: 404 });
      }
    },
  }));
