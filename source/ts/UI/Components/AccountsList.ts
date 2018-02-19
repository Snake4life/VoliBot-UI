import * as $ from 'jquery';
import 'datatables.net';

import { VoliBotManager } from '../../Managers';
import { UiComponentBase } from './';
import { VoliClient } from 'VoliClient';

export class ComponentAccountsList extends UiComponentBase {
    private accountCount: JQuery<HTMLElement>;
    private accountsTable: any;

    hookUi(): void {
        VoliBotManager.addCallbackHandler("ListInstance", x => this.updateAccountsList(x[2].List));
        //this.accountsTable = $('.datatable').DataTable();
        this.accountCount = $("#account_count");
        debugger;
    }

    updateAccountsList(clients: VoliClient[]){
        debugger;
        //HERE
        let updateClients: VoliClient[] = [];
    
        if (clients == null){
            this.accountsTable.clear();
            this.accountCount.text(0);
            return;
        }
    
        clients.forEach(x => {
            if (x != null && x.summoner != null)
                updateClients.push(x);
        });
    
        this.accountCount.text(updateClients.length);
        this.accountsTable.clear()
            .rows
                .add(updateClients.map(x => [
                    {'level': x.summoner.summonerLevel, 'percent': x.summoner.percentCompleteForNextLevel},
    
                    x.summoner.displayName,
                    x.status,
                    x.summoner.summonerId,
                    x.wallet.ip,
                    x.wallet.rp,
    
                    // Always send the full data as an item past what the table displays, this allows the preview to use any property.
                    // For example, this is used to get profileIconId without having to display it in the table.
                    x
                ]))
                .draw();
    }
}