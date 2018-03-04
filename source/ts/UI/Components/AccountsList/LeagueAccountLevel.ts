import {LeagueAccount} from "../../../Models/LeagueAccount";

export class LeagueAccountLevel {
    private client: LeagueAccount;

    get level() { return this.client.summoner &&
                         this.client.summoner.summonerLevel
                         || 0; }
    get percent() { return this.client.summoner &&
                           this.client.summoner.percentCompleteForNextLevel
                           || 0; }

    constructor(x: LeagueAccount) {
        this.client = x;
    }
}
