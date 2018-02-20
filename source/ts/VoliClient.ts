import { LolSummonerSummoner } from "./Models/League/LolSummonerSummoner";
import { LolStoreWallet } from "./Models/League/LolStoreWallet";

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
        wallet: LolStoreWallet
    ){
        this.serverId = serverId;
        this.id = id;
        this.settings = settings;
        this.status = status;
        this.summoner = summoner;
        this.wallet = wallet;
    }
}

export class VoliClientSettings {
    autoPlay: boolean;

    // TODO: Split this into a "LeagueQueue" enum, then add the UI elements in "ComponentAddAccounts" from that enum instead of hardcoding them?
    queue: number;

    constructor(autoPlay: boolean, queue: number){
        this.autoPlay = autoPlay;
        this.queue = queue;
    }
}