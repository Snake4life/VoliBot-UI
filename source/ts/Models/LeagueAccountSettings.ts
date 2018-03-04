export class LeagueAccountSettings {
    queue: number;
    active: boolean;
    targetLevel: number;
    targetBE: number;

    constructor(
        queue: number,
        active: boolean,
        targetLevel: number,
        targetBE: number,
    ) {
        this.queue = queue;
        this.active = active;
        this.targetBE = targetBE;
        this.targetLevel = targetLevel;
    }
}