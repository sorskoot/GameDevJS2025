import { vec2, vec3 } from 'gl-matrix';

/**
 * Represents different states of input events
 */
export enum KeyEventType {
    /**
     * Input was just triggered this frame
     */
    Triggered,

    /**
     * Input is being held down
     */
    Pressed,

    /**
     * Input was just released this frame
     */
    Released,

    /**
     * No input event occurred
     */
    None,

    /**
     * Legacy/deprecated event type
     */
    a,
}

/**
 * Represents different input actions that can be mapped to physical inputs
 */
export enum KeyType {
    /**
     * No input
     */
    Nothing = 0,

    /**
     * Primary action button (e.g. jump, select)
     */
    Button1 = 1,

    /**
     * Secondary action button (e.g. switch dimension)
     */
    Button2,

    /**
     * Move left
     */
    Left,

    /**
     * Move right
     */
    Right,

    /**
     * Move up or jump
     */
    Up,

    /**
     * Move down or crouch
     */
    Down,

    /**
     * Pause game
     */
    Pause,

    /**
     * Back/cancel navigation
     */
    Back,

    /**
     * Menu option 1
     */
    Menu1,

    /**
     * Menu option 2
     */
    Menu2,

    /**
     * Menu option 3
     */
    Menu3,

    /**
     * Menu option 4
     */
    Menu4,

    /**
     * Menu option 5
     */
    Menu5,
}

/**
 * Record of touch position and state
 */
type TouchRecord = {
    /**
     * 2D position of the touch
     */
    position: vec2;

    /**
     * Current state of the touch
     */
    type: KeyEventType;
};

/**
 * Singleton class for managing game input from various sources
 * Handles tracking and retrieving the state of keyboard, touch and virtual inputs
 */
export class InputManager {
    /**
     * Singleton instance
     */
    static _instance: InputManager;

    /**
     * Get the singleton instance of InputManager
     * @returns The InputManager instance
     */
    static get instance() {
        return (
            InputManager._instance ??
            (InputManager._instance = new InputManager())
        );
    }

    /**
     * Information about the last recorded touch event
     */
    private readonly _lastTouch: TouchRecord = {
        position: vec2.create(),
        type: KeyEventType.None,
    };

    /**
     * Map storing the current state of all input keys
     */
    private _keyStatus: Map<KeyType, KeyEventType> = new Map();

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        this._reset();
    }

    /**
     * Checks if a key is currently being pressed
     * @param keyType The key to check
     * @returns True if the key is in the pressed state
     */
    static getKey(keyType: KeyType): boolean {
        return (
            InputManager.instance.getKeyStatus(keyType) == KeyEventType.Pressed
        );
    }

    /**
     * Checks if a key was just pressed down this frame
     * @param keyType The key to check
     * @returns True if the key was just triggered
     */
    static getKeyDown(keyType: KeyType): boolean {
        return (
            InputManager.instance.getKeyStatus(keyType) ==
            KeyEventType.Triggered
        );
    }

    /**
     * Records a touch event with position and type
     * @param position The [x,y] position of the touch
     * @param type The touch event type (triggered, pressed, released)
     */
    recordTouch(position: number[], type: KeyEventType) {
        vec2.set(this._lastTouch.position, position[0], position[1]);
        this._lastTouch.type = type;
    }

    /**
     * Gets the position of a touch event
     * @param pointerIndex Index of the pointer (only supports single touch currently)
     * @returns The 2D position vector of the touch
     */
    getTouchPoint(pointerIndex: number): vec2 {
        return this._lastTouch.position;
    }

    /**
     * Checks if a touch is currently active (pressed down)
     * @param pointerIndex Index of the pointer to check
     * @returns True if the touch is in the pressed state
     */
    getTouchPressed(pointerIndex: number) {
        return this._lastTouch.type == KeyEventType.Pressed;
    }

    /**
     * Checks if a touch was just triggered this frame
     * @param pointerIndex Index of the pointer to check
     * @returns True if the touch was just triggered
     */
    getTouchTriggered(pointerIndex: number) {
        return this._lastTouch.type == KeyEventType.Triggered;
    }

    /**
     * Checks if a touch was just released this frame
     * @param pointerIndex Index of the pointer to check
     * @returns True if the touch was just released
     */
    getTouchReleased(pointerIndex: number) {
        return this._lastTouch.type == KeyEventType.Released;
    }

    /**
     * Gets the current status of a key action
     * @param action The key action to check
     * @returns The current event state of the key
     */
    getKeyStatus(action: KeyType) {
        return this._keyStatus.get(action);
    }

    /**
     * Records a key event for a specific key action
     * @param key The key action that was triggered
     * @param event The type of event that occurred
     */
    recordKey(key: KeyType, event: KeyEventType) {
        if (event != KeyEventType.None) {
            this._keyStatus.set(key, event);
        }
    }

    /**
     * Resets all key states to None
     * @private
     */
    private _reset() {
        for (let key in KeyType) {
            if (isNaN(Number(key))) {
                this._keyStatus.set(
                    KeyType[key as keyof typeof KeyType],
                    KeyEventType.None
                );
            }
        }
    }
}
