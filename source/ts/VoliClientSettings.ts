export class VoliClientSettings {
    id: string;
    region: string;
    queue: number;
    autoplay: boolean;
    targetLevel: number;
    targetBE: number;

    constructor(
        id: string,
        region: string,
        queue: number,
        autoplay: boolean,
        targetLevel: number,
        targetBE: number,
    ) {
        this.id = id;
        this.region = region;
        this.queue = queue;
        this.autoplay = autoplay;
        this.targetLevel = targetLevel;
        this.targetBE = targetBE;
    }
}
