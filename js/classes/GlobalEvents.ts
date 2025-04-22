import { Signal } from '@sorskoot/wonderland-components';

export class GlobalEvents {
    private static _instance: GlobalEvents;

    teleportPlayer = new Signal<[position: number[]]>();
    switchDimension = new Signal<[isLight: boolean]>();
    playerDied = new Signal<[]>();
    checkpointReached = new Signal<[position: number[]]>();
    levelCompleted = new Signal<[]>();

    static get instance(): GlobalEvents {
        if (!GlobalEvents._instance) {
            GlobalEvents._instance = new GlobalEvents();
        }
        return GlobalEvents._instance;
    }

    private constructor() {}
}
