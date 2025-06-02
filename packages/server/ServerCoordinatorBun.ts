import {BunSqliteKVNamespace} from "./storage/BunSqliteKVNamespace";


class BunDurableObject {
    state;
    env;

    constructor(state, env) {
        this.state = state;
        this.env = env;
    }

    public static idFromName(name: string) {
        return name.split("~")[1];
    }

    public static get(objectId) {
        const env = getEnvForObjectId(objectId, this.env);
        const state = {};
        return new SiteCoordinator(state, env)
    }
}

type ObjectId = string;

function getEnvForObjectId(objectId: ObjectId, env: any): any {
    return {
        ...env,
        KV_STORAGE: new BunSqliteKVNamespace()
    }
}

export default class SiteCoordinator extends BunDurableObject {
    state;
    env;
    constructor(state: any, env: any) {
        super(state, env);
        this.state = state;
        this.env = env;
    }

    async dynamicMaxTokens(input: any, maxOuputTokens: any) {
        return 2000;
    }



    async saveStreamData(streamId: string, data: any, ttl = 10) {
        const expirationTimestamp = Date.now() + ttl * 1000;
        await this.env.KV_STORAGE.put(
            `streams:${streamId}`,
            JSON.stringify({ data, expirationTimestamp }),
        );
    }

    async getStreamData(streamId: string) {
        const streamEntry = await this.env.KV_STORAGE.get(`streams:${streamId}`);
        if (!streamEntry) {
            return null;
        }

        const { data, expirationTimestamp } = JSON.parse(streamEntry);
        if (Date.now() > expirationTimestamp) {
            await this.deleteStreamData(`streams:${streamId}`);
            return null;
        }

        return data;
    }

    async deleteStreamData(streamId: string) {
        await this.env.KV_STORAGE.delete(`streams:${streamId}`);
    }
}
