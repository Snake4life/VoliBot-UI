import { LolStoreWallet } from "./League/LolStoreWallet";
import { LolSummonerSummoner } from "./League/LolSummonerSummoner";
import { LeagueAccountSettings } from "./LeagueAccountSettings";
import { LeagueAccountStatus } from "./LeagueAccountStatus";
import { LeagueRegion } from "./LeagueRegion";

export class LeagueAccount {
    serverId: string;
    accountId: number;
    username: string;
    password: string;

    region: LeagueRegion;
    settings: LeagueAccountSettings;

    status: LeagueAccountStatus;
    summoner: LolSummonerSummoner | undefined;
    wallet: LolStoreWallet | undefined;

    constructor(
        serverId: string | undefined,
        accountId: number,
        username: string,
        password: string,
        region: LeagueRegion,
        settings: LeagueAccountSettings,
        status: LeagueAccountStatus,
        summoner: LolSummonerSummoner | undefined,
        wallet: LolStoreWallet | undefined,
    ) {
        this.serverId = serverId || "";
        this.accountId = accountId;
        this.username = username;
        this.password = password;
        this.region = region;
        this.settings = settings;
        this.status = status;
        this.summoner = summoner;
        this.wallet = wallet;
    }
}
