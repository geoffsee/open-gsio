// ContactService.ts
import { ContactRecord, Schema } from '@open-gsio/schema';
import { types, flow, getSnapshot } from 'mobx-state-tree';

export default types
  .model('ContactStore', {})
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
    handleContact: flow(function* (request: Request) {
      try {
        const { markdown: message, email, firstname, lastname } = yield request.json();
        const contactRecord = Schema.ContactRecord.create({
          message,
          timestamp: new Date().toISOString(),
          email,
          firstname,
          lastname,
        });
        const contactId = crypto.randomUUID();
        yield self.env.KV_STORAGE.put(
          `contact:${contactId}`,
          JSON.stringify(getSnapshot(contactRecord)),
        );

        yield self.env.EMAIL_SERVICE.sendMail({
          to: 'geoff@seemueller.io',
          plaintextMessage: `WEBSITE CONTACT FORM SUBMISSION
${firstname} ${lastname}
${email}
${message}`,
        });

        return new Response('Contact record saved successfully', {
          status: 200,
        });
      } catch (error) {
        console.error('Error processing contact request:', error);
        return new Response('Failed to process contact request', {
          status: 500,
        });
      }
    }),
  }));
