/* global $ */     // jQuery
/* global Chart */ // Chart.js

var wscallbacks = [];
var socket;
var levelsChart = initializeChart();
var initialized = false;

function shutdown(){
	if (socket.readyState == socket.CLOSED || socket.readyState == socket.CLOSING) return;
	socket.close();
}

function send(request, data, callback){
	var id = randomId();
	wscallbacks[id] = function(...data){
		delete wscallbacks[id];
		if ($.isFunction(callback)) callback(...data);
	}
	socket.send(JSON.stringify([10, id, request, data]));
}

function randomId() {
	function s4() {
	  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function updateLevelsChart(data){
	// Will break at > 65536 entries in data
	var clientData = (data[2].List || []);
	var highestLevelClient = Math.max(Math.max.apply(Math, clientData.map(function(o){
		if (o == null || o.summoner == null) return -1;
		return o.summoner.summonerLevel;
	})), 0);

	var levelsLabels = Array.from(new Array(highestLevelClient),(val,index)=>"Level: " + (index + 1));
	var levelsValues = new Array(highestLevelClient).fill(0);
	
	clientData.forEach(function(client){
		if (client == null || client.summoner == null) return;
		levelsValues[parseInt(client.summoner.summonerLevel) - 1]++;
	});

	levelsChart.data.labels = levelsLabels;
	levelsChart.data.datasets[0].data = levelsValues;
	levelsChart.update({
		duration: 800,
		easing: 'easeOutBounce'
	})
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
			clients.push(x)
	});

	$("#account_count").text(clients.length);
	dt.clear()
		.rows
			.add(clients.map(x => [
				{'level': x.summoner.summonerLevel, 'percent': x.summoner.percentCompleteForNextLevel},
				x.summoner.displayName, 
				x.summoner.summonerId,
				x.wallet.ip,
				x.wallet.rp,
				x.summoner.summonerLevel,
				x.summoner.summonerLevel,

				// Always send the full data as an item past what the table displays, this allows the preview to use any property.
				// For example, this is used to get profileIconId without having to display it in the table.
				x
			]))
			.draw();
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

function initializeVoliBot(hostname, port, onOpen, onClose){
	if (initialized){
		console.error("VoliBot is already initialized!");
		return;
	}
	
	socket = new WebSocket("ws://" + hostname + ":" + port + "/volibot");
	initialized = true;
	
	socket.onopen = function (){
		wscallbacks["LoggingOut"] = function(){ send("RequestInstanceList", ""); };
		wscallbacks["UpdateStatus"] = function(){ send("RequestInstanceList", ""); };
		wscallbacks["ListInstance"] = function(data){
			updateLevelsChart(data);
			updateAccountsList(data);
		};

		if ($.isFunction(onOpen)) onOpen();
		send("RequestInstanceList", "");
	}

	socket.onerror = function(error){
		console.error(error);
	}

	socket.onclose = function (){
		wscallbacks = [];
		initialized = false;
		if ($.isFunction(onClose)) onClose();
	}

	socket.onmessage = function (event) {
		var data = JSON.parse(event.data);
		console.log(data);
		if ((data[0] == MessageType.RESPONSE_ERROR || data[0] == MessageType.RESPONSE_SUCCESS) && wscallbacks[data[1]] != null) wscallbacks[data[1]](data);
		if (data[0] == MessageType.EVENT && wscallbacks[data[1]] != null) wscallbacks[data[1]](data);
	}

	var MessageType = {
		REQUEST: 10,  // interface to server [10, "RandomID" ,"RequestName", {requestdata}]
		RESPONSE_SUCCESS: 20, // srv 2 intfc [20, "RandomID", {resultdata}]
		RESPONSE_ERROR: 30, // srv 2 intfc [30, "RandomID", "error message"]
		EVENT: 40, // srv 2 intfc [40, "EventName", {eventData}] ,
		MESSAGE_ERROR: 50, // srv 2 intf [50, "original message as string", "error message"]
	}
}

function requestInstanceLogout(id, callback){
	send("RequestInstanceLogout", { "id": id }, function(result) {
		if ($.isFunction(callback)) callback(result);
	});
}

module.exports = {
	requestInstanceLogout: requestInstanceLogout,
	initialize: initializeVoliBot,
	shutdown: shutdown,
}