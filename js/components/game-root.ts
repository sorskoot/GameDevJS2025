import { Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { GameState } from '../classes/GameState.js';
import { LevelState } from '../classes/LevelState.js';
import { GlobalEvents } from '../classes/GlobalEvents.js';
import { PlayerState } from '../classes/PlayerState.js';
import { MapLoader } from './map-loader.js';

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

    init() {
        if (GameRoot._instance) {
            console.error(
                'There can only be one instance of GameRoot Component'
            );
        }
        GameRoot._instance = this;
    }

    onActivate() {
        GlobalEvents.instance.levelCompleted.add(this._onLevelComplete, this);
        GlobalEvents.instance.startGame.add(this._startGame, this);
    }

    onDeactivate() {
        GlobalEvents.instance.levelCompleted.remove(this._onLevelComplete);
        GlobalEvents.instance.startGame.remove(this._startGame);
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
    private _onLevelComplete = () => {
        this._gameState.save();

        this.loadNextLevel();
    };
    private _startGame = () => {
        this.loadLevel(this._gameState.currentLevelId).then(() => {
            this._levelState.reset();
            this._playerState.reset();
        });
    };
    // ...existing code...
    private async loadLevel(levelId: string) {
        await MapLoader.instance.loadMap(levelId);
        this._levelState.reset();
        this._playerState.reset();
    }

    private async loadNextLevel() {
        if (this._gameState.nextLevel()) {
            await this.loadLevel(this._gameState.currentLevelId);
        } else {
            // Handle end of game (show credits, etc.)
        }
    }
}
