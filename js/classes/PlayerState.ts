import { AudioManager, Sounds } from './AudioManager.js';
import { GameState } from './GameState.js';
import { GlobalEvents } from './GlobalEvents.js';

/**
 * Class managing the player's state, including energy levels and dimension status
 */
export class PlayerState {
    private static _instance: PlayerState;

    /**
     * Flag indicating whether the current level has been completed
     */
    private _completed: boolean = false;

    /**
     * Gets the singleton instance of PlayerState
     * @returns The PlayerState instance
     */
    static get instance(): PlayerState {
        if (!PlayerState._instance) {
            PlayerState._instance = new PlayerState();
        }
        return PlayerState._instance;
    }

    /**
     * Current light dimension energy
     */
    private _lightEnergy: number = 100;

    /**
     * Current dark dimension energy
     */
    private _darkEnergy: number = 100;

    /**
     * Maximum energy capacity for both dimensions
     */
    private _maxEnergy: number = 100;

    /**
     * Rate at which energy drains/replenishes per second
     */
    private _drainRate: number = 15;

    /**
     * Flag indicating whether player is in light dimension
     */
    private _inLight: boolean = false;

    /**
     * Callbacks to notify when energy values change
     */
    private _energyListeners: Array<() => void> = [];

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        this._reset();
        GlobalEvents.instance.switchDimension.add(
            this._onSwitchDimension,
            this
        );
        GlobalEvents.instance.levelCompleted.add(this._levelCompleted, this);
        GlobalEvents.instance.levelReset.add(this._reset, this);
    }

    /**
     * Handles dimension switching events
     * @param isLight Whether the new dimension is light (true) or dark (false)
     */
    private _onSwitchDimension = (isLight: boolean) => {
        this._inLight = isLight;
        // Reset alarm flags when switching dimensions
        this._playedAlarmLight = false;
        this._playedAlarmDark = false;
    };

    /**
     * Resets the player state to initial values
     * @private
     */
    private _reset() {
        this._completed = false;
        this._maxEnergy = 100;
        this._lightEnergy = this._maxEnergy;
        this._darkEnergy = this._maxEnergy;
        this._drainRate = 15;
        this._inLight = true;
    }

    /**
     * Handles player death, plays death sound and triggers player died event
     */
    die() {
        AudioManager.instance.playSound(Sounds.Die);
        this._reset();
        GlobalEvents.instance.playerDied.dispatch();
    }

    /**
     * Flag to track if low energy alarm has played in light dimension
     */
    private _playedAlarmLight = false;

    /**
     * Flag to track if low energy alarm has played in dark dimension
     */
    private _playedAlarmDark = false;

    /**
     * Updates player state based on the current dimension
     * Manages energy levels and triggers alarms/death as needed
     * @param dt Delta time in seconds since last update
     */
    update(dt: number): void {
        let changed = false;

        if (this._completed || !GameState.instance.inProgress) {
            return;
        }
        if (this._inLight) {
            const newLight = Math.min(
                this._maxEnergy,
                this._lightEnergy + this._drainRate * dt
            );
            const newDark = Math.max(
                0,
                this._darkEnergy - this._drainRate * dt
            );

            // Check if dark energy dropped below 10% and alarm hasn't played yet
            if (newDark < this._maxEnergy * 0.1 && !this._playedAlarmDark) {
                AudioManager.instance.playSound(Sounds.Alarm);
                this._playedAlarmDark = true;
            }

            if (
                newLight !== this._lightEnergy ||
                newDark !== this._darkEnergy
            ) {
                this._lightEnergy = newLight;
                this._darkEnergy = newDark;
                changed = true;
            }
        } else {
            const newDark = Math.min(
                this._maxEnergy,
                this._darkEnergy + this._drainRate * dt
            );
            const newLight = Math.max(
                0,
                this._lightEnergy - this._drainRate * dt
            );

            // Check if light energy dropped below 10% and alarm hasn't played yet
            if (newLight < this._maxEnergy * 0.1 && !this._playedAlarmLight) {
                AudioManager.instance.playSound(Sounds.Alarm);
                this._playedAlarmLight = true;
            }

            if (
                newLight !== this._lightEnergy ||
                newDark !== this._darkEnergy
            ) {
                this._lightEnergy = newLight;
                this._darkEnergy = newDark;
                changed = true;
            }
        }
        if (changed) {
            this._notifyEnergyListeners();
        }
        if (this._lightEnergy <= 0 || this._darkEnergy <= 0) {
            this.die();
        }
    }

    /**
     * Notifies all energy change listeners when energy values change
     * @private
     */
    private _notifyEnergyListeners() {
        for (const cb of this._energyListeners) {
            cb();
        }
    }

    /**
     * Registers a callback to be notified when energy values change
     * @param cb The callback function to execute on energy change
     */
    public subscribeEnergyChange(cb: () => void) {
        this._energyListeners.push(cb);
    }

    /**
     * Unregisters a previously registered energy change callback
     * @param cb The callback function to remove
     */
    public unsubscribeEnergyChange(cb: () => void) {
        const idx = this._energyListeners.indexOf(cb);
        if (idx !== -1) {
            this._energyListeners.splice(idx, 1);
        }
    }

    /**
     * Gets the current light dimension energy level
     */
    public get lightEnergy(): number {
        return this._lightEnergy;
    }

    /**
     * Gets the current dark dimension energy level
     */
    public get darkEnergy(): number {
        return this._darkEnergy;
    }

    /**
     * Gets the maximum energy capacity
     */
    public get maxEnergy(): number {
        return this._maxEnergy;
    }

    /**
     * Marks the current level as completed
     * @private
     */
    private _levelCompleted() {
        this._completed = true;
    }
}
