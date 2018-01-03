$(document).ready(function() {
	var swal = window.swal = require('sweetalert2');
	var lolVersion;

	$.getJSON('https://ddragon.leagueoflegends.com/api/versions.json', data => {
		lolVersion = data[0];
	});

	$('#AddAccount').submit(function(ev) {
		swal({
			title: 'Error!',
			text: 'Do you want to continue',
			type: 'error',
			confirmButtonText: 'Cool'
		});
		return false;
	});

	$('.input-daterange').datepicker();

	$('.slider').ionRangeSlider({
		type: "double",
		grid: false,
		min: 0,
		max: 0,
		from: 0,
		to: 0,
		prefix: "$: ",
		decorate_both: false,
		onChange: function (data) {
			tables.draw();
		}
	});

	var slider = $(".slider").data("ionRangeSlider");

	// Table tab count update
	function tabInfo(table) {
		var id = $(table).closest('.tab-pane').attr('id'),
			tab = $('.nav-tabs a[aria-controls='+id+']'),
			length = $(table).DataTable().page.info().recordsDisplay,
			label = tab.find('span.label');
		if (label.length) { label.remove(); }
		tab.append('<span class="label">'+length+'</span>');
	}

	// Preview update
	function previewUpdate(data) {
		if (data == null) return;
		var client = data[data.length - 1];
		var summoner = client.summoner;
		var wallet = client.wallet;

		var product = $('.products-preview');
		product.find('.products-preview__name').text(summoner.displayName).attr('title', summoner.displayName);
		product.find('.products-preview__blue_essence').text(wallet.ip).attr('title', wallet.ip);
		product.find('.products-preview__riot_points').text(wallet.rp).attr('title', wallet.rp);

		// Remove any previous handlers before assigning one, or we'll get one more every time a client is selected.
		product.find('.products-preview__logout').off('click');
		product.find('.products-preview__logout').click(function() {
			swal({
				title: 'Logging out...',
				text: summoner.displayName,
				onOpen: () => {
					swal.showLoading()
				},
				allowOutsideClick: false,
				allowEscapeKey: false,
				allowEnterKey: false,
				showConfirmButton: false
			});

			volibot.requestInstanceLogout(client.id, function(data){
				var status = data[2];
				
				swal({
					type: status == 'success' ? 'success' : 'error',
					title: 'Logged out!',
					timer: 1000
				})

				console.log("response");
				console.log(data);
			});
		});
		// product.find('.products-preview__date').text(data[3]).attr('title', data[3]);
		// product.find('.products-preview__type').text(data[7]).attr('title', data[7]);
		// product.find('.products-preview__status').text(data[5]).attr('title', data[5]);

		product.find('.products-preview__icon div')
			   .css('background-image',
			   		'url(http://ddragon.leagueoflegends.com/cdn/' + lolVersion + '/img/profileicon/' + summoner.profileIconId + '.png)');
		
		var chartData = JSON.parse('['+$(data[6]).text()+']');
		product.find('.products-preview__stat').sparkline(
			chartData,
			{
				type: 'bar',
				height: '34px',
				barSpacing: 2,
				barColor: '#1e59d9',
				negBarColor: '#ed4949'
			}
		);
	}

	var tables = $('.datatable')
		.on('preInit.dt', function (e, settings) {
			//var api = new $.fn.dataTable.Api(settings),
			//	accounts = $(api.table().node()).data('accounts');
			//console.log(api);
			//api.ajax.url('data/accounts/'+accounts+'.json');
		}).on('init.dt', function () {
			tabInfo(this);
			var previewData = $.fn.dataTable.tables( {visible: true, api: true}).rows(0).data()[0];
			previewUpdate(previewData);
		}).on('draw.dt', function () {
			tabInfo(this);
			$(this).find('.products__stat').each(function() {
				productChart(this);
			});
		}).on('search.dt', function () {
			tabInfo(this);
		}).DataTable({
			ordering: true,
			lengthChange: false,
			pagingType: 'numbers',
			select: {
				style: 'single'
			},
			columnDefs: [
				{
					"targets": [ 0 ],
					"render": function ( data, type, row ) {
						if ( type === 'display' || type === 'filter' )
							return data.level + " (" + data.percent + "%)";
						return data.level + (Math.min(data.percent, 99) * 0.01);
					}
				}
			],
			initComplete: function () {

				//// Date filter filling
				//this.api().column(3)
				//	.cache( 'search' )
				//	.sort()
				//	.each( function ( date ) {
				//		var min = new Date($('.datalist-filter__from').val());
				//		var max = new Date($('.datalist-filter__to').val());
				//		var val = new Date(date);

				//		if ((val != 'Invalid Date') && ((val < min) || (min == 'Invalid Date'))) {
				//			$('.datalist-filter__from').datepicker('setDate', new Date(date));
				//		}
				//		if ((val != 'Invalid Date') && ((val > max) || (max == 'Invalid Date'))) {
				//			$('.datalist-filter__to').datepicker('setDate', new Date(date));
				//		}

				//	} );

				//// Salary filter filling
				//this.api().column(4)
				//	.cache( 'search' )
				//	.sort()
				//	.each( function ( salary ) {
				//		var options = slider.options,
				//			salary = parseFloat(salary.replace(/[^0-9\.]+/g, ''));

				//		if (salary < options.min) {
				//			slider.update({
				//				min: salary,
				//				from: salary
				//			});
				//		}

				//		if (salary > options.max) {
				//			slider.update({
				//				max: salary,
				//				to: salary
				//			});
				//		}
				//	} );
			}
		}).on('select', function ( e, dt, type, indexes ) {
			var data = $(this).DataTable().rows( indexes ).data()[0];
			previewUpdate(data);
		});

	$('a[data-toggle="tab"]').on( 'shown.bs.tab', function (e) {
		$.fn.dataTable.tables( {visible: true, api: true} ).columns.adjust();

		$($.fn.dataTable.tables({visible: true})).find('.products__stat').each(function() {
			productChart(this);
		});
	} );

	$('.datalist-filter__search input').on('keyup', function () {
		tables.search( this.value ).draw();
	} );

	/*
	$('.input-daterange').on('changeDate', function(e) {
		tables.draw();
	});

	$('#datalist-filter__actives').on('change', function() {
		tables.draw();
	});
	
	$.fn.dataTable.ext.search.push(
		function( settings, data, dataIndex ) {
			var from = new Date($('.datalist-filter__from').val());
			var to = new Date($('.datalist-filter__to').val());
			//var date = new Date(data[3]) || 0;

			if ( ( from == 'Invalid Date' && to == 'Invalid Date' ) ||
				( date == 'Invalid Date' ) ||
				( from == 'Invalid Date' && date <= to ) ||
				( from <= date && to == 'Invalid Date' ) ||
				( from <= date && date <= to ) )
			{
				return true;
			}
			return false;
		}
	);

	$.fn.dataTable.ext.search.push(
		function( settings, data, dataIndex ) {
			var slider = $('#datalist-filter__salary').val().split(';');
			var min = slider[0];
			var max = slider[1];
			var salary = parseFloat(data[4].replace(/[^0-9\.]+/g, ''));

			if ( ( min == undefined && max == undefined ) ||
				( isNaN(salary) ) ||
				( min == undefined && salary <= max ) ||
				( min <= salary && max == undefined ) ||
				( min <= salary && salary <= max ) )
			{
				return true;
			}
			return false;
		}
	);

	$.fn.dataTable.ext.search.push(
		function( settings, data, dataIndex ) {
			var actives = $('#datalist-filter__actives').prop('checked') || false;
			var status = data[5].toLowerCase();

			if ( ( !actives ) || ( actives && status == 'active' ) )
			{
				return true;
			}
			return false;
		}
	);
	*/
});
