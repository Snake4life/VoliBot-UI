var volibot = window.volibot = require('../modules/volibot');
var anime = require('animejs');

$(document).ready(function() {
	anime({
		targets: '#LoginView',
		translateY: '0%',
		duration: 750,
		delay: 500,
		easing: 'easeInOutQuart'
	});

	$('.login__form').submit(function(ev){
		var hostname = $('#login__hostname').val();
		var password = $('#login__password').val();
		var remember = $('#login__remember').val();
		
		volibot.initialize(hostname, 8000, onOpen);
	});

	$('#hostname').val(window.location.hostname);
	
	function onOpen(){
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
});