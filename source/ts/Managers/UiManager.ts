import { IManager } from './IManager';
import { UiComponentBase } from '../UI/Components';
import { ScreenBase } from '../UI/Screens';
import { AnimeTimelineInstance } from 'animejs';
import * as anime from 'animejs';

export class UiManager implements IManager {
    private components = new Array<UiComponentBase>();
    private screens = new Array<ScreenBase>();
    private currentScreen = -1;
    private initialized = false;

    get CurrentScreen() {
        return this.currentScreen;
    }

    set CurrentScreen(id: number) {
        this.setCurrentScreen(id);
    }

    setCurrentScreen(id: number): AnimeTimelineInstance;
    setCurrentScreen(screen: ScreenBase): AnimeTimelineInstance;
    setCurrentScreen(inData: number | ScreenBase): AnimeTimelineInstance {
        let oldId = this.currentScreen;
        let id: number;

        if (typeof inData == "number")
            id = inData as number;
        else if (inData instanceof ScreenBase) {
            id = this.screens.indexOf(inData as ScreenBase);
            if (id == -1)
                throw new Error(`Screen ${inData} is not registered, call registerScreen first!`);
        }
        else
            throw new Error(`${typeof inData} is not a valid ScreenBase!`);
        

        if (id < 0 || id > this.screens.length || this.screens[id] == undefined)
            throw new Error(`Screen with id ${id} does not exist!`);

        this.currentScreen = id;

        let timeline = anime.timeline();

        if (oldId != -1) {
            timeline.add({
                targets: this.screens[oldId].rootElement,
                translateY: '-110%',
                duration: 750,
                easing: 'easeInOutQuart'
            });
        }

        if (id != -1) {
            timeline.add({
                targets: this.screens[id].rootElement,
                translateY: '0%',
                duration: 750,
                easing: 'easeInOutQuart',
                offset: '-=650'
            });
        }

        return timeline;
    }

    private registerComponent(component: UiComponentBase): number {
        if (this.initialized)
            throw new Error("Can not register UiComponentBase after initialization!");

        return this.components.push(component);
    }

    registerScreen(screen: ScreenBase): number {
        if (this.initialized)
            throw new Error("Can not register ScreenBase after initialization!");

        anime({
            targets: screen.rootElement,
            translateY: '-110%',
            duration: 0
        });

        return this.screens.push(screen);
    }

    unregisterScreen(id: number) {
        delete this.screens[id];
    }

    initialize() {
        console.log("Screens: ");
        this.screens.forEach(uiElement => {
            console.log(uiElement);
            uiElement.registerComponents(x => this.registerComponent(x))
            uiElement.hookUi();
        });
        
        console.log("Components: ");
        this.components.forEach(uiElement => {
            console.log(uiElement);
            uiElement.hookUi();
        });

        this.initialized = true;

        // window.addEventListener("beforeunload", () => {
        // 	this.pageUnloading = true;
        // 	if (this.showGoodbye) {
        // 		anime({
        // 			targets: ['#MainView', '#LoginView'],
        // 			opacity: 0,
        // 			duration: 125,
        // 			easing: 'easeInOutSine'
        // 		});

        // 		swal({
        // 			title: 'Goodbye!',
        // 			type: 'info',
        // 			backdrop: false,
        // 			showConfirmButton: false,
        // 			allowOutsideClick: false,
        // 			allowEscapeKey: false,
        // 			allowEnterKey: false,
        // 			onOpen: swal.hideLoading
        // 		});
        // 	}
        // });
    }
}

export var UI = new UiManager();