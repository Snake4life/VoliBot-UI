import * as $ from 'jquery';
import swal from 'sweetalert2';

import { Settings, UI, VoliBotManager } from '../../Managers';
import { ScreenBase } from '../Screens';
import { Notifications } from '../../Managers/NotificationManager';
import { Log } from '../../Managers/LogManager';
import { UiComponentBase } from '../Components';
import { UiAddAccount } from '../Components/AddAccounts';

export class ScreenMain extends ScreenBase {
	registerComponents(register: (component: UiComponentBase) => void) { 
		register(new UiAddAccount())
	}

	rootElement: HTMLElement;

	constructor() {
		super();

		let view = document.getElementById("MainView");
		if (view != null)
			this.rootElement = view;
		else
			throw new Error("Could not get element: #MainView");
	}

	hookUi() {
		quickmenu($('.quickmenu__item.active'));

		$('body').on('click', '.quickmenu__item', function() {
			quickmenu($(this));
		});
	
		function quickmenu(item: JQuery<HTMLElement>) {
			var menu = $('.sidebar__menu');
			menu.removeClass('active').eq(item.index()).addClass('active');
			$('.quickmenu__item').removeClass('active');
			item.addClass('active');
			menu.eq(0).css('margin-left', '-'+item.index()*200+'px');
		}
	
		$('.sidebar li').on('click', function(e) {
			e.stopPropagation();
			var second_nav = $(this).find('.collapse').first();
			if (second_nav.length) {
				//second_nav.collapse('toggle');
				$(this).toggleClass('opened');
			}
		});
	
		//$('body.main-scrollable .main__scroll').scrollbar();
		//$('.scrollable').scrollbar({'disableBodyScroll' : true});
		$(window).on('resize', function() {
			//$('body.main-scrollable .main__scroll').scrollbar();
			//$('.scrollable').scrollbar({'disableBodyScroll' : true});
		});
	
		//$('.selectize-dropdown-content').addClass('scrollable scrollbar-macosx').scrollbar({'disableBodyScroll' : true});
		//$('.nav-pills, .nav-tabs').tabdrop();
	
		$('body').on('click', '.header-navbar-mobile__menu button', function() {
			$('.dashboard').toggleClass('dashboard_menu');
		});
	
		//$("input.bs-switch").bootstrapSwitch();
	
		//$('.settings-slider').ionRangeSlider({decorate_both: false});
	
		if ($('input[type=number]').length) {
			//$('input[type=number]').inputNumber({
			//	mobile: false
			//});
		}
	}
}