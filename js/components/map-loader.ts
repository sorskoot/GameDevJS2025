import { Component, Object3D } from '@wonderlandengine/api';
import { property } from '@wonderlandengine/api/decorators.js';
import { TiledMap } from '../types/tiled-map.js'; // Import the interface
import { vec3 } from 'gl-matrix'; // Import vec3
import { GlobalEvents } from '../classes/GlobalEvents.js';
import { wlUtils } from '@sorskoot/wonderland-components';

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

    private _whiteBlocks: Object3D[] = []; // Array to store white blocks
    private _blackBlocks: Object3D[] = []; // Array to store black blocks

    start() {
        // Validate required properties
        if (!this.tile || !this.tileWhite || !this.tileBlack) {
            throw new Error(
                'MapLoader: Missing required property "tile", "tileWhite", or "tileBlack".'
            );
        }

        setTimeout(() => {
            this.loadMap('test')
                .then(() => {
                    console.log('Map loaded successfully!');
                })
                .catch((error) => {
                    console.error('Error loading map:', error);
                });
        }, 2000);

        GlobalEvents.instance.SwitchDimension.add(
            this._onSwitchDimension,
            this
        );
        this._isLight = true;
        this.engine.scene.clearColor = [0, 0, 0, 1];
    }

    async loadMap(mapName: string): Promise<void> {
        const rawData = await fetch(`maps/${mapName}.json`);
        const data: TiledMap = await rawData.json();

        const layer = data.layers[0];
        // Ensure it's a tile layer and has data
        if (!layer || layer.type !== 'tilelayer' || !layer.data) {
            console.error('MapLoader: First layer is not a valid tile layer.');
            return;
        }

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
                    if (
                        obj.name &&
                        (obj.name.toLowerCase().includes('start') ||
                            obj.name.toLowerCase().includes('spawn') ||
                            obj.name.toLowerCase().includes('player'))
                    ) {
                        if (
                            typeof obj.x === 'number' &&
                            typeof obj.y === 'number'
                        ) {
                            // Convert from Tiled coordinates to world coordinates
                            const startPos = [
                                (obj.x - 16) * TILE_SCALE,
                                -(obj.y - 16) * TILE_SCALE,
                                0,
                            ];

                            // Trigger teleport event
                            GlobalEvents.instance.TeleportPlayer.dispatch(
                                startPos
                            );

                            break;
                        }
                    }
                }
            }
        }

        // Optionally hide the original template tile
        this.tile.active = false;
    }

    _isLight: boolean = true;
    private _onSwitchDimension() {
        if (this._isLight) {
            this._isLight = false;
            this.engine.scene.clearColor = [1, 1, 1, 1];
        } else {
            this._isLight = true;
            this.engine.scene.clearColor = [0, 0, 0, 1];
        }

        this._updateLightState();
    }

    private _updateLightState() {
        if (this._isLight) {
            this._blackBlocks.forEach((block) => {
                wlUtils.setActive(block, false);
            });
            this._whiteBlocks.forEach((block) => {
                wlUtils.setActive(block, true);
            });
        } else {
            this._blackBlocks.forEach((block) => {
                wlUtils.setActive(block, true);
            });
            this._whiteBlocks.forEach((block) => {
                wlUtils.setActive(block, false);
            });
        }
    }
}
