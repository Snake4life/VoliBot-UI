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
}