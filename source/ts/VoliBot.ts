/* global $ */     // jQuery
/* global Chart */ // Chart.js

// FUCK JS AND EVERYTHING IT STANDS FOR
// REWRITE THE ENTIRE THING TO TS
// NO MATTER HOW LONG IT'LL TAKE
// IT'LL BE WORTH IT TO USE A SANE LANGUAGE

import VoliClient from "./VoliClient";
import LeagueAccount from './Models/LeagueAccount';

export default class VoliBot {
	socket: WebSocket;
	clients: { [id: string] : VoliClient } = { };
	wsCallbacks: { [id: string] : (data: any) => void };

	get ClientCount(): number {
		return Object.keys(this.clients).length
	}

	constructor(hostname: string, port: number, onOpen?: (args?: any) => void, onClose?: (args?: any) => void){
		this.clients = {};
		this.socket = new WebSocket("ws://" + hostname + ":" + port + "/volibot");

		let self: VoliBot = this;

		this.socket.onopen = (...args: any[]) => {
			self.wsCallbacks["LoggingOut"] = self.onLoggingOut;
			self.wsCallbacks["UpdateStatus"] = self.onUpdateStatus;
			self.wsCallbacks["ListInstance"] = self.onListInstance;
			self.wsCallbacks["UpdatePhase"] = self.onUpdatePhase;

			if (onOpen != undefined)
				onOpen(...args);
				
			this.send("RequestInstanceList", "", () => {});
		};

		this.socket.onerror = function(error){
			console.error(error);
		};

		this.socket.onclose = function (...args: any[]){
			if (onClose != undefined)
				onClose(...args);
		};

		this.socket.onmessage = function (event) {
			var data = JSON.parse(event.data);
			console.log(data);
			if ((data[0] == MessageType.RESPONSE_ERROR || data[0] == MessageType.RESPONSE_SUCCESS) && 
				self.wsCallbacks[data[1]] != null)
				self.wsCallbacks[data[1]](data);

			if (data[0] == MessageType.EVENT && self.wsCallbacks[data[1]] != null)
				self.wsCallbacks[data[1]](data);
		};
	}

	addAccount(account: LeagueAccount){
		this.requestInstanceStart(account.username, account.password, account.region.toString(), account.settings.queue, account.settings.autoplay, function(result){
			if (result[2] == "success")
				debugger;
   
			debugger;
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
	onLoggingOut(data: any){
		data;
		debugger;
	}

	onUpdateStatus(data: any){
		if (this.clients[data[2].id] === null)
		{
			console.warn("Recieved status for client we were not aware existed!");
			this.send("RequestInstanceList", "");
		}

		this.clients[data[2].id] = data[2];

		// TODO: Update UI
	}
	onListInstance(data: any){
		var allClients = data[2].List as VoliClient[];

		allClients.forEach(x => {
			if (x !== null)
				this.clients[x.id] = x;
		});

		//TODO: Refresh UI
	}

	onUpdatePhase(data: any){
		data;
		// Ignore this for now
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