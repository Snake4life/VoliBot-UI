import * as $ from 'jquery';
import * as anime from 'animejs';
import swal from 'sweetalert2';

import VoliBot from './VoliBot';
import HostData from './Models/HostData';

export default class Login {
	volibots: VoliBot[] = [];

	showGoodbye: boolean = true;
	pageUnloading: boolean = false;
	connected: boolean = false;

	constructor() {
		window.addEventListener("beforeunload", () => {
			this.pageUnloading = true;
			if (this.showGoodbye) {
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

		$('.login__form').submit(this.doLogin);
		$('#login__hostname').val(window.localStorage.getItem("login__hostname") || "");
		$('#login__remember').prop("checked", window.localStorage.getItem("login__hostname"));
		$('#login__automatically').prop("checked", window.localStorage.getItem("login__automatically"));
		$('#login__automatically').change(() => window.localStorage.setItem("login__automatically", $('#login__automatically').is(":checked") ? "true" : ""));

		if (window.localStorage.getItem("login__automatically")) {
			this.doLogin();
		} else {
			anime.timeline().add({
				targets: '#LoginView',
				translateY: '0%',
				duration: 750,
				delay: 500,
				easing: 'easeInOutQuart'
			}).add({
				targets: '.volibot-logo>svg>g>path',
				strokeDashoffset: [anime.setDashoffset, 0],
				easing: 'easeInOutSine',
				duration: 500,
				delay: (_, i) => i * 150,
				offset: "-=100"
			}).add({
				targets: '.volibot-logo>svg>g',
				fillOpacity: 1,
				easing: 'linear',
				duration: 750,
				offset: "+=350"
			});
		}
	}

	parseHost(host: string, fallbackPort: number) : HostData {
		var isipv6 = !!host.match(/\[.*\]|(?:.*:){2,}/);
		var needsBrackets = !host.match(/\[.*\]/) && isipv6;
		var addedPort = [, needsBrackets ? "[" + host + "]" : host, fallbackPort];
		var hostData = (host.match(isipv6 ? /(.*\])\:(\d{1,5})/ : /(.*)\:(\d{1,5})/) || addedPort);
	
		return new HostData(hostData[1] as string, hostData[2] as number);
	}

	doLogin() {
		var hostname: string | undefined = $('#login__hostname').val() as string | undefined;
		//var password = $('#login__password').val(); // Not used, add to allow opening ports to the public?
		var remember = $('#login__remember').is(":checked");
		var autologin = $('#login__automatically').is(":checked");
	
		if (hostname == undefined) return;
	
		hostname = hostname.trim();
	
		$('#login__hostname').val(hostname);
	
		if (remember)
			window.localStorage.setItem("login__hostname", hostname);
		else
			window.localStorage.setItem("login__hostname", "");
	
		window.localStorage.setItem("login__automatically", autologin ? "true" : "");
	
		try {
			// If connecting takes more than 100ms, do not show the "connecting" modal.
			// This hides it if you are immediately connected, but shows it if there's any issues or delays.
			let loadingTimeout = setTimeout(function () {
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
	
			for (let index in hostnames) {
				let hostname = hostnames[index];
				let parsedHost = this.parseHost(hostname, 8000);

				let self = this;
				let instance = new VoliBot(parsedHost.url, parsedHost.port, function (...args: any[]) {
					clearTimeout(loadingTimeout);
					self.onOpen(...args);
				}, function (...args: any[]) {
					clearTimeout(loadingTimeout);
					self.onClose(...args);
				});
	
				this.volibots.push(instance);
			}
		} catch (e) {
			console.error(e);
			this.onClose(new CloseEvent("Closed"));
		}
	}
	
	onOpen() {
		this.connected = true;
		swal.close();
	
		anime.timeline().add({
			targets: '#LoginView',
			translateY: '-110%',
			duration: 750,
			easing: 'easeInOutQuart'
		}).add({
			targets: '#MainView',
			translateY: '0%',
			duration: 750,
			easing: 'easeInOutQuart',
			offset: '-=650'
		});
	}
	
	onClose(info?: CloseEvent): void {
		//Disconnected: info.code == 1006??
		//https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
	
		console.log("Ws closed: ");
		console.log(info);
	
		if (this.pageUnloading) return;
	
		anime.timeline().add({
			targets: '#MainView',
			translateY: '210%',
			duration: 750,
			easing: 'easeInOutQuart'
		}).add({
			targets: '#LoginView',
			translateY: '0%',
			duration: 750,
			easing: 'easeInOutQuart',
			offset: '-=650'
		});
	
		if (!info || !info.wasClean) {
			if (this.connected) {
				swal("Disconnected", "You have been disconnected from VoliBot", "info");
			} else {
				swal({
					title: 'Failed to connect',
					text: 'Check the IP Address / Hostname and make sure that VoliBot is up and running',
					type: 'error',
					showConfirmButton: true
				});
			}
		} else {
			$('#login__automatically').prop('checked', false);
			window.localStorage.setItem("login__automatically", "");
		}
	}
}