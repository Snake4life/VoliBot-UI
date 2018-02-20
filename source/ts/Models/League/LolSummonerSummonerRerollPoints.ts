export class LolSummonerSummonerRerollPoints {
    pointsToReroll: number;
    currentPoints: number;
    numberOfRolls: number;
    maxRolls: number;
    pointsCostToRoll: number;

    constructor(
        pointsToReroll: number,
        currentPoints: number,
        numberOfRolls: number,
        maxRolls: number,
        pointsCostToRoll: number
    ){
        this.pointsToReroll = pointsToReroll;
        this.currentPoints = currentPoints;
        this.numberOfRolls = numberOfRolls;
        this.maxRolls = maxRolls;
        this.pointsCostToRoll = pointsCostToRoll;
    }
}