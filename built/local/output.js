/* global $ */ // jQuery
/* global Chart */ // Chart.js
// FUCK JS AND EVERYTHING IT STANDS FOR
// REWRITE THE ENTIRE THING TO TS
// NO MATTER HOW LONG IT'LL TAKE
// IT'LL BE WORTH IT TO USE A SANE LANGUAGE
var VoliBot = /** @class */ (function () {
    function VoliBot(hostname, port, onOpen, onClose) {
        var self = this;
        // Class variables
        self.socket = undefined;
        self.wscallbacks = [];
        self.levelsChart = this.initializeChart();
        self.clients = {};
        self.socket = new WebSocket("ws://" + hostname + ":" + port + "/volibot");
        self.socket.onopen = function () {
            self.wscallbacks["LoggingOut"] = self.onLoggingOut;
            self.wscallbacks["UpdateStatus"] = self.onUpdateStatus;
            self.wscallbacks["ListInstance"] = self.onListInstance;
            self.wscallbacks["UpdatePhase"] = self.onUpdatePhase;
            if ($.isFunction(onOpen))
                onOpen.apply(void 0, arguments);
            self.send("RequestInstanceList", "");
        };
        self.socket.onerror = function (error) {
            console.error(error);
        };
        self.socket.onclose = function () {
            self.wscallbacks = [];
            if ($.isFunction(onClose))
                onClose.apply(void 0, arguments);
        };
        self.socket.onmessage = function (event) {
            var data = JSON.parse(event.data);
            console.log(data);
            if ((data[0] == MessageType.RESPONSE_ERROR || data[0] == MessageType.RESPONSE_SUCCESS) && self.wscallbacks[data[1]] != null)
                self.wscallbacks[data[1]](data);
            if (data[0] == MessageType.EVENT && self.wscallbacks[data[1]] != null)
                self.wscallbacks[data[1]](data);
        };
        var MessageType = {
            REQUEST: 10,
            RESPONSE_SUCCESS: 20,
            RESPONSE_ERROR: 30,
            EVENT: 40,
            MESSAGE_ERROR: 50
        };
    }
    //#region Base functions; things used internally for other functions to work
    VoliBot.prototype.shutdown = function () {
        if (this.socket.readyState == this.socket.CLOSED || this.socket.readyState == this.socket.CLOSING)
            return;
        this.socket.close();
    };
    VoliBot.prototype.send = function (request, data, callback) {
        var id = this.randomId();
        this.wscallbacks[id] = function () {
            var data = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                data[_i] = arguments[_i];
            }
            delete this.wscallbacks[id];
            if ($.isFunction(callback))
                callback.apply(void 0, data);
        };
        this.socket.send(JSON.stringify([10, id, request, data]));
    };
    //#endregion
    //#region Helpers; move to new class/file?
    VoliBot.prototype.randomId = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };
    //#endregion
    //#region UI Related things, should move away and make VoliBot.js free from UI logic
    VoliBot.prototype.updateUi = function (data) {
        this.updateLevelsChart(data);
        this.updateAccountsList(data);
    };
    VoliBot.prototype.updateLevelsChart = function (data) {
        var clientData = (data[2].List || []);
        var highestLevelClient = Math.max(Math.max.apply(Math, clientData.map(function (o) {
            if (o == null || o.summoner == null)
                return -1;
            return o.summoner.summonerLevel;
        })), 0);
        var levelsLabels = Array.from(new Array(highestLevelClient), function (val, index) { return "Level: " + (index + 1); });
        var idleAccounts = new Array(highestLevelClient).fill(0);
        var activeAccounts = new Array(highestLevelClient).fill(0);
        var finishedAccounts = new Array(highestLevelClient).fill(0);
        clientData.forEach(function (client) {
            if (client == null || client.summoner == null)
                return;
            var i = Math.floor(Math.random() * 6);
            if (i == 0)
                idleAccounts[parseInt(client.summoner.summonerLevel, 10) - 1]++;
            else if (i == 5)
                finishedAccounts[parseInt(client.summoner.summonerLevel, 10) - 1]++;
            else
                activeAccounts[parseInt(client.summoner.summonerLevel, 10) - 1]++;
        });
        this.levelsChart.data.labels = levelsLabels;
        this.levelsChart.data.datasets[0].data = idleAccounts;
        this.levelsChart.data.datasets[1].data = activeAccounts;
        this.levelsChart.data.datasets[2].data = finishedAccounts;
        this.levelsChart.update({
            duration: 800,
            easing: 'easeOutBounce'
        });
    };
    VoliBot.prototype.updateAccountsList = function (data) {
        var dt = $('.datatable').DataTable();
        var allClients = data[2].List;
        var updateClients = [];
        if (allClients == null) {
            dt.clear();
            $("#account_count").text(0);
            return;
        }
        allClients.forEach(function (x) {
            if (x != null && x.summoner != null)
                updateClients.push(x);
        });
        $("#account_count").text(updateClients.length);
        dt.clear()
            .rows
            .add(updateClients.map(function (x) { return [
            { 'level': x.summoner.summonerLevel, 'percent': x.summoner.percentCompleteForNextLevel },
            x.summoner.displayName,
            x.status,
            x.summoner.summonerId,
            x.wallet.ip,
            x.wallet.rp,
            // Always send the full data as an item past what the table displays, this allows the preview to use any property.
            // For example, this is used to get profileIconId without having to display it in the table.
            x
        ]; }))
            .draw();
    };
    VoliBot.prototype.initializeChart = function () {
        return new Chart($(".ld-widget-main__chart-canvas"), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                        label: 'Idle Accounts',
                        data: [],
                        backgroundColor: 'rgba(254, 212, 42, 0.2)',
                        borderColor: 'rgba(254, 212, 42, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Active Accounts',
                        data: [],
                        backgroundColor: 'rgba(30, 89, 217, 0.2)',
                        borderColor: 'rgba(30, 89, 217, 1)',
                        borderWidth: 1
                    }, {
                        label: 'Finished Accounts',
                        data: [],
                        backgroundColor: 'rgba(92, 184, 92, 0.2)',
                        borderColor: 'rgba(92, 184, 92, 1)',
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
                                beginAtZero: true
                            }
                        }],
                    xAxes: [{
                            stacked: true,
                            ticks: {
                                beginAtZero: true,
                                autoskip: false
                            }
                        }]
                }
            }
        });
    };
    //#endregion
    //#region Websocket event handlers
    VoliBot.prototype.onLoggingOut = function (data) {
        debugger;
    };
    VoliBot.prototype.onUpdateStatus = function (data) {
        if (this.clients[data[2].id] === null) {
            console.warn("Recieved status for client we were not aware existed!");
            this.send("RequestInstanceList", "");
        }
        this.clients[data[2].id] = data[2];
        this.updateUi(data);
    };
    VoliBot.prototype.onListInstance = function (data) {
        var _this = this;
        var allClients = data[2].List;
        allClients.forEach(function (x) {
            if (x !== null)
                _this.clients[x.id] = x;
        });
        this.updateUi(data);
    };
    VoliBot.prototype.onUpdatePhase = function (data) {
        // Ignore this for now
    };
    //#endregion
    //#region Public functions
    VoliBot.prototype.requestInstanceLogout = function (id, callback) {
        this.send("RequestInstanceLogout", { "id": id }, function (result) {
            if ($.isFunction(callback))
                callback(result);
        });
    };
    VoliBot.prototype.requestInstanceStart = function (username, password, region, queue, autoplay, callback) {
        this.send("RequestInstanceStart", { "username": username, "password": password, "region": region, "queue": queue, "autoplay": autoplay }, function (result) {
            if ($.isFunction(callback))
                callback(result);
        });
    };
    VoliBot.prototype.getClientById = function (id) {
        return this.clients[id] || null;
    };
    return VoliBot;
}());
module.exports = VoliBot;
