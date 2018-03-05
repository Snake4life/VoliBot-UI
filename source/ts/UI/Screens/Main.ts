// tslint:disable-next-line:no-reference
/// <reference path="../../@types/jquery.scrollable.d.ts" />

import * as $ from "jquery";
import "jquery.scrollbar";

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
        register(new ComponentAccountsList()); // Needs to be first as it initializes the accountTable
        register(new ComponentAddAccount());
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

        $("body.main-scrollable .main__scroll").scrollbar();
        $(".scrollable").scrollbar({disableBodyScroll : true});
        $(".selectize-dropdown-content").addClass("scrollable scrollbar-macosx").scrollbar({disableBodyScroll : true});

        $("body").on("click", ".header-navbar-mobile__menu button", () => {
            $(".dashboard").toggleClass("dashboard_menu");
        });
    }
}
