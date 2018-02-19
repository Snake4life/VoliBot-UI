import { Log } from './Managers';
/* global $ */     // jQuery
/* global Chart */ // Chart.js

// FUCK JS AND EVERYTHING IT STANDS FOR
// REWRITE THE ENTIRE THING TO TS
// NO MATTER HOW LONG IT'LL TAKE
// IT'LL BE WORTH IT TO USE A SANE LANGUAGE

import { VoliClient } from "./VoliClient";
import { LeagueAccount } from './Models/LeagueAccount';

export class VoliBot {
	socket: WebSocket;

	clients: { [id: string] : VoliClient } = { };
	private wsCallbacks: { [id: string] : (data: any) => void } = { };

	addCallbackHandler(id: string, handler: (data: any) => void) {
		if (this.wsCallbacks[id]){
			this.wsCallbacks[id] = (x) => {
				this.wsCallbacks[id](x);
				handler(x);
			}
		}else{
			this.wsCallbacks[id] = handler;
		}
	}

	get ClientCount(): number {
		return Object.keys(this.clients).length
	}

	constructor(hostname: string, port: number, onOpen?: (bot: VoliBot, args?: any[]) => void, onClose?: (bot: VoliBot, args?: any[]) => void){
		this.socket = new WebSocket("ws://" + hostname + ":" + port + "/volibot");

		this.socket.onopen = (...args: any[]) => {
			this.wsCallbacks["LoggingOut"] = this.onLoggingOut;
			this.wsCallbacks["UpdateStatus"] = this.onUpdateStatus;
			this.wsCallbacks["ListInstance"] = this.onListInstance;
			this.wsCallbacks["UpdatePhase"] = this.onUpdatePhase;

			if (onOpen != undefined)
				onOpen(this, ...args);
				
			this.send("RequestInstanceList", "", () => {});
		};

		this.socket.onerror = (error: Event) => {
			Log.warn("WebSocket onError: " + JSON.stringify(error));
		}

		this.socket.onclose = (...args: any[]) => {
			if (onClose != undefined)
				onClose(this, ...args);
		}

		this.socket.onmessage = (event: MessageEvent) => {
			var data = JSON.parse(event.data);
			Log.debug("Received data: " + JSON.stringify(data));
			if ((data[0] == MessageType.RESPONSE_ERROR || data[0] == MessageType.RESPONSE_SUCCESS) && this.wsCallbacks[data[1]] != null)
				this.wsCallbacks[data[1]].call(this, data);

			if (data[0] == MessageType.EVENT && this.wsCallbacks[data[1]] != null)
				this.wsCallbacks[data[1]].call(this, data);
		}
	}

	addAccount(account: LeagueAccount, onSuccess?: (account: LeagueAccount) => void, onFail?: (account: LeagueAccount) => void){
		this.requestInstanceStart(account.username, account.password, account.region.toString(), account.settings.queue, account.settings.autoplay, function(result){
			if (result[2] == "success")
				if (onSuccess)
					onSuccess(account);
			else
				if (onFail)
					onFail(account);
		});
	}

	//#region Base functions; things used internally for other functions to work
	shutdown(){
		if (this.socket.readyState == this.socket.CLOSED || this.socket.readyState == this.socket.CLOSING) return;
		this.socket.close();
	}

	send(request: string, data: any, callback?: (data: any[]) => void){
		var id = this.randomId();
		this.wsCallbacks[id] = function(data: any){
			delete this.val;
			if (callback != undefined)
				callback(data);
		};

		this.socket.send(JSON.stringify([10, id, request, data]));
	}
	//#endregion

	//#region Helpers; move to new class/file?
	randomId() {
		function s4() {
		  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		}
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	}
	//#endregion

	//#region Websocket event handlers
	private onLoggingOut(data: any){
		data;
	}

	private onUpdateStatus(data: any){
		if (this.clients[data[2].id] === null)
		{
			Log.warn("Recieved status for client we were not aware existed!");

			Log.debug("Refreshing client list");
			this.send("RequestInstanceList", "");
		}else{
			this.clients[data[2].id] = data[2];
		}

		//TODO: Update UI
	}

	private onListInstance(data: any){
		Log.debug(data);
		let allClients = data[2].List as VoliClient[];
		if (allClients == null) return;

		allClients.forEach((x) => {
			if (x != null)
				this.clients[x.id] = x;
		}, this);
		//TODO: Refresh UI
	}

	private onUpdatePhase(data: any){
		Log.debug(this);
		this.send("RequestInstanceList", "", () => {});

		// Ignore this for now
		data;
	}
	//#endregion

	//#region Public functions
	requestInstanceLogout(id: number, callback?: (data: any) => void){
		this.send("RequestInstanceLogout", { "id": id }, function(result) {
			if (callback != undefined)
				callback(result);
		});
	}

	requestInstanceStart(username: string, password: string, region: string, queue: number, autoplay: boolean, callback?: (data: any) => void){
			this.send("RequestInstanceStart", {"username": username,"password": password,"region": region,"queue": queue,"autoplay": autoplay}, function(result) {
			if (callback != undefined)
				callback(result);
		});
	}

	getClientById(id: number){
		return this.clients[id] || null;
	}
	//#endregion
}

export enum MessageType {
	REQUEST = 10,          // intfc 2 srv [10, "RandomID" ,"RequestName", {requestdata}]
	RESPONSE_SUCCESS = 20, // srv 2 intfc [20, "RandomID", {resultdata}]
	RESPONSE_ERROR = 30,   // srv 2 intfc [30, "RandomID", "error message"]
	EVENT = 40,            // srv 2 intfc [40, "EventName", {eventData}] ,
	MESSAGE_ERROR = 50,    // srv 2 intfc [50, "original message as string", "error message"]
};