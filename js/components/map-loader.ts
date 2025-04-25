import { Component, Object3D, TextComponent } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { TiledMap } from '../types/tiled-map.js'; // Import the interface
import { vec3 } from 'gl-matrix'; // Import vec3
import { GlobalEvents } from '../classes/GlobalEvents.js';
import { wlUtils } from '@sorskoot/wonderland-components';
import { LevelState } from '../classes/LevelState.js';
import { TutorialText } from './tutorial-text.js';

/**
 * Reusable vector for position calculations to avoid garbage collection
 */
const tilePosition = vec3.create();

/**
 * Scale factor from Tiled pixels to Wonderland meters
 */
const TILE_SCALE = 1 / 16;

/**
 * Configuration constants for map building
 */
const BORDER_THICKNESS = 6;
const TILE_LAYER_INDEX = 0;
const TILE_ID_BLACK = 1;
const TILE_ID_WHITE = 2;
const TILE_ID_RED = 3;

/**
 * Component responsible for loading and rendering tile-based maps from Tiled JSON files
 * Handles creation of level geometry and manages dimension switching visibility
 */
export class MapLoader extends Component {
    static TypeName = 'map-loader';

    /**
     * Template for generic level tiles
     */
    @property.object({ required: true })
    tile!: Object3D;

    /**
     * Template for white dimension tiles
     */
    @property.object({ required: true })
    tileWhite!: Object3D;

    /**
     * Template for black dimension tiles
     */
    @property.object({ required: true })
    tileBlack!: Object3D;

    /**
     * Template for special red tiles
     */
    @property.object({ required: true })
    tileRed!: Object3D;

    /**
     * The level end target object
     */
    @property.object({ required: true })
    target!: Object3D;

    /**
     * Template for tutorial text objects
     */
    @property.object({ required: true })
    tutorialTextObject!: Object3D;

    /**
     * Collection of white blocks for dimension switching
     * @private
     */
    private _whiteBlocks: Object3D[] = [];

    /**
     * Collection of black blocks for dimension switching
     * @private
     */
    private _blackBlocks: Object3D[] = [];

    /**
     * Player start position in the level [x, y, z]
     * @private
     */
    private _startPos: number[] = [0, 0, 0];

    /**
     * Current dimension state (true = light, false = dark)
     * @private
     */
    private _isLight: boolean = true;

    /**
     * Singleton instance of MapLoader
     * @private
     */
    private static _instance: MapLoader;

    /**
     * Gets the singleton instance of MapLoader
     * @returns The MapLoader instance
     */
    static get instance(): MapLoader {
        return MapLoader._instance;
    }

    /**
     * Initializes the component and ensures only one instance exists
     */
    init() {
        if (MapLoader._instance) {
            console.error(
                'There can only be one instance of MapLoader Component'
            );
        }
        MapLoader._instance = this;
    }

    /**
     * Sets up the map loader and validates required properties
     * Registers event handlers for dimension switching and player events
     */
    start() {
        // Validate required properties
        if (!this.tile || !this.tileWhite || !this.tileBlack) {
            throw new Error(
                'MapLoader: Missing required property "tile", "tileWhite", or "tileBlack".'
            );
        }

        GlobalEvents.instance.switchDimension.add(
            this._onSwitchDimension,
            this
        );

        GlobalEvents.instance.playerDied.add(this._onPlayerDied, this);
        GlobalEvents.instance.levelReset.add(this._levelReset, this);

        this._isLight = true;
        this.engine.scene.clearColor = [0, 0, 0, 1];
    }

    /**
     * Handles player death event
     * Resets dimension to light and teleports player back to start
     * @private
     */
    private _onPlayerDied() {
        this._isLight = true;
        this._updateLightState();
        GlobalEvents.instance.teleportPlayer.dispatch(this._startPos);
    }

