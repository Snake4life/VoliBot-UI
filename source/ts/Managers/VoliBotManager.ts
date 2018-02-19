import { VoliBot } from '../VoliBot';

//TODO: Rename to something that makes sense
export class VoliBotManagerClass{
    private voliBotInstances: VoliBot[] = new Array<VoliBot>();
	private defaultWsCallbacks: { [id: string] : (data: any) => void } = { };

    initialize(){

    }

    addCallbackHandler(id: string, handler: (data: any) => void) {
        //HERE
		if (this.defaultWsCallbacks[id]){
			this.defaultWsCallbacks[id] = (x) => {
				this.defaultWsCallbacks[id](x);
				handler(x);
			};
		}else{
            this.defaultWsCallbacks[id] = handler;
            this.do(x => {
                x.addCallbackHandler(id, handler);
            });
		}
	}

    do(x: (voliBotInstance: VoliBot) => void){
        this.voliBotInstances.forEach(x);
    }

    get connectedInstanceCount() {
        return this.voliBotInstances.length;
    }

    getSorted(compareFn: (a: VoliBot, b: VoliBot) => number){
        return this.voliBotInstances.sort(compareFn);
    }

    get instanceWithLeastAccounts() {
        if (this.voliBotInstances.length <= 0) return null;
        return this.voliBotInstances.sort((a,b) => (a.ClientCount > b.ClientCount) ? 1 : ((b.ClientCount > a.ClientCount) ? -1 : 0))[0];
    }

    async addVoliBotInstance(url: string, port: number) {
        return new Promise<boolean>(resolve => {
            try{
                let voliBot = new VoliBot(url, port, x => {
                    resolve(true);
                    this.onVoliBotOpen(x);
                }, (x, y) => {
                    resolve(false);
                    this.onVoliBotClose(x, y);
                })

                Object.keys(this.defaultWsCallbacks).forEach(key => {
                    //HERE
                    voliBot.addCallbackHandler(key, this.defaultWsCallbacks[key]);
                })

                this.voliBotInstances.push(voliBot);
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