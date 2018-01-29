import * as $ from 'jquery';
import * as anime from 'animejs';
import swal from 'sweetalert2';

import HostData from '../../Models/HostData';

import { Settings, UI, VoliBotManager } from '../../Managers';
import { ScreenBase } from '../Screens';
import { Notifications } from '../../Managers/NotificationManager';

export class UiLogin extends ScreenBase {
	registerComponents() { }

	rootElement: HTMLElement;

	constructor() {
		super();

		let loginView = document.getElementById("LoginView");

		if (loginView != null)
			this.rootElement = loginView;
		else
			throw new Error("Could not get element: #LoginView");

		Settings.registerSetting("login__hostname", "localhost");
		Settings.registerSetting("login__automatically", false);
	}

	hookUi() {
		$('.login__form').submit(() => this.doLogin());
		$('#login__hostname').val(Settings.getString("login__hostname"));

		$('#login__remember').prop("checked", Settings.getString("login__hostname"));
		$('#login__remember').change(() => {
			if (!$('#login__remember').is(":checked"))
				Settings.reset("login__hostname");
		});

		$('#login__automatically').prop("checked", Settings.getBoolean("login__automatically"));
		$('#login__automatically').change(() => Settings.set("login__automatically", $('#login__automatically').is(":checked")));

		if (Settings.getBoolean("login__automatically")) {
			this.doLogin();
		} else {
			UI.setCurrentScreen(this).add({
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

	showGoodbye: boolean = true;
	pageUnloading: boolean = false;
	connected: boolean = false;

	parseHost(host: string, fallbackPort: number): HostData {
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
			Settings.set("login__hostname", hostname);
		else
			Settings.reset("login__hostname");

		Settings.set("login__automatically", autologin);


		let loadingTimeout: number | undefined;
		let notificationId: number | undefined;

		try {
			// If connecting takes more than 100ms, do not show the "connecting" modal.
			// This hides it if you are immediately connected, but shows it if there's any issues or delays.
			loadingTimeout = setTimeout(function () {
				notificationId = Notifications.fullscreenNotification({
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
				let hostData = this.parseHost(hostname, 8000);
				
				VoliBotManager.addVoliBotInstance(hostData.url, hostData.port, () => {
					if (loadingTimeout != undefined)
						clearTimeout(loadingTimeout);
					if (notificationId != undefined)
						Notifications.closeFullscreenNotification(notificationId);

					loadingTimeout = undefined;
					notificationId = undefined;
				});
			}
		} catch (e) {
			if (loadingTimeout != undefined)
				clearTimeout(loadingTimeout);
			if (notificationId != undefined)
				Notifications.closeFullscreenNotification(notificationId);
			console.error(e);
			this.onClose(new CloseEvent("Closed"));
		}
	}

	onClose(info?: CloseEvent): void {
		//Disconnected: info.code == 1006??
		//https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes

		console.log("Ws closed: ");
		console.log(info);

		if (this.pageUnloading) return;

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
}