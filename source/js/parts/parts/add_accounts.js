/* global $ */
/* global volibot */

$(document).ready(function() {
	$("#AddAccount_Submit").click(doAddAccount);

	function doAddAccount(){
	    var username = $("#AddAccount_Username").val();
	    var password = $("#AddAccount_Password").val();
	    var server = $("#AddAccount_Server").val();
	    var queue = parseInt($("#AddAccount_Queue").val(), 10);
	    var autoplay = $("#AddAccount_AutoPlay").is(":checked");

        volibot.requestInstanceStart(username, password, server, queue, autoplay, function(result){
            if (result[2] == "success")
            	debugger;

            debugger;
        });
	}
});