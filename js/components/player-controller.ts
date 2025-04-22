import {
    AnimationComponent,
    Collider,
    CollisionComponent,
    Component,
    Object3D,
} from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { InputManager, KeyType } from './input/InputManager.js';
import { quat, vec3 } from 'gl-matrix';
import { GlobalEvents } from '../classes/GlobalEvents.js';
import { RayHit } from '@wonderlandengine/api'; // Import RayHit
import { Tags } from '@sorskoot/wonderland-components';
import { LevelState } from '../classes/LevelState.js';
import { PlayerState } from '../classes/PlayerState.js';

const moveVec3 = vec3.create();
const posVec3 = vec3.create();
const rotQuat = quat.create();
const quatIdentity = quat.identity(quat.create());
const downVec3 = vec3.fromValues(0, -1, 0); // Constant for down direction
const tempVec3 = vec3.create(); // Temporary vector for calculations
const rayStartOffset = 0.2; // Offset for the two ground check rays
const groundCheckDist = 0.2; // How far down to check for ground (adjust as needed)
const groundSnapTolerance = 0.1; // Small tolerance for snapping

const FLOOR_WALL_MASK = (1 << 1) + (1 << 2) + (1 << 3);

enum playerState {
    init,
    idle,
    walking,
    running,
}

export class PlayerController extends Component {
    static TypeName = 'player-controller';

    @property.float(1.0)
    speed = 1.0;

    @property.float(5.0) // Initial upward velocity for the jump
    jumpInitialVelocity = 5.0;

    @property.float(9.81) // Gravity acceleration
    gravity = 9.81;

    @property.object({ required: true })
    collisionObject!: Object3D;

    // @property.animation()
    // idle: Animation;

    // @property.animation()
    // run: Animation;

    // @property.object({ required: true })
    // animationRoot!: Object3D;

    //private _animationComponent: AnimationComponent;
    // private _characterState: playerState = playerState.init;
    // private _lastAngle: number = 0;

    // Gravity/Jump state
    private _isGrounded: boolean = false;
    private _verticalVelocity: number = 0; // Combined jump/fall velocity
    private _collision: CollisionComponent;

    init() {}

    start() {
        this._collision = this.collisionObject.getComponent(CollisionComponent);
        // this._animationComponent =
        //     this.animationRoot.getComponent(AnimationComponent)!;
        GlobalEvents.instance.teleportPlayer.add(this._onTeleportPlayer, this);
        GlobalEvents.instance.playerDied.add(this._die, this); // Dispatch event for player death
        this._reset(); // Reset state on start
    }

    update(dt: number) {
        this._applyGravity(dt); // Apply gravity and vertical movement
        this._handleInput(dt);
        this._checkCollisions();
    }
    private _checkCollisions() {
        const overlaps = this._collision.queryOverlaps();
        if (overlaps.length > 0) {
            for (const overlap of overlaps) {
                if (Tags.hasTag(overlap.object, 'target')) {
                    // level Complete
                    LevelState.instance.completeLevel();
                }
            }
        }
    }

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

        // Raycast 2 (slightly right)
        vec3.set(
            tempVec3,
            posVec3[0] + rayStartOffset,
            posVec3[1] + groundSnapTolerance, // Start slightly above feet
            posVec3[2]
        );
        const hit2 = this.engine.scene.rayCast(
            tempVec3,
            downVec3,
            FLOOR_WALL_MASK,
            groundCheckDist + groundSnapTolerance // Check slightly below feet
        );

        // Grounded if either ray hits something
        return hit1.hitCount > 0 || hit2.hitCount > 0;
    }

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
            tempVec3,
            posVec3[0] + rayStartOffset,
            posVec3[1] + groundSnapTolerance,
            posVec3[2]
        );
        const hit2 = this.engine.scene.rayCast(
            tempVec3,
            downVec3,
            FLOOR_WALL_MASK,
            checkDist
        );
        if (hit2.hitCount > 0) return hit2;

        return null;
    }

    private _applyGravity(dt: number): void {
        const wasGrounded = this._isGrounded;
        this._isGrounded = this._checkGrounded();

        // Apply gravity force (always, unless grounded and not moving up)
        if (!this._isGrounded || this._verticalVelocity > 0) {
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
                        if (Tags.hasTag(groundHit.objects[0], 'death')) {
                            PlayerState.instance.die();
                            return;
                        }

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
        if (this._verticalVelocity !== 0) {
            this.object.translateObject([0, this._verticalVelocity * dt, 0]);
            // Re-check grounded after moving, especially if falling fast
            this._isGrounded = this._checkGrounded();
            // If we became grounded after falling, snap and zero velocity
            if (this._isGrounded && this._verticalVelocity < 0) {
                const groundHit = this._getGroundHit();
                if (groundHit && groundHit.hitCount > 0) {
                    if (Tags.hasTag(groundHit.objects[0], 'death')) {
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
    private _die() {
        this._reset();
    }

    private _reset() {
        // Store initial Y position (less critical now, but good for reference)
        this.object.getPositionWorld(posVec3);
        this._isGrounded = this._checkGrounded(); // Initial ground check
        this._verticalVelocity = 0; // Ensure starting with no vertical movement
    }

    private _handleInput(dt: number) {
        let moveX = 0;

        if (InputManager.getKeyDown(KeyType.Button2)) {
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

    private _jump() {
        // Only jump if grounded
        if (this._isGrounded) {
            this._isGrounded = false; // No longer grounded once jump starts
            this._verticalVelocity = this.jumpInitialVelocity; // Apply initial jump force
        }
    }

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
