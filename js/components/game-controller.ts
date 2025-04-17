import { Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';

export class GameController extends Component {
    static TypeName = 'game-controller';

    // Singleton
    private static _instance: GameController;
    static get instance(): GameController {
        return GameController._instance;
    }

    init() {
        if (GameController._instance) {
            console.error(
                'There can only be one instance of GameController Component'
            );
        }
        GameController._instance = this;
    }

    start() {}

    update(dt: number) {
        this._updateEnergy(dt);
    }

    private _updateEnergy(dt: number) {
        // if (this._inLight) {
        //     this.lightEnergy = Math.min(this.maxEnergy, this.lightEnergy + this.drainRate * dt);
        //     this.darkEnergy = Math.max(0, this.darkEnergy - this.drainRate * dt);
        // } else {
        //     this.darkEnergy = Math.min(this.maxEnergy, this.darkEnergy + this.drainRate * dt);
        //     this.lightEnergy = Math.max(0, this.lightEnergy - this.drainRate * dt);
        // }
        // // Check for death
        // if (this.lightEnergy <= 0 || this.darkEnergy <= 0) {
        //     // Trigger death/reset
        // }
    }
}
