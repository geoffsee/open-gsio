import { WorkerEntrypoint } from "cloudflare:workers";
import { createMimeMessage } from "mimetext";
import { EmailMessage } from "cloudflare:email";

export default class EmailWorker extends WorkerEntrypoint {
  async fetch(req, env, ctx) {
    return new Response(undefined, { status: 200 });
  }

  async sendMail({
    plaintextMessage = `You must have wondered where I've been.`,
    to,
  }) {
    const msg = createMimeMessage();
    msg.setSender({
      name: "New Website Contact",
      addr: "contact@seemueller.io",
    });
    console.log("Recipient:", to);
    // msg.setRecipient(to);
    msg.setRecipient(to);
    msg.setSubject("New Contact Request: Website");
    msg.addMessage({
      contentType: "text/plain",
      data: plaintextMessage,
    });

    try {
      const message = new EmailMessage(
        "contact@seemueller.io",
        "geoff@seemueller.io",
        msg.asRaw(),
      );
      await this.env.SEB.send(message);
    } catch (e) {
      return new Response(e.message, { status: 500 });
    }

    return new Response("Message Sent");
  }
}
