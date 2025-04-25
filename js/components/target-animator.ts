import { Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { vec3 } from 'gl-matrix';

/**
 * Reusable vector for position calculations to avoid allocations during update
 */
const tempPosition = vec3.create();

/**
 * Component that animates an end-level energy crystal or target
 * Provides two simultaneous animations:
 * 1. Continuous rotation around the Y axis
 * 2. Smooth up and down movement in a sine wave pattern
 */
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

    /**
     * Original Y position of the object, used as the center point for vertical oscillation
     * @private
     */
    private _initialY: number = 0;

    /**
     * Total time elapsed since component activation, used for continuous animation
     * @private
     */
    private _elapsedTime: number = 0;

    /**
     * Captures initial position at start for reference in animation calculations
     */
    start() {
        // Store the initial local Y position
        this.object.getPositionLocal(tempPosition);
        this._initialY = tempPosition[1];
    }

    /**
     * Updates the object's rotation and vertical position each frame
     * Applies rotation around Y axis at constant speed
     * Moves object up and down in a sine wave pattern
     * @param dt Delta time in seconds since last update
     */
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
