// For some reason the official DataTables typings are far from complete.
// We solve this by manually adding the missing properties we need. 
///<reference path="../../@types/datatables-select.d.ts" />
import * as $ from 'jquery';

import { VoliBotManager } from '../../Managers';
import { UiComponentBase } from './';
import { VoliClient } from 'VoliClient';

//#region Things you should probably avoid touching if you don't have a better solution.
// I have no clue WHY this works, but it works, so I'm going to leave it here.
// If someone feels like fixing it, PLEASE do, but be prepared to spend some time with it.
//TODO: This REALLY shouldn't be done this way.
//WARNING: This REALLY REALLY shouldn't be done this way.
declare var require: any;
import 'datatables.net';
import 'datatables.net-select';
import { VoliBot } from 'VoliBot';
require('datatables.net')(window, $);
require('datatables.net-select')(window, $);
//#endregion

export class ComponentAccountsList extends UiComponentBase {
    private initializeDataTable() {
        let self = this;
        this.accountsTable = $('.datatable')
        .on('dblclick', 'tr', function (this: HTMLTableRowElement) {
            debugger;
            let row = self.accountsTable.row(this);
            let data = row.data();
        	alert( 'You clicked on '+data[0]+'\'s row' );
    	})
        .DataTable({
            language: {
                info: "Registered accounts: _TOTAL_",
                select: {
                    rows: {
                        _: "",
                    }
                }
            },
			ordering: true,
			lengthChange: true,
			paging: false,
			//paging: true,
			//pagingType: 'simple_numbers',
			select: {
				style: 'os'
            },
            columns: [
                { data: (x: VoliClient) => x.serverId || "Unknown" },
                { data: (x: VoliClient) => new VoliClientLevel(x) },
                { data: (x: VoliClient) => x.summoner.displayName },
                { data: (x: VoliClient) => x.status },
                { data: (x: VoliClient) => x.summoner.summonerId },
                { data: (x: VoliClient) => x.wallet.ip },
                { data: (x: VoliClient) => x.wallet.rp },
            ],
			columnDefs: [
				{
                    targets: 1,
					render: function (data: VoliClientLevel, type) {
						if ( type === 'display' || type === 'filter' )
                            return `${data.level} (+${data.percent}%)`;

                        // Makes sure the percentage is never "100%". Mostly because it looks bad :)
						return data.level + (Math.min(data.percent, 99)/100);
					}
				}
			]
		});

	    $('a[data-toggle="tab"]').on( 'shown.bs.tab', function () {
	    	self.accountsTable.columns.adjust();
	    });

	    $('.datalist-filter__search input').on('keyup', function (this: HTMLInputElement) {
	    	self.accountsTable.search(this.value).draw();
        });
    }

    private accountsTable: any;

    hookUi(): void {
        VoliBotManager.addCallbackHandler("ListInstance", (x, y) => this.updateAccountsList(x[2].List, y));
        this.initializeDataTable();
    }

    updateAccountsList(clientsObject: {[id: string]: VoliClient}, serverId: string){
        var clients = clientsObject == null ? [] : Object.keys(clientsObject).map((key) => clientsObject[key]);

        let updateClients: VoliClient[] = [];
    
        if (clients == null){
            this.accountsTable.clear();
            return;
        }
    
        clients.forEach(x => {
            if (x == null || x.summoner == null) return;

            x.serverId = serverId;
            updateClients.push(x);
        }, this);
    
        this.accountsTable.rows((_index: number, data: VoliBot) => {
            return (data.serverId == serverId)
        }).remove().rows.add(updateClients).draw();
    }
}

class VoliClientLevel {
    private client: VoliClient;

    get level()   { return this.client.summoner.summonerLevel; }
    get percent() { return this.client.summoner.percentCompleteForNextLevel; }

    constructor(x: VoliClient){
        this.client = x;
    }
}