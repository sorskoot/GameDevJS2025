import { CollisionComponent, Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { InputManager, KeyType } from './input/InputManager.js';
import { quat, vec3 } from 'gl-matrix';
import { GlobalEvents } from '../classes/GlobalEvents.js';
import { RayHit } from '@wonderlandengine/api'; // Import RayHit
import { Tags, wlUtils } from '@sorskoot/wonderland-components';
import { LevelState } from '../classes/LevelState.js';
import { PlayerState } from '../classes/PlayerState.js';
import { GameState } from '../classes/GameState.js';
import { AudioManager, Sounds } from '../classes/AudioManager.js';

/**
 * Reusable vector for movement calculations
 */
const moveVec3 = vec3.create();

/**
 * Reusable vector for position storage
 */
const posVec3 = vec3.create();

/**
 * Reusable quaternion for rotation calculations
 */
const rotQuat = quat.create();

/**
 * Identity quaternion for reference
 */
const quatIdentity = quat.identity(quat.create());

/**
 * Vector representing the downward direction (for raycasting)
 */
const downVec3 = vec3.fromValues(0, -1, 0);

/**
 * Vector representing the upward direction (for raycasting)
 */
const upVec3 = vec3.fromValues(0, 1, 0);

/**
 * Temporary vector for various calculations
 */
const tempVec3 = vec3.create();

/**
 * Secondary temporary vector for calculations
 */
const tempVec3_2 = vec3.create();

/**
 * Horizontal offset for ground check raycasts (left/right of center)
 */
const rayStartOffset = 0.2;

/**
 * Distance to check for ground below the player
 */
const groundCheckDist = 0.2;

/**
 * Small vertical offset for ground snapping and collision detection
 */
const groundSnapTolerance = 0.1;

/**
 * Collision mask for floors and walls
 */
const FLOOR_WALL_MASK = (1 << 1) + (1 << 2) + (1 << 3);

/**
 * Player movement states
 */
enum playerState {
    /**
     * Initial state before player has control
     */
    init,

    /**
     * Player is standing still
     */
    idle,

    /**
     * Player is moving at normal speed
     */
    walking,

    /**
     * Player is moving at increased speed
     */
    running,
}

/**
 * Component that handles player movement, physics, and interactions
 * Manages horizontal movement, jumping, gravity, and collision detection
 */
export class PlayerController extends Component {
    static TypeName = 'player-controller';

    /**
     * Horizontal movement speed in units per second
     */
    @property.float(1.0)
    speed = 1.0;

    /**
     * Initial upward velocity applied when jumping
     */
    @property.float(5.0)
    jumpInitialVelocity = 5.0;

    /**
     * Gravity acceleration applied to vertical movement
     */
    @property.float(9.81)
    gravity = 9.81;

    /**
     * Object with collision component for detecting interactions
     */
    @property.object({ required: true })
    collisionObject!: Object3D;

    /**
     * Particle effect prefab to spawn when player dies
     */
    @property.object({ required: true })
    deathEffect!: Object3D;

    /**
     * Whether player is currently on the ground
     * @private
     */
    private _isGrounded: boolean = false;

    /**
     * Current vertical velocity (positive = up, negative = down)
     * @private
     */
    private _verticalVelocity: number = 0;

    /**
     * Reference to the collision component
     * @private
     */
    private _collision!: CollisionComponent;

    /**
     * Whether the current level has been completed
     * @private
     */
    private _completed: boolean = false;

    /**
     * Initializes the player controller and sets up event listeners
     */
    start() {
        this._collision =
            this.collisionObject.getComponent(CollisionComponent)!;
        GlobalEvents.instance.teleportPlayer.add(this._onTeleportPlayer, this);
        GlobalEvents.instance.playerDied.add(this._die, this); // Dispatch event for player death
        GlobalEvents.instance.levelReset.add(this._reset, this); // Dispatch event for player death
        this._reset(); // Reset state on start
    }

    /**
     * Updates player state each frame
     * Handles gravity, input processing, and collision detection
     * @param dt Delta time in seconds since last update
     */
    update(dt: number) {
        if (this._completed || !GameState.instance.inProgress) {
            return; // Skip input handling if level is completed
        }

        this._applyGravity(dt); // Apply gravity and vertical movement
        this._handleInput(dt);
        this._checkCollisions();
    }

    /**
     * Checks for collisions with special objects like the level target
     * @private
     */
    private _checkCollisions() {
        const overlaps = this._collision.queryOverlaps();
        if (overlaps.length > 0) {
            for (const overlap of overlaps) {
                if (Tags.hasTag(overlap.object, 'target')) {
                    // level Complete
                    this._completed = true;
                    AudioManager.instance.playSound(Sounds.LevelComplete);
                    LevelState.instance.completeLevel();
                }
            }
        }
    }

    /**
     * Checks if the player is currently on the ground using raycasts
     * @returns True if either left or right raycast detects ground below player
     * @private
     */
    private _checkGrounded(): boolean {
        this.object.getPositionWorld(posVec3);

        // Raycast 1 (slightly left)
        vec3.set(
            tempVec3,
            posVec3[0] - rayStartOffset,
            posVec3[1] + groundSnapTolerance, // Start slightly above feet
            posVec3[2]
        );

        const hit1 = this.engine.scene.rayCast(
            tempVec3,
            downVec3,
            FLOOR_WALL_MASK,
            groundCheckDist + groundSnapTolerance // Check slightly below feet
        );

        const leftHit = hit1.hitCount > 0;

        // Raycast 2 (slightly right)
        vec3.set(
            tempVec3_2,
            posVec3[0] + rayStartOffset,
            posVec3[1] + groundSnapTolerance, // Start slightly above feet
            posVec3[2]
        );

        const hit2 = this.engine.scene.rayCast(
            tempVec3_2,
            downVec3,
            FLOOR_WALL_MASK,
            groundCheckDist + groundSnapTolerance // Check slightly below feet
        );
        const rightHit = hit2.hitCount > 0;
        // Grounded if either ray hits something
        return leftHit || rightHit;
    }

    /**
     * Performs raycasts below the player to detect ground
     * @returns RayHit object if ground is detected, null otherwise
     * @private
     */
    private _getGroundHit(): RayHit | null {
        this.object.getPositionWorld(posVec3);
        const checkDist = groundCheckDist + groundSnapTolerance;

        // Raycast 1 (slightly left)
        vec3.set(
            tempVec3,
            posVec3[0] - rayStartOffset,
            posVec3[1] + groundSnapTolerance,
            posVec3[2]
        );
        const hit1 = this.engine.scene.rayCast(
            tempVec3,
            downVec3,
            FLOOR_WALL_MASK,
            checkDist
        );
        if (hit1.hitCount > 0) return hit1;

        // Raycast 2 (slightly right)
        vec3.set(
            tempVec3_2,
            posVec3[0] + rayStartOffset,
            posVec3[1] + groundSnapTolerance,
            posVec3[2]
        );
        const hit2 = this.engine.scene.rayCast(
            tempVec3_2,
            downVec3,
            FLOOR_WALL_MASK,
            checkDist
        );
        if (hit2.hitCount > 0) return hit2;

        return null;
    }

    /**
     * Performs raycasts above the player to detect ceilings
     * @returns RayHit object if ceiling is detected, null otherwise
     * @private
     */
    private _getCeilingHit(): RayHit | null {
        this.object.getPositionWorld(posVec3);
        const checkDist = groundCheckDist + groundSnapTolerance; // Reusing same distance

        // Raycast 1 (slightly left)
        vec3.set(
            tempVec3,
            posVec3[0] - rayStartOffset,
            posVec3[1] - groundSnapTolerance + 0.4, // Start slightly below head
            posVec3[2]
        );
        const hit1 = this.engine.scene.rayCast(
            tempVec3,
            upVec3,
            FLOOR_WALL_MASK,
            checkDist
        );
        if (hit1.hitCount > 0) return hit1;

        // Raycast 2 (slightly right)
        vec3.set(
            tempVec3_2,
            posVec3[0] + rayStartOffset,
            posVec3[1] - groundSnapTolerance + 0.4, // Start slightly below head
            posVec3[2]
        );
        const hit2 = this.engine.scene.rayCast(
            tempVec3_2,
            upVec3,
            FLOOR_WALL_MASK,
            checkDist
        );
        if (hit2.hitCount > 0) return hit2;

        return null;
    }

    /**
     * Applies gravity, handles ground snapping, and updates vertical movement
     * @param dt Delta time in seconds since last update
     * @private
     */
    private _applyGravity(dt: number): void {
        const wasGrounded = this._isGrounded;
        this._isGrounded = !!this._getGroundHit();

        // Apply gravity force (always, unless grounded and not moving up)
        if (!this._isGrounded || this._verticalVelocity > 0) {
            if (!!this._getCeilingHit() && this._verticalVelocity > 0) {
                AudioManager.instance.playSound(Sounds.Bump);
                this._verticalVelocity = 0;
            }
            this._verticalVelocity -= this.gravity * dt;
        }

        if (this._isGrounded) {
            // Landed or on ground
            if (this._verticalVelocity <= 0) {
                // Only reset if moving down or still
                this._verticalVelocity = 0; // Stop downward movement when grounded

                // Snap to ground if we just landed or are slightly below
                if (!wasGrounded) {
                    const groundHit = this._getGroundHit();
                    if (groundHit && groundHit.hitCount > 0) {
                        if (Tags.hasTag(groundHit.objects[0]!, 'death')) {
                            AudioManager.instance.playSound(Sounds.Die);
                            PlayerState.instance.die();
                            return;
                        }
                        AudioManager.instance.playSound(Sounds.Land);
                        this.object.getPositionWorld(posVec3);
                        // Calculate the exact ground position
                        const groundY =
                            posVec3[1] +
                            groundSnapTolerance -
                            groundHit.distances[0];
                        this.object.setPositionWorld([
                            posVec3[0],
                            groundY,
                            posVec3[2],
                        ]);
                        // Early exit after snapping to prevent applying tiny velocity
                        return;
                    }
                }
            }
        }

        // Apply final vertical velocity
        if (this._verticalVelocity != 0) {
            this.object.translateObject([0, this._verticalVelocity * dt, 0]);
            // // Re-check grounded after moving, especially if falling fast
            const groundHit = this._getGroundHit();
            if (groundHit && groundHit.hitCount > 0 && !this._jump) {
                AudioManager.instance.playSound(Sounds.Bump);
                this._isGrounded = true;
            }

            // If we became grounded after falling, snap and zero velocity
            if (this._isGrounded && this._verticalVelocity < 0) {
                if (groundHit && groundHit.hitCount > 0) {
                    if (Tags.hasTag(groundHit.objects[0]!, 'death')) {
                        AudioManager.instance.playSound(Sounds.Die);
                        PlayerState.instance.die();
                        return;
                    }
                    this.object.getPositionWorld(posVec3);
                    const groundY =
                        posVec3[1] +
                        groundSnapTolerance -
                        groundHit.distances[0];
                    this.object.setPositionWorld([
                        posVec3[0],
                        groundY,
                        posVec3[2],
                    ]);
                    this._verticalVelocity = 0;
                }
            }
        }
    }

    /**
     * Handles player death - spawns death particles and resets state
     * @private
     */
    private _die() {
        const deathFX = this.deathEffect.clone();
        deathFX.setPositionWorld(this.object.getPositionWorld(posVec3));
        wlUtils.setActive(deathFX, true);
        this._reset();
    }

    /**
     * Resets player to initial state (used on level start or after death)
     * @private
     */
    private _reset() {
        // Store initial Y position (less critical now, but good for reference)
        this._completed = false;
        this.object.getPositionWorld(posVec3);
        this._isGrounded = this._checkGrounded(); // Initial ground check
        this._verticalVelocity = 0; // Ensure starting with no vertical movement
    }

    /**
     * Processes player input for movement and actions
     * Handles dimension switching, jumping, and horizontal movement
     * @param dt Delta time in seconds since last update
     * @private
     */
    private _handleInput(dt: number) {
        let moveX = 0;

        if (InputManager.getKeyDown(KeyType.Button2)) {
            AudioManager.instance.playSound(Sounds.Switch);
            LevelState.instance.switchDimension(); // Switch dimension on button press
            //            GlobalEvents.instance.SwitchDimension.dispatch();
        }

        if (InputManager.getKeyDown(KeyType.Button1)) {
            this._jump();
        }

        this.object.getPositionWorld(posVec3);

        // --- Horizontal Movement ---
        // No longer need to check _isJumping here, gravity handles vertical movement
        if (InputManager.getKey(KeyType.Left)) {
            moveX = -1;
            let f = this.engine.scene.rayCast(
                [posVec3[0], posVec3[1] + 0.1, 0], // Check from mid-height
                [-1, 0, 0],
                FLOOR_WALL_MASK,
                0.25
            );
            if (f.hitCount > 0) {
                moveX = 0;
            }
        }

        if (InputManager.getKey(KeyType.Right)) {
            moveX = 1;
            let f = this.engine.scene.rayCast(
                [posVec3[0], posVec3[1] + 0.1, 0], // Check from mid-height
                [1, 0, 0],
                FLOOR_WALL_MASK,
                0.25
            );
            if (f.hitCount > 0) {
                moveX = 0;
            }
        }

        if (moveX !== 0) {
            moveX *= dt * this.speed * (this._isGrounded ? 1 : 0.5); // Adjust speed based on grounded state
            this.object.translateObject([moveX, 0, 0]); // Use translateObject for relative movement
        }
    }

    /**
     * Makes the player jump if currently grounded
     * @private
     */
    private _jump() {
        // Only jump if grounded
        if (this._isGrounded) {
            AudioManager.instance.playSound(Sounds.Jump);
            this._isGrounded = false; // No longer grounded once jump starts
            this._verticalVelocity = this.jumpInitialVelocity; // Apply initial jump force
        }
    }

    /**
     * Teleports the player to a new position
     * Handles ground snapping and resets vertical velocity
     * @param position The world position to teleport to
     * @private
     */
    private _onTeleportPlayer = (position: number[]) => {
        // Use arrow function
        this.object.setPositionWorld(position);
        // Reset vertical velocity
        this._verticalVelocity = 0;
        // Re-check grounded status immediately after teleport
        this._isGrounded = this._checkGrounded();
        // If teleported onto ground, ensure snapped correctly
        if (this._isGrounded) {
            const groundHit = this._getGroundHit();
            if (groundHit && groundHit.hitCount > 0) {
                const groundY =
                    position[1] + groundSnapTolerance - groundHit.distances[0];
                this.object.setPositionWorld([
                    position[0],
                    groundY,
                    position[2],
                ]);
            }
        }
    };
}
