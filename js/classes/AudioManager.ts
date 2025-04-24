import { globalAudioManager } from '@wonderlandengine/spatial-audio';

export enum Sounds {
    Bump,
    Die,
    Jump,
    Land,
    LevelComplete,
    Switch,
}

const folder = 'sfx/';
const audioFiles: [string | string[], Sounds][] = [
    [folder + 'bump.wav', Sounds.Bump],
    [folder + 'die.wav', Sounds.Die],
    [folder + 'jump.wav', Sounds.Jump],
    [folder + 'land.wav', Sounds.Land],
    [folder + 'levelcomplete.wav', Sounds.LevelComplete],
    [folder + 'switch.wav', Sounds.Switch],
];

export class AudioManager {
    private static _instance: AudioManager;
    private _volume: number = 1.0;

    static get instance(): AudioManager {
        if (!AudioManager._instance) {
            AudioManager._instance = new AudioManager();
        }
        return AudioManager._instance;
    }

    private constructor() {}

    async loadSounds() {
        await globalAudioManager.loadBatch(...audioFiles);
    }

    playSound(sound: Sounds) {
        globalAudioManager.play(sound, {
            channel: 0,
            volume: this._volume,
            loop: false,
            priority: false,
        });
    }
}
