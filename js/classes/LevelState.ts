import { NotifyPropertyChanged } from '@sorskoot/wonderland-components';
import { GlobalEvents } from './GlobalEvents.js';

export class LevelState extends NotifyPropertyChanged {
    /**
     * True if in light dimension, false if in dark.
     */
    private _isLight: boolean;

    /**
     * Current checkpoint position [x, y, z].
     */
    private _checkpoint: number[] | null;

    private static _instance: LevelState;
    private _isLoaded: boolean;
    get isLoaded(): boolean {
        return LevelState._instance._isLoaded;
    }

    static get instance(): LevelState {
        if (!LevelState._instance) {
            LevelState._instance = new LevelState();
        }
        return LevelState._instance;
    }

    private constructor() {
        super();
        this._isLight = true;
        this._checkpoint = null;
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

    completeLevel(): void {
        GlobalEvents.instance.levelCompleted.dispatch();
        this.reset();
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
    reset(): void {
        this._isLight = true;
        this._checkpoint = null;
        this.notifyPropertyChanged('isLight');
        this.notifyPropertyChanged('collectedCrystals');
        this.notifyPropertyChanged('checkpoint');
    }

    initForCurrentLevel() {}

    setMapLoaded() {
        this.initForCurrentLevel();
        this._isLoaded = true;
    }
}
