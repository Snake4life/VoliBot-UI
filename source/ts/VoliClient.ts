import { LolStoreWallet } from "./Models/League/LolStoreWallet";
import { LolSummonerSummoner } from "./Models/League/LolSummonerSummoner";
import { VoliClientSettings } from "./VoliClientSettings";

export class VoliClient {
    serverId: string;
    id: number;
    settings: VoliClientSettings;
    status: string;
    summoner: LolSummonerSummoner;
    wallet: LolStoreWallet;

    constructor(
        serverId: string,
        id: number,
        settings: VoliClientSettings,
        status: string,
        summoner: LolSummonerSummoner,
        wallet: LolStoreWallet,
    ) {
        this.serverId = serverId;
        this.id = id;
        this.settings = settings;
        this.status = status;
        this.summoner = summoner;
        this.wallet = wallet;
    }
}
