import { globalAudioManager } from '@wonderlandengine/spatial-audio';

/**
 * Enumeration of available sound effects and music tracks
 */
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

/**
 * Audio file paths mapped to their corresponding Sound enum values
 */
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

/**
 * Audio management class for handling game sounds and music
 */
export class AudioManager {
    private static _instance: AudioManager;

    /**
     * Volume level for sound effects (0.0 to 1.0)
     */
    private _volume: number = 1.0;

    /**
     * Volume level for music tracks (0.0 to 1.0)
     */
    private _musicVolume: number = 0.5;

    /**
     * Gets the singleton instance of AudioManager
     * @returns The AudioManager instance
     */
    static get instance(): AudioManager {
        if (!AudioManager._instance) {
            AudioManager._instance = new AudioManager();
        }
        return AudioManager._instance;
    }

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {}

    /**
     * Loads all game sounds and music tracks into memory
     * @returns Promise that resolves when all audio files are loaded
     */
    async loadSounds() {
        await globalAudioManager.loadBatch(...audioFiles);
    }

    /**
     * Starts playing the background music with looping enabled
     */
    playMusic() {
        globalAudioManager.play(Sounds.Music, {
            channel: 1,
            volume: this._musicVolume,
            loop: true,
            priority: true,
        });
    }

    /**
     * Plays a sound effect once
     * @param sound The sound effect to play from the Sounds enum
     */
    playSound(sound: Sounds) {
        globalAudioManager.play(sound, {
            channel: 0,
            volume: this._volume,
            loop: false,
            priority: false,
        });
    }
}
