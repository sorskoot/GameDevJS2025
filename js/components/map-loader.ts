import { Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { TiledMap } from '../types/tiled-map.js'; // Import the interface
import { vec3 } from 'gl-matrix'; // Import vec3
import { GlobalEvents } from '../classes/GlobalEvents.js';
import { wlUtils } from '@sorskoot/wonderland-components';
import { LevelState } from '../classes/LevelState.js';

// Reusable vector for position calculations
const tilePosition = vec3.create();
// Scale factor from Tiled pixels to Wonderland meters
const TILE_SCALE = 1 / 16;

export class MapLoader extends Component {
    static TypeName = 'map-loader';

    @property.object({ required: true })
    tile!: Object3D;
    @property.object({ required: true })
    tileWhite!: Object3D;
    @property.object({ required: true })
    tileBlack!: Object3D;

    @property.object({ required: true })
    tileRed!: Object3D;

    @property.object({ required: true })
    target!: Object3D;

    private _whiteBlocks: Object3D[] = []; // Array to store white blocks
    private _blackBlocks: Object3D[] = []; // Array to store black blocks
    private _startPos: number[];

    private static _instance: MapLoader;
    static get instance(): MapLoader {
        return MapLoader._instance;
    }

    init() {
        if (MapLoader._instance) {
            console.error(
                'There can only be one instance of MapLoader Component'
            );
        }
        MapLoader._instance = this;
    }

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

        this._isLight = true;
        this.engine.scene.clearColor = [0, 0, 0, 1];
    }

    private _onPlayerDied() {
        this._isLight = true;
        this._updateLightState();
        GlobalEvents.instance.teleportPlayer.dispatch(this._startPos);
    }

    async loadMap(mapName: string): Promise<void> {
        this._reset();
        const rawData = await fetch(`maps/${mapName}.json`);
        const data: TiledMap = await rawData.json();

        const layer = data.layers[0];
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
                    case 1:
                        newTile = this.tileBlack.clone(this.object);
                        this._blackBlocks.push(newTile);
                        break;
                    case 2:
                        newTile = this.tileWhite.clone(this.object);
                        this._whiteBlocks.push(newTile);
                        break;
                    case 3:
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
                    if (obj.name && obj.name.toLowerCase().includes('start')) {
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
                                obj.x * TILE_SCALE,
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
        const borderThickness = 6;

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

    _isLight: boolean = true;
    private _onSwitchDimension() {
        this._isLight = !this._isLight;
        this._updateLightState();
    }

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