    /**
     * Loads a map from a Tiled JSON file and constructs the level
     * Creates all tiles, finds player start/end positions, and sets up tutorial text
     * @param mapName The name of the map file to load (without extension)
     * @returns Promise that resolves when map is fully loaded
     */
    async loadMap(mapName: string): Promise<void> {
        this._reset();
        const rawData = await fetch(`maps/${mapName}.json`);
        const data: TiledMap = await rawData.json();

        const layer = data.layers[TILE_LAYER_INDEX];
        // Ensure it's a tile layer and has data
        if (!layer || layer.type !== 'tilelayer' || !layer.data) {
            console.error('MapLoader: First layer is not a valid tile layer.');
            return;
        }
        const mapHeight = data.height;
        const mapWidth = data.width;
        const tileWidth = data.tilewidth * TILE_SCALE;
        const tileHeight = data.tileheight * TILE_SCALE;

        for (let i = 0; i < layer.data.length; ++i) {
            const tileId = layer.data[i];
            if (tileId !== 0) {
                // Calculate tile position in the grid
                const x = i % mapWidth;
                const y = Math.floor(i / mapWidth);

                // Calculate world position
                // Tiled Y is top-down, Wonderland Y is bottom-up, hence -y
                vec3.set(tilePosition, x * tileWidth, -y * tileHeight, 0);

                let newTile: Object3D;
                switch (tileId) {
                    case TILE_ID_BLACK:
                        newTile = this.tileBlack.clone(this.object);
                        this._blackBlocks.push(newTile);
                        break;
                    case TILE_ID_WHITE:
                        newTile = this.tileWhite.clone(this.object);
                        this._whiteBlocks.push(newTile);
                        break;
                    case TILE_ID_RED:
                        newTile = this.tileRed.clone(this.object);
                        break;
                    // Clone the template tile
                    default:
                        newTile = this.tile.clone(this.object);
                }

                newTile.resetPositionRotation();
                // Set the calculated world position
                newTile.setPositionWorld(tilePosition);

                // TODO: Potentially set different mesh/material based on tileId
            }
        }
        this._updateLightState();
        // Find player start position and teleport player
        for (const layer of data.layers) {
            if (layer.type === 'objectgroup' && layer.objects) {
                for (const obj of layer.objects) {
                    if (obj.type == 'Text') {
                        const text = this.tutorialTextObject.clone(this.object);
                        const textComponent = text.getComponent(TutorialText)!;
                        textComponent.setText(obj.name);
                        text.resetPositionRotation();
                        text.setPositionWorld([
                            (obj.x - 8) * TILE_SCALE,
                            -(obj.y - 16) * TILE_SCALE,
                            0,
                        ]);
                    } else if (
                        obj.name &&
                        obj.name.toLowerCase().includes('start')
                    ) {
                        if (
                            typeof obj.x === 'number' &&
                            typeof obj.y === 'number'
                        ) {
                            // Convert from Tiled coordinates to world coordinates
                            this._startPos = [
                                (obj.x - 16) * TILE_SCALE,
                                -(obj.y - 16) * TILE_SCALE,
                                0,
                            ];

                            // Trigger teleport event
                            GlobalEvents.instance.teleportPlayer.dispatch(
                                this._startPos
                            );
                        }
                    }
                    if (obj.name && obj.name.toLowerCase().includes('end')) {
                        if (
                            typeof obj.x === 'number' &&
                            typeof obj.y === 'number'
                        ) {
                            // Convert from Tiled coordinates to world coordinates
                            const pos = [
                                (obj.x - 16) * TILE_SCALE,
                                -(obj.y - 16) * TILE_SCALE,
                                0,
                            ];
                            this.target.resetPositionRotation();
                            this.target.setPositionWorld(pos);
                        }
                    }
                }
            }
        }

        // Calculate border positions and add tiles
        const borderThickness = BORDER_THICKNESS;

        // Top and bottom borders
        for (let y = 0; y < borderThickness; ++y) {
            for (
                let x = -borderThickness;
                x < mapWidth + borderThickness;
                ++x
            ) {
                // Top border
                vec3.set(tilePosition, x * tileWidth, -y * tileHeight, 0);
                const topTile = this.tile.clone(this.object);
                topTile.resetPositionRotation();
                topTile.setPositionWorld(tilePosition);

                // Bottom border
                vec3.set(
                    tilePosition,
                    x * tileWidth,
                    -(mapHeight - 1 + borderThickness - y) * tileHeight,
                    0
                );
                const bottomTile = this.tile.clone(this.object);
                bottomTile.resetPositionRotation();
                bottomTile.setPositionWorld(tilePosition);
            }
        }

        // Left and right borders
        for (let y = 0; y < mapHeight; ++y) {
            for (let x = 0; x < borderThickness; ++x) {
                // Left border
                vec3.set(
                    tilePosition,
                    -(borderThickness - x) * tileWidth,
                    -y * tileHeight,
                    0
                );
                const leftTile = this.tile.clone(this.object);
                leftTile.resetPositionRotation();
                leftTile.setPositionWorld(tilePosition);

                // Right border
                vec3.set(
                    tilePosition,
                    (mapWidth + x) * tileWidth,
                    -y * tileHeight,
                    0
                );
                const rightTile = this.tile.clone(this.object);
                rightTile.resetPositionRotation();
                rightTile.setPositionWorld(tilePosition);
            }
        }

        // Optionally hide the original template tile
        this.tile.active = false;
        LevelState.instance.setMapLoaded();
    }

    /**
     * Handles dimension switching event
     * Toggles between light and dark dimensions
     * @private
     */
    private _onSwitchDimension() {
        this._isLight = !this._isLight;
        this._updateLightState();
    }

    /**
     * Handles level reset event
     * Returns to light dimension
     * @private
     */
    private _levelReset() {
        this._isLight = true;
        this._updateLightState();
    }

    /**
     * Updates visibility of blocks based on current dimension
     * Shows/hides blocks and changes background color
     * @private
     */
    private _updateLightState() {
        if (this._isLight) {
            this.engine.scene.clearColor = [0, 0, 0, 1];
            this._blackBlocks.forEach((block) => {
                wlUtils.setActive(block, false);
            });
            this._whiteBlocks.forEach((block) => {
                wlUtils.setActive(block, true);
            });
        } else {
            this.engine.scene.clearColor = [1, 1, 1, 1];
            this._blackBlocks.forEach((block) => {
                wlUtils.setActive(block, true);
            });
            this._whiteBlocks.forEach((block) => {
                wlUtils.setActive(block, false);
            });
        }
    }

    /**
     * Clears all existing blocks and resets the map state
     * Called before loading a new map
     * @private
     */
    private _reset() {
        if (this.object.children.length > 0) {
            this.object.children.forEach((child) => {
                child.destroy();
            });
        }
        this._blackBlocks = [];
        this._whiteBlocks = [];
    }
}
