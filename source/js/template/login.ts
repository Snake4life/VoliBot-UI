/* global $ */

import anime from 'animejs';
import swal from 'sweetalert2';
import VoliBot from '../modules/volibot';

var pageUnloading = false;

window.volibots = [];
window.show_goodbye = true;

window.addEventListener("beforeunload", function (event) {
	pageUnloading = true;

	if (window.show_goodbye){
		anime({
			targets: ['#MainView', '#LoginView'],
			opacity: 0,
			duration: 125,
			easing: 'easeInOutSine'
		});

		swal({
			title: 'Goodbye!',
			type: 'info',
			backdrop: false,
			showConfirmButton: false,
			allowOutsideClick: false,
			allowEscapeKey: false,
			allowEnterKey: false,
			onOpen: swal.hideLoading
		});
	}
});

$(document).ready(function() {
	$('.login__form').submit(doLogin);
	$('#login__hostname').val(window.localStorage.getItem("login__hostname"));
	$('#login__remember').prop("checked", window.localStorage.getItem("login__hostname"));
	$('#login__automatically').prop("checked", window.localStorage.getItem("login__automatically"));
	$('#login__automatically').change(function(){ window.localStorage.setItem("login__automatically",  $('#login__automatically').is(":checked") ? true : "");});

	if (window.localStorage.getItem("login__automatically")){
		doLogin();
	}else{
		anime.timeline().add([{
			targets: '#LoginView',
			translateY: '0%',
			duration: 750,
			delay: 500,
			easing: 'easeInOutQuart'
		},{
			targets: '.volibot-logo>svg>g>path',
			strokeDashoffset: [anime.setDashoffset, 0],
			easing: 'easeInOutSine',
			duration: 500,
			delay: function(el, i) { return i * 150 },
			offset: "-=100"
		},{
			targets: '.volibot-logo>svg>g',
			fillOpacity: 1,
			easing: 'linear',
			duration: 750,
			offset: "+=350"
		}]);
	}

	function parseHost(host, fallbackPort){
		var isipv6 = !!host.match(/\[.*\]|(?:.*:){2,}/);
		var needsBrackets = !host.match(/\[.*\]/) && isipv6;
		var addedPort = [,needsBrackets ? "[" + host + "]" : host,fallbackPort];
		var hostData = (host.match(isipv6 ? /(.*\])\:(\d{1,5})/ : /(.*)\:(\d{1,5})/) || addedPort);

		return [hostData[1], hostData[2]];
	}

	function doLogin(){
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

		try{
			// If connecting takes more than 100ms, do not show the "connecting" modal.
			// This hides it if you are immediately connected, but shows it if there's any issues or delays.
			let loadingTimeout = setTimeout(function() {
				swal({
					title: 'Connecting to VoliBot',
					type: 'info',
					onOpen: swal.showLoading,
					allowOutsideClick: false,
					allowEscapeKey: false,
					allowEnterKey: false,
					showConfirmButton: false
				});
			}, 100);

			let hostnames = hostname.split(",");

			for(let index in hostnames){
				let hostname = hostnames[index];
				let parsedHost = parseHost(hostname, 8000);

				let instance = new VoliBot(parsedHost[0], parsedHost[1], function(){
					clearTimeout(loadingTimeout);
					onOpen(...arguments);
				}, function(){
					clearTimeout(loadingTimeout);
					onClose(...arguments);
				});

				window.volibots.push(instance);
			}
		}catch(e){
			console.error(e);
			onClose({wasClean: false});
		}
	}

	var connected = false;
	function onOpen(){
		connected = true;
		swal.close();

		anime.timeline().add([{
			targets: '#LoginView',
			translateY: '-110%',
			duration: 750,
			easing: 'easeInOutQuart'
		},{
			targets: '#MainView',
			translateY: '0%',
			duration: 750,
			easing: 'easeInOutQuart',
			offset: '-=650'
		}]);
	}
	function onClose(info){
		//Disconnected: info.code == 1006??
		//https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes

		console.log("Ws closed: ");
		console.log(info);

		if (pageUnloading) return;

		anime.timeline().add([{
			targets: '#MainView',
			translateY: '210%',
			duration: 750,
			easing: 'easeInOutQuart'
		},{
			targets: '#LoginView',
			translateY: '0%',
			duration: 750,
			easing: 'easeInOutQuart',
			offset: '-=650'
		}]);

		if (!info.wasClean)
		{
			if (connected){
				swal("Disconnected", "You have been disconnected from VoliBot", "info");
			}else{
				swal({
					title: 'Failed to connect',
					text: 'Check the IP Address / Hostname and make sure that VoliBot is up and running',
					type: 'error',
					showConfirmButton: true
				});
			}
		}else{
			$('#login__automatically').prop('checked', false);
			window.localStorage.setItem("login__automatically", "");
		}
	}
});