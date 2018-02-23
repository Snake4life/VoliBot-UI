import * as $ from "jquery";

import { ComponentBase } from "./";

export class ComponentAccountsInfo extends ComponentBase {
    private accountInfo: JQuery<HTMLElement> | undefined = undefined;
    private nonSelected: JQuery<HTMLElement> | undefined = undefined;

    hookUi(): void {
        this.accountInfo = $("#accounts-preview__selected");
        this.nonSelected = $("#accounts-preview__no_selected");

        this.nonSelected.show();
        this.accountInfo.hide();

        $(".datatable")
        .on("select.dt", (x, y, z, a) => this.updateAccountsInfo(x, y, z, a))
        .on("deselect.dt", (x, y, z, a) => this.updateAccountsInfo(x, y, z, a));
    }

    private updateAccountsInfo(_e: any, dt: any, type: any, _indexes: any) {
        if (this.nonSelected == null || this.accountInfo == null) { return; }

        if (type === "row") {
            const data = dt.rows({ selected: true }).data();
            if (data.length === 0) {
                this.nonSelected.show();
                this.accountInfo.hide();
            } else {
                this.nonSelected.hide();
                this.accountInfo.show();

                $(".accounts-preview__selected_accounts")
                    .text(`${data.length} account${data.length === 1 ? "" : "s"} selected`);
            }
        }
    }
}
