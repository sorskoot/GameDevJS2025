import { Signal } from '@sorskoot/wonderland-components';

export class GlobalEvents {
    private static _instance: GlobalEvents;

    TeleportPlayer = new Signal<[position: number[]]>();
    SwitchDimension = new Signal<[isLight: boolean]>();
    PlayerDied = new Signal<[]>();

    static get instance(): GlobalEvents {
        if (!GlobalEvents._instance) {
            GlobalEvents._instance = new GlobalEvents();
        }
        return GlobalEvents._instance;
    }

    private constructor() {}
}
