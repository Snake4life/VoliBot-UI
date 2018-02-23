import * as $ from "jquery";

import { ComponentBase } from "../Components";
import { ComponentAccountsInfo } from "../Components/AccountsInfo";
import { ComponentAccountsList } from "../Components/AccountsList";
import { ComponentAddAccount } from "../Components/AddAccounts";
import { ScreenBase } from "../Screens";

export class ScreenMain extends ScreenBase {
    rootElement: HTMLElement;

    constructor() {
        super();

        const view = document.getElementById("MainView");
        if (view != null) {
            this.rootElement = view;
        } else {
            throw new Error("Could not get element: #MainView");
        }
    }

    registerComponents(register: (component: ComponentBase) => void) {
        register(new ComponentAddAccount());
        register(new ComponentAccountsList());
        register(new ComponentAccountsInfo());
    }

    hookUi() {
        quickmenu($(".quickmenu__item.active"));

        $("body").on("click", ".quickmenu__item", function() {
            quickmenu($(this));
        });

        function quickmenu(item: JQuery<HTMLElement>) {
            const menu = $(".sidebar__menu");
            menu.removeClass("active").eq(item.index()).addClass("active");
            $(".quickmenu__item").removeClass("active");
            item.addClass("active");
            menu.eq(0).css("margin-left", "-" + item.index() * 200 + "px");
        }

        $(".sidebar li").on("click", function(e) {
            e.stopPropagation();
            const secondNav = $(this).find(".collapse").first();
            if (secondNav.length) {
                //.secondNav.collapse('toggle');
                $(this).toggleClass("opened");
            }
        });

        //$('body.main-scrollable .main__scroll').scrollbar();
        //$('.scrollable').scrollbar({'disableBodyScroll' : true});
        $(window).on("resize", () => {
            //$('body.main-scrollable .main__scroll').scrollbar();
            //$('.scrollable').scrollbar({'disableBodyScroll' : true});
        });

        // tslint:disable-next-line:max-line-length
        //$('.selectize-dropdown-content').addClass('scrollable scrollbar-macosx').scrollbar({'disableBodyScroll' : true});
        //$('.nav-pills, .nav-tabs').tabdrop();

        $("body").on("click", ".header-navbar-mobile__menu button", () => {
            $(".dashboard").toggleClass("dashboard_menu");
        });

        //$("input.bs-switch").bootstrapSwitch();

        //$('.settings-slider').ionRangeSlider({decorate_both: false});

        if ($("input[type=number]").length) {
            //.$('input[type=number]').inputNumber({
            //.    mobile: false
            //.});
        }
    }
}
