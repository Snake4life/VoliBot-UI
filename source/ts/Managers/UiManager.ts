import { Log } from "./";
import { Manager } from "./Manager";

import { ComponentBase } from "../UI/Components";
import { ScreenBase } from "../UI/Screens";

import { AnimeTimelineInstance } from "animejs";
import * as anime from "animejs";
import swal from "sweetalert2";

export class UiManager extends Manager {
    displayGoodbye = true;

    private components = new Array<ComponentBase>();
    private screens: { [id: string]: ScreenBase } = {};
    private _currentScreen: string = "";
    private initialized = false;

    get currentScreen(): string {
        return this._currentScreen;
    }

    set currentScreen(inData: string) {
        this.setCurrentScreen(inData);
    }

    setCurrentScreen(inData: string | ScreenBase): AnimeTimelineInstance {
        Log.debug(`Attempting to change active screen to: ${JSON.stringify(inData)}`);

        const oldId = this.currentScreen;
        let id: string;

        if (typeof inData === "string") {
            id = inData as string;
        } else if (inData instanceof ScreenBase) {
            const potentialId = Object.keys(this.screens).find((x) => this.screens[x] === inData as ScreenBase);
            if (potentialId === undefined) {
                throw new Error(`Screen ${inData} is not registered, call registerScreen first!`);
            }
            id = potentialId;
        } else {
            throw new Error(`${typeof inData} is not a valid ScreenBase!`);
        }

        if (this.screens[id] === undefined) {
            throw new Error(`Screen with id '${id}' does not exist!`);
        }

        Log.debug(`Active screen change initialized: '${this.currentScreen}' => '${id}'.`);
        this._currentScreen = id;

        const timeline = anime.timeline();

        if (oldId !== "") {
            timeline.add({
                duration: 750,
                easing: "easeInOutQuart",
                targets: this.screens[oldId].rootElement,
                translateY: "-110%",
            });
        }

        if (id !== "") {
            timeline.add({
                complete: () => {
                    Log.info(`Active screen changed to: '${id}'.`);
                },
                duration: 750 * (oldId === "" ? 1 : 2),
                easing: "easeInOutQuart",
                offset: "-=650",
                targets: this.screens[id].rootElement,
                translateY: "0%",
            });
        }

        return timeline;
    }

    //TODO: Prevent multiple screens with same ID
    registerScreen(id: string, screen: ScreenBase) {
        Log.debug("Registered screen: " + id);
        if (this.initialized) {
            throw new Error("Can not register ScreenBase after initialization!");
        }

        anime({
            duration: 0,
            targets: screen.rootElement,
            translateY: "-110%",
        });

        this.screens[id] = screen;
    }

    unregisterScreen(id: string) {
        Log.debug("Unegistered screen: " + id);
        delete this.screens[id];
    }

    initialize() {
        Log.debug("Hooking Screens: ");
        Object.keys(this.screens).forEach((id) => {
            const uiElement = this.screens[id];
            Log.debug(uiElement);
            uiElement.registerComponents((x) => this.registerComponent(x));
            uiElement.hookUi();
        });

        Log.debug("Hooking Components: ");
        this.components.forEach((uiElement) => {
            Log.debug(uiElement);
            uiElement.hookUi();
        });

        this.initialized = true;

        window.addEventListener("beforeunload", () => {
            if (this.displayGoodbye) {
                anime({
                    duration: 125,
                    easing: "easeInOutSine",
                    opacity: 0,
                    targets: ["#MainView", "#LoginView"],
                });

                swal({
                    allowEnterKey: false,
                    allowEscapeKey: false,
                    allowOutsideClick: false,
                    backdrop: false,
                    onOpen: swal.hideLoading,
                    showConfirmButton: false,
                    title: "Goodbye!",
                    type: "info",
                });
            }
        });
    }

    //TODO: string id's?
    private registerComponent(component: ComponentBase): number {
        Log.debug("Registered UiComponentBase: " + JSON.stringify(component));
        if (this.initialized) {
            throw new Error("Can not register UiComponentBase after initialization!");
        }

        return this.components.push(component);
    }
}

export const UI = new UiManager();
