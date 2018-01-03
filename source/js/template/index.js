$(document).ready(function() {
	$('.selectpicker').selectpicker();
	$('#navbar__logout').click(function(){
		location.reload();
	});
});

/*
server.addHandler("RequestInstanceList",   [&server, &manager](json data) {});
server.addHandler("RequestInstanceStart",  [&server, &manager](json data) {});
server.addHandler("RequestInstanceLogout", [&server, &manager](json data) {});
server.addHandler("RequestChangeSettings", [&server, &manager](json data) {});
*/