export class GameState {
    private static _instance: GameState;

    static get instance(): GameState {
        if (!GameState._instance) {
            GameState._instance = new GameState();
        }
        return GameState._instance;
    }

    private constructor() {}
}
