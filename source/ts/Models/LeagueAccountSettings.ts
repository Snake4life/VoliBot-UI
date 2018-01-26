export default class LeagueAccountSettings{
    queue: number;
    autoplay: boolean;

    constructor(queue: number, autoplay: boolean){
        this.queue = queue;
        this.autoplay = autoplay;
    }
}