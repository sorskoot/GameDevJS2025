import { Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { GameState } from '../classes/GameState.js';
import { LevelState } from '../classes/LevelState.js';
import { GlobalEvents } from '../classes/GlobalEvents.js';
import { PlayerState } from '../classes/PlayerState.js';
import { MapLoader } from './map-loader.js';

/**
 * Main component that manages the game lifecycle and coordinates between various subsystems
 * Handles level transitions, player state updates, and game progression
 */
export class GameRoot extends Component {
    static TypeName = 'game-root';

    /**
     * Reference to the player object (required)
     */
    @property.object({ required: true })
    player!: Object3D;

    /**
     * Singleton instance of GameRoot
     * @private
     */
    private static _instance: GameRoot;

    /**
     * Gets the singleton instance of GameRoot
     * @returns The GameRoot instance
     */
    static get instance(): GameRoot {
        return GameRoot._instance;
    }

    /**
     * Reference to the game's global state manager
     * @private
     */
    private _gameState!: GameState;

    /**
     * Reference to the current level's state manager
     * @private
     */
    private _levelState!: LevelState;

    /**
     * Reference to the player's state manager
     * @private
     */
    private _playerState!: PlayerState;

    /**
     * Initializes the component and ensures only one instance exists
     */
    init() {
        if (GameRoot._instance) {
            console.error(
                'There can only be one instance of GameRoot Component'
            );
        }
        GameRoot._instance = this;
    }

    /**
     * Registers event handlers when component activates
     */
    onActivate() {
        GlobalEvents.instance.levelCompleted.add(this._onLevelComplete, this);
        GlobalEvents.instance.startGame.add(this._startGame, this);
    }

    /**
     * Removes event handlers when component deactivates
     */
    onDeactivate() {
        GlobalEvents.instance.levelCompleted.remove(this._onLevelComplete);
        GlobalEvents.instance.startGame.remove(this._startGame);
    }

    /**
     * Sets up the game and initializes state managers
     * Validates required properties and prepares the level
     */
    start() {
        if (!this.player) {
            throw new Error(
                'game-root: GameRoot needs a reference to the player Object3D'
            );
        }
        this._gameState = GameState.instance;
        this._levelState = LevelState.instance;
        this._playerState = PlayerState.instance;

        // this._gameState.load(); // TK: For now just always start a new game
        this._levelState.initForCurrentLevel();
    }

    /**
     * Updates the game state each frame
     * Handles player state updates when level is loaded
     * @param dt Delta time in seconds since last update
     */
    update(dt: number) {
        if (!this._levelState.isLoaded) {
            return;
        }
        this._playerState.update(dt);
    }

    /**
     * Handles level completion
     * Saves game state and progresses to the next level
     * @private
     */
    private _onLevelComplete = () => {
        this._gameState.save();

        this.loadNextLevel();
    };

    /**
     * Handles game start event
     * Loads the current level based on game state
     * @private
     */
    private _startGame = () => {
        this.loadLevel(this._gameState.currentLevelId);
    };

    /**
     * Loads a specific level by ID
     * @param levelId The ID of the level to load
     * @private
     */
    private async loadLevel(levelId: string) {
        await MapLoader.instance.loadMap(levelId);
        GlobalEvents.instance.levelReset.dispatch();
    }

    /**
     * Advances to and loads the next level if available
     * Handles end of game scenario if all levels are completed
     * @private
     */
    private async loadNextLevel() {
        if (this._gameState.nextLevel()) {
            await this.loadLevel(this._gameState.currentLevelId);
        } else {
            // Handle end of game (show credits, etc.)
        }
    }
}
