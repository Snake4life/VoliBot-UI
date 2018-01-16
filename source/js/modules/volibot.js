/* global $ */     // jQuery
/* global Chart */ // Chart.js

//#region Local variables
let wscallbacks = [];
let socket;
let levelsChart = initializeChart();
let initialized = false;
let clients = {};
//#endregion

//#region Base functions; things used internally for other functions to work
function shutdown(){
	if (socket.readyState == socket.CLOSED || socket.readyState == socket.CLOSING) return;
	socket.close();
}
function send(request, data, callback){
	var id = randomId();
	wscallbacks[id] = function(...data){
		delete wscallbacks[id];
		if ($.isFunction(callback))
			callback(...data);
	};

	socket.send(JSON.stringify([10, id, request, data]));
}
//#endregion

//#region Helpers; move to new class/file?
function randomId() {
	function s4() {
	  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}
//#endregion

//#region UI Related things, should move away and make VoliBot.js free from UI logic
function updateUi(data){
	updateLevelsChart(data);
	updateAccountsList(data);

function updateLevelsChart(data){
	var clientData = (data[2].List || []);
	var highestLevelClient = Math.max(Math.max.apply(Math, clientData.map(function(o){
		if (o == null || o.summoner == null) return -1;
		return o.summoner.summonerLevel;
	})), 0);

	var levelsLabels = Array.from(new Array(highestLevelClient),(val,index)=>"Level: " + (index + 1));
	var levelsValues = new Array(highestLevelClient).fill(0);

	clientData.forEach(function(client){
		if (client == null || client.summoner == null) return;
		levelsValues[parseInt(client.summoner.summonerLevel, 10) - 1]++;
	});

	levelsChart.data.labels = levelsLabels;
	levelsChart.data.datasets[0].data = levelsValues;
	levelsChart.update({
		duration: 800,
		easing: 'easeOutBounce'
	});
}
function updateAccountsList(data){
	var dt = $('.datatable').DataTable();
	var allClients = data[2].List;
	var clients = [];

	if (allClients == null){
		dt.clear();
		$("#account_count").text(0);
		return;
	}

	allClients.forEach(x => {
		if (x != null && x.summoner != null)
			clients.push(x);
	});

	$("#account_count").text(clients.length);
	dt.clear()
		.rows
			.add(clients.map(x => [
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

function initializeChart(){
	return new Chart($(".ld-widget-main__chart-canvas"), {
		type: 'bar',
		data: {
			labels: [],
			datasets: [{
				label: 'Accounts',
				data: [],
				backgroundColor: 'rgba(54, 162, 235, 0.2)',
				borderColor: 'rgba(54, 162, 235, 1)',
				borderWidth: 1
			}]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			animation: false,
			scales: {
				yAxes: [{
					scaleLabel: {
						display: true
					},
					ticks: {
						beginAtZero:true
					}
				}],
				xAxes: [{
					ticks: {
						beginAtZero:true,
						autoskip: false
					}
				}]
			}
		}
	});
}
//#endregion

//#region Websocket event handlers
function onLoggingOut(data){
	debugger;
}
function onUpdateStatus(data){
	if (clients[data[2].id] === null)
	{
		console.warn("Recieved status for client we were not aware existed!");
		send("RequestInstanceList", "");
	}

	clients[data[2].id] = data[2];

	updateUi(data);
}
function onListInstance(data){
	var allClients = data[2].List;

	allClients.forEach(x => {
		if (x !== null)
			clients[x.id] = x;
	});

	updateUi(data);
}
function onUpdatePhase(data){
	// Ignore this for now
}
//#endregion

//#region Public functions
function initializeVoliBot(hostname, port, onOpen, onClose){
	if (initialized){
		console.error("VoliBot is already initialized!");
		return;
	}

	socket = new WebSocket("ws://" + hostname + ":" + port + "/volibot");
	initialized = true;

	socket.onopen = function (){
		wscallbacks["LoggingOut"] = onLoggingOut;
		wscallbacks["UpdateStatus"] = onUpdateStatus;
		wscallbacks["ListInstance"] = onListInstance;
		wscallbacks["UpdatePhase"] = onUpdatePhase;

		if ($.isFunction(onOpen)) onOpen(...arguments);
		send("RequestInstanceList", "");
	};

	socket.onerror = function(error){
		console.error(error);
	};

	socket.onclose = function (){
		wscallbacks = [];
		initialized = false;
		if ($.isFunction(onClose)) onClose(...arguments);
	};

	socket.onmessage = function (event) {
		var data = JSON.parse(event.data);
		console.log(data);
		if ((data[0] == MessageType.RESPONSE_ERROR || data[0] == MessageType.RESPONSE_SUCCESS) && wscallbacks[data[1]] != null) wscallbacks[data[1]](data);
		if (data[0] == MessageType.EVENT && wscallbacks[data[1]] != null) wscallbacks[data[1]](data);
	};

	var MessageType = {
		REQUEST: 10,          // intfc 2 srv [10, "RandomID" ,"RequestName", {requestdata}]
		RESPONSE_SUCCESS: 20, // srv 2 intfc [20, "RandomID", {resultdata}]
		RESPONSE_ERROR: 30,   // srv 2 intfc [30, "RandomID", "error message"]
		EVENT: 40,            // srv 2 intfc [40, "EventName", {eventData}] ,
		MESSAGE_ERROR: 50,    // srv 2 intfc [50, "original message as string", "error message"]
	};
}

function requestInstanceLogout(id, callback){
	send("RequestInstanceLogout", { "id": id }, function(result) {
		if ($.isFunction(callback)) callback(result);
	});
}
function requestInstanceStart(username, password, region, queue, autoplay, callback){
		send("RequestInstanceStart", {"username": username,"password": password,"region": region,"queue": queue,"autoplay": autoplay}, function(result) {
		if ($.isFunction(callback)) callback(result);
	});
}

function getClientById(id){
	return clients[id] || null;
}
//#endregion

module.exports = {
	requestInstanceLogout: requestInstanceLogout,
	requestInstanceStart: requestInstanceStart,
	getClientById: getClientById,
	initialize: initializeVoliBot,
	shutdown: shutdown,
}