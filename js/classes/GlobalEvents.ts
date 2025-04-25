import { Signal } from '@sorskoot/wonderland-components';

/**
 * Class managing global game events and communication between components
 */
export class GlobalEvents {
    private static _instance: GlobalEvents;

    /**
     * Event fired when the player needs to be teleported to a specific position
     */
    teleportPlayer = new Signal<[position: number[]]>();

    /**
     * Event fired when dimension switching occurs
     */
    switchDimension = new Signal<[isLight: boolean]>();

    /**
     * Event fired when the player dies
     */
    playerDied = new Signal<[]>();

    /**
     * Event fired when the player reaches a checkpoint
     */
    checkpointReached = new Signal<[position: number[]]>();

    /**
     * Event fired when the game starts
     */
    startGame = new Signal<[]>();

    /**
     * Event fired when the current level is completed
     */
    levelCompleted = new Signal<[]>();

    /**
     * Event fired when the current level needs to be reset
     */
    levelReset = new Signal<[]>();

    /**
     * Gets the singleton instance of GlobalEvents
     * @returns The GlobalEvents instance
     */
    static get instance(): GlobalEvents {
        if (!GlobalEvents._instance) {
            GlobalEvents._instance = new GlobalEvents();
        }
        return GlobalEvents._instance;
    }

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {}
}
