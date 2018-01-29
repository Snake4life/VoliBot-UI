import { VoliBot } from '../VoliBot';

//TODO: Rename to something that makes sense
export class VoliBotManagerClass{
    voliBotInstances: VoliBot[] = new Array<VoliBot>();
    initialize(){}

    //TODO: Promises?
    addVoliBotInstance(url: string, port: number) {
        return new Promise<boolean>(resolve => {
            try{
                new VoliBot(url, port, x => {
                    resolve(true);
                    this.onVoliBotOpen(x);
                }, (x, y) => {
                    resolve(false);
                    this.onVoliBotClose(x, y);
                });
            }
            catch(e){
                resolve(false);
            }
        });
    }

    private onVoliBotOpen(volibot: VoliBot){
        this.voliBotInstances.push(volibot);
    }

    private onVoliBotClose(bot: VoliBot, args: any){
        this.removeBot(bot);
        args;
    }

    private removeBot(bot: VoliBot){
        var index = this.voliBotInstances.indexOf(bot, 0);
        if (index > -1) {
            this.voliBotInstances.splice(index, 1);
        };
    }
}

export var VoliBotManager = new VoliBotManagerClass(); 