import {VoliClient} from "../../../VoliClient";

export class VoliClientLevel {
    private client: VoliClient;

    get level() { return this.client.summoner &&
                         this.client.summoner.summonerLevel
                         || 0; }
    get percent() { return this.client.summoner &&
                           this.client.summoner.percentCompleteForNextLevel
                           || 0; }

    constructor(x: VoliClient) {
        this.client = x;
    }
}
