import { LolSummonerSummoner } from "./Models/League/LolSummonerSummoner";
import { LolStoreWallet } from "./Models/League/LolStoreWallet";

export class VoliClient {
    id: number;
    settings: VoliClientSettings;
    status: string;
    summoner: LolSummonerSummoner;
    wallet: LolStoreWallet;
}

export class VoliClientSettings {
    autoPlay: boolean;

    // TODO: Split this into a "LeagueQueue" enum, then add the UI elements in "ComponentAddAccounts" from that enum instead of hardcoding them?
    queue: number;
}