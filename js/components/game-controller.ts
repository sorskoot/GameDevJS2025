import { Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { GameState } from '../classes/GameState.js';
import { LevelState } from '../classes/LevelState.js';
import { GlobalEvents } from '../classes/GlobalEvents.js';
import { PlayerState } from '../classes/PlayerState.js';

export class GameRoot extends Component {
    static TypeName = 'game-root';

    /**
     * Reference to the player object (required)
     */
    @property.object({ required: true })
    player!: Object3D;

    // Singleton
    private static _instance: GameRoot;
    static get instance(): GameRoot {
        return GameRoot._instance;
    }

    // Example: cached state references (uncomment when implemented)
    private _gameState: GameState;
    private _levelState: LevelState;
    private _playerState: PlayerState;
    // Example: event handler arrow functions
    private _onLevelComplete = () => {
        this._gameState.save();

        this.loadNextLevel();
    };

    private _onCheckpointReached = () => {};

    init() {
        if (GameRoot._instance) {
            console.error(
                'There can only be one instance of GameRoot Component'
            );
        }
        GameRoot._instance = this;
    }

    onActivate() {
        // Example: Add event listeners (uncomment when event system is available)
        // GlobalEvents.on('levelComplete', this._onLevelComplete);
        // GlobalEvents.on('checkpoint', this._onCheckpointReached);
    }

    onDeactivate() {
        // Example: Remove event listeners
        // GlobalEvents.off('levelComplete', this._onLevelComplete);
        // GlobalEvents.off('checkpoint', this._onCheckpointReached);
    }

    start() {
        if (!this.player) {
            throw new Error(
                'game-root: GameRoot needs a reference to the player Object3D'
            );
        }
        this._gameState = GameState.instance;
        this._levelState = LevelState.instance;
        this._playerState = PlayerState.instance;
        this._gameState.load();
        this._levelState.initForCurrentLevel();
    }

    update(dt: number) {
        if (!this._levelState.isLoaded) {
            return;
        }
        // Main game loop logic, e.g.:
        // this._levelState.update(dt);
        // this._gameState.update(dt);
        this._playerState.update(dt);
    }

    // Example: method to load next level
    private loadNextLevel() {
        // Implement level loading logic
    }
}
