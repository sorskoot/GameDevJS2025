import { globalAudioManager } from '@wonderlandengine/spatial-audio';

export enum Sounds {
    Bump,
    Die,
    Jump,
    Land,
    LevelComplete,
    Switch,
    Alarm,
    Button,

    Music = 1000,
}

const folder = 'sfx/';
const audioFiles: [string | string[], Sounds][] = [
    [folder + 'bump.wav', Sounds.Bump],
    [folder + 'die.wav', Sounds.Die],
    [folder + 'jump.wav', Sounds.Jump],
    [folder + 'land.wav', Sounds.Land],
    [folder + 'levelcomplete.wav', Sounds.LevelComplete],
    [folder + 'switch.wav', Sounds.Switch],
    [folder + 'alarm.wav', Sounds.Alarm],
    [folder + 'button.wav', Sounds.Button],
    ['music/fragment-of-tomorrow-192.mp3', Sounds.Music],
];

export class AudioManager {
    private static _instance: AudioManager;
    private _volume: number = 1.0;
    private _musicVolume: number = 0.5;

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

    playMusic() {
        globalAudioManager.play(Sounds.Music, {
            channel: 1,
            volume: this._musicVolume,
            loop: true,
            priority: true,
        });
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
