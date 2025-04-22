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

    private constructor() {
        this._unlockedLevels = new Set<string>();
        this._settings = {};
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
     * Load game state from persistent storage.
     */
    load(): void {
        // TODO: Implement loading from localStorage or file
    }

    /**
     * Save game state to persistent storage.
     */
    save(): void {
        // TODO: Implement saving to localStorage or file
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
}
