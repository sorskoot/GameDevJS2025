import { AudioManager, Sounds } from './AudioManager.js';
import { GameState } from './GameState.js';
import { GlobalEvents } from './GlobalEvents.js';

export class PlayerState {
    private static _instance: PlayerState;
    private _completed: boolean = false;
    static get instance(): PlayerState {
        if (!PlayerState._instance) {
            PlayerState._instance = new PlayerState();
        }
        return PlayerState._instance;
    }

    private _lightEnergy: number = 100;
    private _darkEnergy: number = 100;
    private _maxEnergy: number = 100;
    private _drainRate: number = 15;
    private _inLight: boolean = false;
    private _energyListeners: Array<() => void> = [];

    private constructor() {
        this._reset();
        GlobalEvents.instance.switchDimension.add(
            this._onSwitchDimension,
            this
        );
        GlobalEvents.instance.levelCompleted.add(this._levelCompleted, this);
        GlobalEvents.instance.levelReset.add(this._reset, this);
    }

    private _onSwitchDimension = (isLight: boolean) => {
        this._inLight = isLight;
        // Reset alarm flags when switching dimensions
        this._playedAlarmLight = false;
        this._playedAlarmDark = false;
    };

    private _reset() {
        this._completed = false;
        this._maxEnergy = 100;
        this._lightEnergy = this._maxEnergy;
        this._darkEnergy = this._maxEnergy;
        this._drainRate = 15;
        this._inLight = true;
    }

    die() {
        AudioManager.instance.playSound(Sounds.Die);
        this._reset();
        GlobalEvents.instance.playerDied.dispatch();
    }

    private _playedAlarmLight = false;
    private _playedAlarmDark = false;

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

    private _notifyEnergyListeners() {
        for (const cb of this._energyListeners) {
            cb();
        }
    }

    public subscribeEnergyChange(cb: () => void) {
        this._energyListeners.push(cb);
    }

    public unsubscribeEnergyChange(cb: () => void) {
        const idx = this._energyListeners.indexOf(cb);
        if (idx !== -1) {
            this._energyListeners.splice(idx, 1);
        }
    }

    public get lightEnergy(): number {
        return this._lightEnergy;
    }

    public get darkEnergy(): number {
        return this._darkEnergy;
    }

    public get maxEnergy(): number {
        return this._maxEnergy;
    }

    private _levelCompleted() {
        this._completed = true;
    }
}
