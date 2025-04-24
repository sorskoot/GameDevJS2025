import { AudioManager, Sounds } from '../../classes/AudioManager.js';
import { GameState } from '../../classes/GameState.js';

export function startGame() {
    AudioManager.instance.playSound(Sounds.Button);
    GameState.instance.startGame();
}
