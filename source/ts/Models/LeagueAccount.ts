import { LeagueAccountSettings } from "../Models/LeagueAccountSettings";
import { LeagueRegion } from "../Models/LeagueRegion";

export class LeagueAccount {
    username: string;
    password: string;
    region: LeagueRegion;
    settings: LeagueAccountSettings;

    constructor(username: string, password: string, region: LeagueRegion, settings: LeagueAccountSettings) {
        this.username = username;
        this.password = password;
        this.region = region;
        this.settings = settings;
    }
}
