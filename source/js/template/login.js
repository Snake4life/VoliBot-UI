/* global $ */

var volibot = window.volibot = require('../modules/volibot');
var anime = require('animejs');
var swal = require('sweetalert2');

var pageUnloading = false;
window.addEventListener("beforeunload", function (event) {
	pageUnloading = true;

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
});

$(document).ready(function() {
	$('#login__hostname').val(window.localStorage.getItem("login__hostname"));
	$('#login__remember').prop("checked", window.localStorage.getItem("login__remember"));

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
		duration: 750,
		delay: function(el, i) { return i * 150 },
		offset: "-=100"
	},{
		targets: '.volibot-logo>svg>g',
		fillOpacity: 1,
		easing: 'linear',
		duration: 1000,
		offset: "+=350"
	}]);

	$('.login__form').submit(function(ev){
		var hostname = $('#login__hostname').val().trim();
		var password = $('#login__password').val(); // Not used, add to allow opening ports to the public?
		var remember = $('#login__remember').is(":checked");

		$('#login__hostname').val(hostname);

		if (remember){
			window.localStorage.setItem("login__hostname", hostname);
			window.localStorage.setItem("login__remember", remember);
		}else{
			window.localStorage.removeItem("login__hostname");
			window.localStorage.removeItem("login__remember");
		}

		try{
			swal({
				title: 'Connecting to VoliBot',
				type: 'info',
				onOpen: swal.showLoading,
				allowOutsideClick: false,
				allowEscapeKey: false,
				allowEnterKey: false,
				showConfirmButton: false
			});
			volibot.initialize(hostname, 8000, onOpen, onClose);
		}catch(e){
			onClose();
		}
	});

	$('#hostname').val(window.location.hostname);

	var connected = false;

	function onOpen(){
		connected = true;
		swal({
			title: 'Connnected',
			text: 'Successfully connected to VoliBot!',
			type: 'success',
			showConfirmButton: false,
			timer: 1000
		});

		anime.timeline().add([{
			targets: '#LoginView',
			translateY: '-110%',
			duration: 1000,
			easing: 'easeInOutQuart'
		},{
			targets: '#MainView',
			translateY: '0%',
			duration: 1000,
			easing: 'easeInOutQuart',
			offset: '-=750'
		}]);
	}

	function onClose(){
		if (pageUnloading) return;
		if (connected){
			anime.timeline().add([{
				targets: '#MainView',
				translateY: '-110%',
				duration: 1000,
				easing: 'easeInOutQuart'
			},{
				targets: '#LoginView',
				translateY: '0%',
				duration: 1000,
				easing: 'easeInOutQuart',
				offset: '-=750'
			}]);
			swal("Disconnected", "You have been disconnected from VoliBot", "info");
		}else{
			swal({
				title: 'Failed to connect',
				text: 'Check the IP Address / Hostname and make sure that VoliBot is up and running',
				type: 'error',

				// In extreme cases (opening a Websocket throws an exception) this modal shows before onOpen on the "Connecting" modal is called.
				// If that happens, we get an infinite loading animation. By calling hide here we can prevent that.
				onOpen: swal.hideLoading
			});
		}

		connected = false;
	}
});