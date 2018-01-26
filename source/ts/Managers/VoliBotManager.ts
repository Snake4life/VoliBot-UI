import VoliBot from '../VoliBot';

export default class VoliBotManager{
    voliBotInstances: VoliBot[];

    addVoliBotInstance(url: string, port: number){
        new VoliBot(url, port, this.onVoliBotOpen, this.onVoliBotClose);
    }

    private onVoliBotOpen(args: any){
        args;
        debugger;
        this.voliBotInstances.push()
    }

    private onVoliBotClose(args: any){
        args;
    }
}