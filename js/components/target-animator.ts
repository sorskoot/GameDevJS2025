import { Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { vec3 } from 'gl-matrix';

const tempPosition = vec3.create();

export class TargetAnimator extends Component {
    static TypeName = 'target-animator';

    /** Speed of rotation around the Y axis in degrees per second */
    @property.float(90.0)
    rotationSpeed!: number;

    /** Speed of the vertical sine wave movement in cycles per second */
    @property.float(0.5)
    verticalSpeed!: number;

    /** Maximum distance the object moves up and down from its starting position */
    @property.float(0.25)
    verticalDistance!: number;

    private _initialY: number = 0;
    private _elapsedTime: number = 0;

    start() {
        // Store the initial local Y position
        this.object.getPositionLocal(tempPosition);
        this._initialY = tempPosition[1];
    }

    update(dt: number) {
        this._elapsedTime += dt;

        // --- Rotation ---
        this.object.rotateAxisAngleDegLocal([0, 1, 0], this.rotationSpeed * dt);

        // --- Vertical Movement ---
        const verticalOffset =
            Math.sin(this._elapsedTime * this.verticalSpeed * 2 * Math.PI) *
            this.verticalDistance;

        // Get current local position, update Y, and set it back
        this.object.getPositionLocal(tempPosition);
        tempPosition[1] = this._initialY + verticalOffset;
        this.object.setPositionLocal(tempPosition);
    }
}
