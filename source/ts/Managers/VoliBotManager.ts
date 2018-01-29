import { VoliBot } from '../VoliBot';

//TODO: Rename to something that makes sense
export class VoliBotManagerClass{
    voliBotInstances: VoliBot[] = new Array<VoliBot>();
    initialize(){}

    addVoliBotInstance(url: string, port: number) {
        new VoliBot(url, port, x => {
            this.onVoliBotOpen(x)
        }, (x, y) => {
            this.onVoliBotClose(x, y)
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