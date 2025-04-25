import { NotifyPropertyChanged } from '@sorskoot/wonderland-components';
import { GlobalEvents } from './GlobalEvents.js';

/**
 * Class managing the state of the current level
 */
export class LevelState extends NotifyPropertyChanged {
    /**
     * True if in light dimension, false if in dark.
     */
    private _isLight: boolean;

    /**
     * Current checkpoint position [x, y, z].
     */
    private _checkpoint: number[] | null;

    /**
     * Singleton instance of the LevelState
     */
    private static _instance: LevelState;

    /**
     * Flag indicating whether the level has been loaded
     */
    private _isLoaded: boolean = false;

    /**
     * Gets whether the level has been loaded
     */
    get isLoaded(): boolean {
        return this._isLoaded;
    }

    /**
     * Gets the singleton instance of LevelState
     * @returns The LevelState instance
     */
    static get instance(): LevelState {
        if (!LevelState._instance) {
            LevelState._instance = new LevelState();
        }
        return LevelState._instance;
    }

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        super();
        this._isLight = true;
        this._checkpoint = null;
        GlobalEvents.instance.levelReset.add(this._reset, this);
    }

    /**
     * Returns true if in light dimension.
     */
    get isLight(): boolean {
        return this._isLight;
    }

    /**
     * Returns the current checkpoint position, or null if none set.
     */
    get checkpoint(): number[] | null {
        return this._checkpoint;
    }

    /**
     * Switch between light and dark dimension.
     */
    switchDimension(): void {
        this._isLight = !this._isLight;
        this.notifyPropertyChanged('isLight');
        GlobalEvents.instance.switchDimension.dispatch(this._isLight);
    }

    /**
     * Marks the current level as completed and resets the level state
     */
    completeLevel(): void {
        GlobalEvents.instance.levelCompleted.dispatch();
        this._reset();
    }

    /**
     * Set the current checkpoint position.
     */
    setCheckpoint(pos: number[]): void {
        this._checkpoint = [...pos];
        this.notifyPropertyChanged('checkpoint');
        GlobalEvents.instance.checkpointReached.dispatch(this._checkpoint);
    }

    /**
     * Reset level state (for new level or restart).
     */
    private _reset(): void {
        this._isLight = true;
        this._checkpoint = null;
        this.notifyPropertyChanged('isLight');
        this.notifyPropertyChanged('collectedCrystals');
        this.notifyPropertyChanged('checkpoint');
    }

    /**
     * Initializes level-specific state for the current level
     */
    initForCurrentLevel() {}

    /**
     * Marks the current map as loaded and initializes it
     */
    setMapLoaded() {
        this.initForCurrentLevel();
        this._isLoaded = true;
    }
}
