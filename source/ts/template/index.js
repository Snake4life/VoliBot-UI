/* global $ */
/* global volibot */

$(document).ready(function() {
	$('.selectpicker').selectpicker();
	$('.navbar__logout').click(function(){
		volibot.shutdown();
	});
});