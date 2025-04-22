import { GlobalEvents } from './GlobalEvents.js';

export class PlayerState {
    private static _instance: PlayerState;
    static get instance(): PlayerState {
        if (!PlayerState._instance) {
            PlayerState._instance = new PlayerState();
        }
        return PlayerState._instance;
    }

    private _lightEnergy: number;
    private _darkEnergy: number;
    private _maxEnergy: number;
    private _drainRate: number;
    private _inLight: boolean;
    private _energyListeners: Array<() => void> = [];

    private constructor() {
        this._reset();
        GlobalEvents.instance.switchDimension.add(
            this._onSwitchDimension,
            this
        );
    }

    private _onSwitchDimension = (isLight: boolean) => {
        this._inLight = isLight;
    };

    die() {
        this._reset();
        GlobalEvents.instance.playerDied.dispatch();
    }

    update(dt: number): void {
        let changed = false;
        if (this._inLight) {
            const newLight = Math.min(
                this._maxEnergy,
                this._lightEnergy + this._drainRate * dt
            );
            const newDark = Math.max(
                0,
                this._darkEnergy - this._drainRate * dt
            );
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

    private _reset() {
        this._maxEnergy = 100;
        this._lightEnergy = this._maxEnergy;
        this._darkEnergy = this._maxEnergy;
        this._drainRate = 10;
        this._inLight = true;
    }
}
