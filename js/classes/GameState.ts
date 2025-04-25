import { AudioManager } from './AudioManager.js';
import { GlobalEvents } from './GlobalEvents.js';

export class GameState {
    private static _instance: GameState;

    /**
     * Set of unlocked level IDs.
     */
    private _unlockedLevels: Set<string>;

    /**
     * Game settings object.
     */
    private _settings: Record<string, unknown>;

    static get instance(): GameState {
        if (!GameState._instance) {
            GameState._instance = new GameState();
        }
        return GameState._instance;
    }
    //'test',
    private _levels: string[] = [
        //   'level1',
        'level2',
        'level3',
        'level4',
        'level5',
        'level6',
        'level7',
        // 'level8',
    ];
    private _currentLevelIndex: number = 0;
    private _inProgress: boolean = false; // Flag to indicate if the game is in progress

    private constructor() {
        this._unlockedLevels = new Set<string>();
        this._settings = {};

        GlobalEvents.instance.levelReset.add(this._resetProgress, this);
        AudioManager.instance.loadSounds().catch((e) => {
            console.error('Error loading sounds:', e);
        });
    }

    /**
     * Get unlocked levels.
     */
    get unlockedLevels(): Set<string> {
        return this._unlockedLevels;
    }

    /**
     * Get settings object.
     */
    get settings(): Record<string, unknown> {
        return this._settings;
    }
    /**
     * Get the current level ID.
     */
    get currentLevelId(): string {
        return this._levels[this._currentLevelIndex];
    }

    get inProgress(): boolean {
        return this._inProgress;
    }

    /**
     * Load game state from persistent storage.
     */
    load(): void {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this._unlockedLevels = new Set(state.unlockedLevels);
            this._settings = state.settings;
            this._currentLevelIndex = state.currentLevelIndex;
            this._inProgress = state.inProgress;
        }
    }

    /**
     * Save game state to persistent storage.
     */
    save(): void {
        const state = {
            unlockedLevels: Array.from(this._unlockedLevels),
            settings: this._settings,
            currentLevelIndex: this._currentLevelIndex,
            inProgress: this._inProgress,
        };
        localStorage.setItem('gameState', JSON.stringify(state));
    }

    /**
     * Reset game state to defaults.
     */
    reset(): void {
        this._unlockedLevels.clear();
        this._settings = {};
    }

    /**
     * Unlock a level by ID.
     */
    unlockLevel(levelId: string): void {
        this._unlockedLevels.add(levelId);
    }

    /**
     * Update a setting.
     */
    updateSetting(key: string, value: unknown): void {
        this._settings[key] = value;
    }

    nextLevel(): boolean {
        if (this._currentLevelIndex < this._levels.length - 1) {
            this._currentLevelIndex++;
            return true;
        }
        return false;
    }

    resetProgress(): void {
        this._currentLevelIndex = 0;
    }

    startGame() {
        AudioManager.instance.playMusic();
        GlobalEvents.instance.startGame.dispatch();
        this._resetProgress();
    }

    private _resetProgress() {
        this._inProgress = true;
    }
}
