import * as $ from 'jquery';
import * as anime from 'animejs';
import swal from 'sweetalert2';

import HostData from '../../Models/HostData';

import { Settings, UI, VoliBotManager } from '../../Managers';
import { ScreenBase } from './';
import { Notifications } from '../../Managers/NotificationManager';
import { Log } from '../../Managers/LogManager';

export class ScreenLogin extends ScreenBase {
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

	async doLogin() {
		var hostname: string | undefined = $('#login__hostname').val() as string | undefined;
		//var password = $('#login__password').val(); // Not used, add to allow opening ports to the public?
		var remember = $('#login__remember').is(":checked");
		var autologin = $('#login__automatically').is(":checked");

		if (hostname == undefined) return;

		hostname = hostname.trim();

		$('#login__hostname').val(hostname);

		remember ? Settings.set("login__hostname", hostname) : Settings.reset("login__hostname");

		Settings.set("login__automatically", autologin);

		let loadingTimeout: number | undefined;
		let notificationId: number | undefined;

		// If connecting takes more than 100ms, do not show the "connecting" modal.
		// This hides it if you are immediately connected, but shows it if there's any issues or delays.
		loadingTimeout = setTimeout(function () {
			Log.debug("Connecting is not instant, showing 'Connecting' window.")
			notificationId = (Notifications.fullscreenNotification({
				title: 'Connecting to VoliBot',
				type: 'info',
				onOpen: swal.showLoading,
				allowOutsideClick: false,
				allowEscapeKey: false,
				allowEnterKey: false,
				showConfirmButton: false
			})).id;
		}, 100);

		let hostnames = hostname.split(",");
		let success = new Array<boolean>();

		for (let index in hostnames) {
			let hostname = hostnames[index];
			let hostData = this.parseHost(hostname, 8000);
			success.push(await VoliBotManager.addVoliBotInstance(hostData.url, hostData.port));
		}

		if (loadingTimeout != undefined)
			clearTimeout(loadingTimeout);
		if (notificationId != undefined)
			Notifications.closeFullscreenNotification(notificationId);
			
		Log.info(`Connected to ${success.filter(x => x).length} out of ${success.length} instance(s).`)
		if (VoliBotManager.connectedInstanceCount == 0) {
			Notifications.fullscreenNotification({
				title: 'Failed to connect',
				text: 'Check the IP Address / Hostname and make sure that VoliBot is up and running',
				type: 'error',
				showConfirmButton: true
			});
		} else {
			UI.currentScreen = "Main";

			for (let i = 0; i < success.length; i++)
				if (!success[i])
					Notifications.addNotification("Failed to connect to instance:", hostnames[i], 'fa fa-exclamation-circle');
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
			window.localStorage.setItem("login__automatically", ""); //TODO: Settings!!
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