/* global $ */
/* global iziToast */

var anime = require('animejs');
let newest_build_date = "";

$(document).ready(function() {
    // For debugging
    window.debugFakeUpdate = displayUpdate;

    $.ajax({
        url : "/build-date.txt",
        success : function(result){
            newest_build_date = result;
        }
    });

    // Check for an update every 15 minutes
    //setInterval(checkForUpdate, 15 * 60 * 1000);

    // Check for an update every second.
    // IF YOU READ THIS, I PROBABLY FORGOT TO REMOVE IT IN PROD.
    // FEEL FREE TO TELL ME. :)
    setInterval(checkForUpdate, 1000);

    function checkForUpdate(){
        $.ajax({
            url : "/build-date.txt",
            success : function(result){
                if (newest_build_date != result){
                    // Update last build date to the value we just recieved
                    newest_build_date = result;
                    displayUpdate();
                }
            }
        });
    }

    function displayUpdate(){
        if ($('#update-notification').length !== 0){
            iziToast.hide(document.querySelector('#update-notification'), {
                transitionOut: 'fadeOutRight',
                onClosed: function () {
                    showToast();
                }
            });
        }else{
            showToast();
        }

        function showToast(){
            let visual_date = / (.*) GMT/.exec(newest_build_date)[1];

            iziToast.show({
                id: 'update-notification',
                layout: 2,
                message: "<strong>There's a UI update available! (" + visual_date + ")</strong><br>Click here to reload and update.",
                theme: 'dark',
	        	timeout: false,
	        	icon: 'fa fa-arrow-circle-up'
            });

            $('#update-notification > .iziToast-body').on('click', function() {
                window.show_goodbye = false;

                iziToast.hide(document.querySelector('#update-notification'), {transitionOut: 'fadeOutRight'});

                anime({
	        		targets: '#MainView',
	        		translateY: '210%',
	        		duration: 750,
	        		easing: 'easeInOutQuart',
	        		complete: function(anim) {
	        		    // Sending true invalidates browser cache and forces a full load from the server
                        window.location.reload(true);
                    }
	        	});

	        	anime({
	        		targets: '#LoginView',
	        		translateY: '-110%',
	        		duration: 750,
	        		easing: 'easeInOutQuart'
	        	});
            });
        }
    }
});