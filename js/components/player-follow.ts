import { Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { vec3 } from 'gl-matrix';

// Temporary variables for calculations to avoid allocations in update
const tempPos = vec3.create();
const targetPos = vec3.create();
const currentPos = vec3.create();
const lerpedPos = vec3.create();

export class PlayerFollow extends Component {
    static TypeName = 'player-follow';

    /**
     * The player object to follow.
     */
    @property.object({ required: true })
    player!: Object3D;

    /**
     * Target distance to keep from the player (e.g., on the Z axis for side view).
     */
    @property.float(10.0) // Adjusted default for a potential side view
    distance = 10.0;

    /**
     * Speed to lerp towards the target position.
     */
    @property.float(1.0)
    speed = 1.0;

    /**
     * Vertical offset from the player's position.
     */
    @property.float(4.0)
    height = 4.0;

    // init() {} // init is usually not needed unless for complex setup before start

    start() {
        if (!this.player) {
            throw new Error(
                'player-follow: Player object property is not set.'
            );
        }
    }

    update(dt: number) {
        if (!this.player) {
            return; // Should not happen if start check passes, but good practice
        }

        // 1. Get player's position
        this.player.getPositionWorld(tempPos);

        // 2. Calculate target position with fixed offset
        // targetPos = playerPos + offset
        // Assuming player moves along X/Y plane, camera stays offset on Z
        targetPos[0] = tempPos[0]; // Follow player's X
        targetPos[1] = tempPos[1] + this.height; // Follow player's Y + height offset
        targetPos[2] = tempPos[2] + this.distance; // Maintain fixed Z distance relative to player

        // 3. Get current follower position
        this.object.getPositionWorld(currentPos);

        // 4. Lerp current position towards target position
        const lerpFactor = Math.min(this.speed * dt, 1.0); // Clamp lerp factor
        vec3.lerp(lerpedPos, currentPos, targetPos, lerpFactor);

        // 5. Set the new position
        this.object.setPositionWorld(lerpedPos);

        // 6. Rotation logic was already removed
    }
}
