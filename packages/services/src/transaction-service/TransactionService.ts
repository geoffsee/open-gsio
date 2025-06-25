import { types } from 'mobx-state-tree';

const TransactionService = types
  .model('TransactionService', {})
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

    routeAction: async function (action: string, requestBody: any) {
      const actionHandlers: Record<string, (data: any) => Promise<any>> = {
        PREPARE_TX: self.handlePrepareTransaction,
      };

      const handler = actionHandlers[action];
      if (!handler) {
        throw new Error(`No handler for action: ${action}`);
      }

      return await handler(requestBody);
    },

    handlePrepareTransaction: async function (data: [string, string, string]) {
      const [donerId, currency, amount] = data;
      const CreateWalletEndpoints = {
        bitcoin: '/api/btc/create',
        ethereum: '/api/eth/create',
        dogecoin: '/api/doge/create',
      };

      const walletRequest = await fetch(
        `https://wallets.seemueller.io${CreateWalletEndpoints[currency]}`,
      );
      const walletResponse = await walletRequest.text();
      // console.log({ walletRequest: walletResponse });
      const [address, privateKey, publicKey, phrase] = JSON.parse(walletResponse);

      const txKey = crypto.randomUUID();

      const txRecord = {
        txKey,
        donerId,
        currency,
        amount,
        depositAddress: address,
        privateKey,
        publicKey,
        phrase,
      };

      // console.log({ txRecord });

      const key = `transactions::prepared::${txKey}`;

      await self.env.KV_STORAGE.put(key, JSON.stringify(txRecord));
      // console.log(`PREPARED TRANSACTION ${key}`);

      return {
        depositAddress: address,
        txKey: txKey,
      };
    },

    handleTransact: async function (request: Request) {
      try {
        const raw = await request.text();
        // console.log({ raw });
        const [action, ...payload] = raw.split(',');

        const response = await self.routeAction(action, payload);

        return new Response(JSON.stringify(response), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error('Error handling transaction:', error);
        return new Response(JSON.stringify({ error: 'Transaction failed' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    },
  }));

export default TransactionService;
