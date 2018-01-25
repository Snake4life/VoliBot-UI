"use strict";
/* global $ */
exports.__esModule = true;
var animejs_1 = require("animejs");
var sweetalert2_1 = require("sweetalert2");
var volibot_1 = require("../modules/volibot");
var pageUnloading = false;
window.volibots = [];
window.show_goodbye = true;
window.addEventListener("beforeunload", function (event) {
    pageUnloading = true;
    if (window.show_goodbye) {
        animejs_1["default"]({
            targets: ['#MainView', '#LoginView'],
            opacity: 0,
            duration: 125,
            easing: 'easeInOutSine'
        });
        sweetalert2_1["default"]({
            title: 'Goodbye!',
            type: 'info',
            backdrop: false,
            showConfirmButton: false,
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            onOpen: sweetalert2_1["default"].hideLoading
        });
    }
});
$(document).ready(function () {
    $('.login__form').submit(doLogin);
    $('#login__hostname').val(window.localStorage.getItem("login__hostname"));
    $('#login__remember').prop("checked", window.localStorage.getItem("login__hostname"));
    $('#login__automatically').prop("checked", window.localStorage.getItem("login__automatically"));
    $('#login__automatically').change(function () { window.localStorage.setItem("login__automatically", $('#login__automatically').is(":checked") ? true : ""); });
    if (window.localStorage.getItem("login__automatically")) {
        doLogin();
    }
    else {
        animejs_1["default"].timeline().add([{
                targets: '#LoginView',
                translateY: '0%',
                duration: 750,
                delay: 500,
                easing: 'easeInOutQuart'
            }, {
                targets: '.volibot-logo>svg>g>path',
                strokeDashoffset: [animejs_1["default"].setDashoffset, 0],
                easing: 'easeInOutSine',
                duration: 500,
                delay: function (el, i) { return i * 150; },
                offset: "-=100"
            }, {
                targets: '.volibot-logo>svg>g',
                fillOpacity: 1,
                easing: 'linear',
                duration: 750,
                offset: "+=350"
            }]);
    }
    function parseHost(host, fallbackPort) {
        var isipv6 = !!host.match(/\[.*\]|(?:.*:){2,}/);
        var needsBrackets = !host.match(/\[.*\]/) && isipv6;
        var addedPort = [, needsBrackets ? "[" + host + "]" : host, fallbackPort];
        var hostData = (host.match(isipv6 ? /(.*\])\:(\d{1,5})/ : /(.*)\:(\d{1,5})/) || addedPort);
        return [hostData[1], hostData[2]];
    }
    function doLogin() {
        var hostname = $('#login__hostname').val().trim();
        //var password = $('#login__password').val(); // Not used, add to allow opening ports to the public?
        var remember = $('#login__remember').is(":checked");
        var autologin = $('#login__automatically').is(":checked");
        $('#login__hostname').val(hostname);
        if (remember)
            window.localStorage.setItem("login__hostname", hostname);
        else
            window.localStorage.setItem("login__hostname", "");
        window.localStorage.setItem("login__automatically", autologin ? true : "");
        try {
            // If connecting takes more than 100ms, do not show the "connecting" modal.
            // This hides it if you are immediately connected, but shows it if there's any issues or delays.
            var loadingTimeout_1 = setTimeout(function () {
                sweetalert2_1["default"]({
                    title: 'Connecting to VoliBot',
                    type: 'info',
                    onOpen: sweetalert2_1["default"].showLoading,
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                    showConfirmButton: false
                });
            }, 100);
            var hostnames = hostname.split(",");
            for (var index in hostnames) {
                var hostname_1 = hostnames[index];
                var parsedHost = parseHost(hostname_1, 8000);
                var instance = new volibot_1["default"](parsedHost[0], parsedHost[1], function () {
                    clearTimeout(loadingTimeout_1);
                    onOpen.apply(void 0, arguments);
                }, function () {
                    clearTimeout(loadingTimeout_1);
                    onClose.apply(void 0, arguments);
                });
                window.volibots.push(instance);
            }
        }
        catch (e) {
            console.error(e);
            onClose({ wasClean: false });
        }
    }
    var connected = false;
    function onOpen() {
        connected = true;
        sweetalert2_1["default"].close();
        animejs_1["default"].timeline().add([{
                targets: '#LoginView',
                translateY: '-110%',
                duration: 750,
                easing: 'easeInOutQuart'
            }, {
                targets: '#MainView',
                translateY: '0%',
                duration: 750,
                easing: 'easeInOutQuart',
                offset: '-=650'
            }]);
    }
    function onClose(info) {
        //Disconnected: info.code == 1006??
        //https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
        console.log("Ws closed: ");
        console.log(info);
        if (pageUnloading)
            return;
        animejs_1["default"].timeline().add([{
                targets: '#MainView',
                translateY: '210%',
                duration: 750,
                easing: 'easeInOutQuart'
            }, {
                targets: '#LoginView',
                translateY: '0%',
                duration: 750,
                easing: 'easeInOutQuart',
                offset: '-=650'
            }]);
        if (!info.wasClean) {
            if (connected) {
                sweetalert2_1["default"]("Disconnected", "You have been disconnected from VoliBot", "info");
            }
            else {
                sweetalert2_1["default"]({
                    title: 'Failed to connect',
                    text: 'Check the IP Address / Hostname and make sure that VoliBot is up and running',
                    type: 'error',
                    showConfirmButton: true
                });
            }
        }
        else {
            $('#login__automatically').prop('checked', false);
            window.localStorage.setItem("login__automatically", "");
        }
    }
});
