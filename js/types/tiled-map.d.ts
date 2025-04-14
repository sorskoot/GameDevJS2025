/**
 * Represents an object within an object layer in a Tiled map.
 */
export interface TiledObjectData {
    height: number;
    id: number;
    name: string;
    point: boolean;
    rotation: number;
    type: string;
    visible: boolean;
    width: number;
    x: number;
    y: number;
}

/**
 * Represents a layer in a Tiled map. Can be a tile layer or an object group.
 */
export interface TiledLayer {
    data?: number[]; // Only for tile layers
    height: number;
    id: number;
    name: string;
    opacity: number;
    type: 'tilelayer' | 'objectgroup'; // Add other types if needed
    visible: boolean;
    width: number;
    x: number;
    y: number;
    draworder?: string; // Only for object groups
    objects?: TiledObjectData[]; // Only for object groups
}

/**
 * Represents a reference to a tileset used in the Tiled map.
 */
export interface TiledTileset {
    firstgid: number;
    source: string; // Path to the .tsx file
}

/**
 * Represents the structure of a Tiled map JSON file.
 */
export interface TiledMap {
    backgroundcolor: string;
    compressionlevel: number;
    height: number; // Map height in tiles
    infinite: boolean;
    layers: TiledLayer[];
    nextlayerid: number;
    nextobjectid: number;
    orientation: 'orthogonal' | 'isometric' | 'staggered' | 'hexagonal';
    renderorder: 'right-down' | 'right-up' | 'left-down' | 'left-up';
    tiledversion: string;
    tileheight: number; // Height of a tile in pixels
    tilesets: TiledTileset[];
    tilewidth: number; // Width of a tile in pixels
    type: 'map';
    version: string; // The JSON format version
    width: number; // Map width in tiles
}
