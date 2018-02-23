import {VoliClient} from "../../../VoliClient";

export class VoliClientLevel {
    private client: VoliClient;

    get level() { return this.client.summoner.summonerLevel; }
    get percent() { return this.client.summoner.percentCompleteForNextLevel; }

    constructor(x: VoliClient) {
        this.client = x;
    }
}
