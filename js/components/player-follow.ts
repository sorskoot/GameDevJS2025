import { Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { vec3 } from 'gl-matrix';

/**
 * Reusable vectors for camera following calculations
 * These are created outside the component to avoid allocations during updates
 */
const tempPos = vec3.create();
const targetPos = vec3.create();
const currentPos = vec3.create();
const lerpedPos = vec3.create();

/**
 * Component that makes an object (typically a camera) smoothly follow the player
 * Maintains a constant distance and height offset while using interpolation for smooth movement
 */
export class PlayerFollow extends Component {
    static TypeName = 'player-follow';

    /**
     * The player object to follow
     */
    @property.object({ required: true })
    player!: Object3D;

    /**
     * Target distance to keep from the player on the Z axis
     */
    @property.float(10.0)
    distance = 10.0;

    /**
     * Speed factor for interpolation movement
     * Higher values make the camera follow more quickly
     */
    @property.float(1.0)
    speed = 1.0;

    /**
     * Vertical offset above the player's position
     */
    @property.float(4.0)
    height = 4.0;

    /**
     * Validates that required properties are set
     * Throws an error if the player object is not assigned
     */
    start() {
        if (!this.player) {
            throw new Error(
                'player-follow: Player object property is not set.'
            );
        }
    }

    /**
     * Updates the follower's position each frame to track the player
     * Uses linear interpolation for smooth movement
     * @param dt Delta time in seconds since last update
     */
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
