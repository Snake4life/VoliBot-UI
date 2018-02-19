import { IManager } from './IManager';
import { Log } from './';

import { UiComponentBase } from '../UI/Components';
import { ScreenBase } from '../UI/Screens';

import { AnimeTimelineInstance } from 'animejs';
import * as anime from 'animejs';

import swal from 'sweetalert2';

export class UiManager implements IManager {
    private components = new Array<UiComponentBase>();
    private screens: { [id: string]: ScreenBase } = {};
    private _currentScreen = "";
    private initialized = false;

    displayGoodbye = true;

    get currentScreen() {
        return this._currentScreen;
    }

    set currentScreen(id: string) {
        this.setCurrentScreen(id);
    }

    setCurrentScreen(id: string): AnimeTimelineInstance;
    setCurrentScreen(screen: ScreenBase): AnimeTimelineInstance;
    setCurrentScreen(inData: string | ScreenBase): AnimeTimelineInstance {
        Log.debug(`Attempting to change active screen to: ${JSON.stringify(inData)}`);

        let oldId = this.currentScreen;
        let id: string;

        if (typeof inData == "string")
            id = inData as string;
        else if (inData instanceof ScreenBase) {
            let potentialId = Object.keys(this.screens).find(x => this.screens[x] == inData as ScreenBase);
            if (potentialId == undefined)
                throw new Error(`Screen ${inData} is not registered, call registerScreen first!`);
            id = potentialId;
        }
        else
            throw new Error(`${typeof inData} is not a valid ScreenBase!`);

        if (this.screens[id] == undefined)
            throw new Error(`Screen with id '${id}' does not exist!`);

        Log.debug(`Active screen change initialized: '${this.currentScreen}' => '${id}'.`);
        this._currentScreen = id;

        let timeline = anime.timeline();

        if (oldId != "") {
            timeline.add({
                targets: this.screens[oldId].rootElement,
                translateY: '-110%',
                duration: 750,
                easing: 'easeInOutQuart'
            });
        }

        if (id != "") {
            timeline.add({
                targets: this.screens[id].rootElement,
                translateY: '0%',
                duration: 750,
                easing: 'easeInOutQuart',
                offset: '-=650',
                complete: () => {
                    Log.info(`Active screen changed to: '${id}'.`);
                }
            });
        }

        return timeline;
    }

    //TODO: string id's?
    private registerComponent(component: UiComponentBase): number {
        Log.debug("Registered UiComponentBase: " + JSON.stringify(component));
        if (this.initialized)
            throw new Error("Can not register UiComponentBase after initialization!");

        return this.components.push(component);
    }

    registerScreen(id: string, screen: ScreenBase) {
        Log.debug("Registered screen: " + id);
        if (this.initialized)
            throw new Error("Can not register ScreenBase after initialization!");

        anime({
            targets: screen.rootElement,
            translateY: '-110%',
            duration: 0
        });

        this.screens[id] = screen;
    }

    unregisterScreen(id: string) {
        Log.debug("Unegistered screen: " + id);
        delete this.screens[id];
    }

    initialize() {
        Log.debug("Hooking Screens: ");
        Object.keys(this.screens).forEach(id => {
            let uiElement = this.screens[id];
            Log.debug(uiElement);
            uiElement.registerComponents(x => this.registerComponent(x))
            uiElement.hookUi();
        });

        Log.debug("Hooking Components: ");
        this.components.forEach(uiElement => {
            Log.debug(uiElement);
            uiElement.hookUi();
        });

        this.initialized = true;

        window.addEventListener("beforeunload", () => {
        	if (this.displayGoodbye) {
        		anime({
        			targets: ['#MainView', '#LoginView'],
        			opacity: 0,
        			duration: 125,
        			easing: 'easeInOutSine'
        		});

        		swal({
        			title: 'Goodbye!',
        			type: 'info',
        			backdrop: false,
        			showConfirmButton: false,
        			allowOutsideClick: false,
        			allowEscapeKey: false,
        			allowEnterKey: false,
        			onOpen: swal.hideLoading
        		});
        	}
        });
    }
}

export var UI = new UiManager();