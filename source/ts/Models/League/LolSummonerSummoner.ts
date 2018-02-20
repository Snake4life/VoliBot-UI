import { LolSummonerSummonerRerollPoints } from './LolSummonerSummonerRerollPoints'

export class LolSummonerSummoner {
    accountId: number;
    displayName: string;
    internalName: string;
    lastSeasonHighestRank: string;
    percentCompleteForNextLevel: number;
    profileIconId: number;
    puuid: string; 
    rerollPoints: LolSummonerSummonerRerollPoints;
    summonerId: number;
    summonerLevel: number;
    xpSinceLastLevel: number;
    xpUntilNextLevel: number;

    constructor(
        accountId: number,
        displayName: string,
        internalName: string,
        lastSeasonHighestRank: string,
        percentCompleteForNextLevel: number,
        profileIconId: number,
        puuid: string,
        rerollPoints: LolSummonerSummonerRerollPoints,
        summonerId: number,
        summonerLevel: number,
        xpSinceLastLevel: number,
        xpUntilNextLevel: number,
    ){
        this.accountId = accountId;
        this.displayName = displayName;
        this.internalName = internalName;
        this.lastSeasonHighestRank = lastSeasonHighestRank;
        this.percentCompleteForNextLevel = percentCompleteForNextLevel;
        this.profileIconId = profileIconId;
        this.puuid = puuid
        this.rerollPoints = rerollPoints;
        this.summonerId = summonerId;
        this.summonerLevel = summonerLevel;
        this.xpSinceLastLevel = xpSinceLastLevel;
        this.xpUntilNextLevel = xpUntilNextLevel;
    }
}