import { GIAttribMapBase } from './attrib_classes/GIAttribMapBase';

// longitude latitude in Singapore, NUS
export const LONGLAT = [103.778329, 1.298759];

// some constants
export const XYPLANE: TPlane = [[0, 0, 0], [1, 0, 0], [0, 1, 0]];
export const YZPLANE: TPlane = [[0, 0, 0], [0, 1, 0], [0, 0, 1]];
export const ZXPLANE: TPlane = [[0, 0, 0], [0, 0, 1], [1, 0, 0]];

export const YXPLANE: TPlane = [[0, 0, 0], [0, 1, 0], [1, 0, 0]];
export const ZYPLANE: TPlane = [[0, 0, 0], [0, 0, 1], [0, 1, 0]];
export const XZPLANE: TPlane = [[0, 0, 0], [1, 0, 0], [0, 0, 1]];

// EEntType and an index
export type TEntTypeIdx = [EEntType, number];

// For each entity type, a set of entity indexes
export interface IEntSets {
    ps?: Set<number>;
    pt?: Set<number>;
    pl?: Set<number>;
    pg?: Set<number>;
    co?: Set<number>;
    obj_ps?: Set<number>;
    _v?: Set<number>;
    _t?: Set<number>;
    _e?: Set<number>;
    _w?: Set<number>;
}

// Types
export type TRay = [Txyz, Txyz]; // an origin and a direction vector
export type TPlane = [Txyz, Txyz, Txyz]; // an origin, an x vec and a y vec
export type TBBox = [Txyz, Txyz, Txyz, Txyz]; // an origin, an x vec and a y vec
export type TQuery = string;
export type TId = string;
export type TColor = [number, number, number]; // TODO replace with Txyz
export type TNormal = [number, number, number]; // TODO replace with xyz
export type TTexture = [number, number];

// Types of entities
export enum EEntType {
    POSI,
    VERT,
    TRI,
    EDGE,
    WIRE,
    POINT,
    PLINE,
    PGON,
    COLL,
    MOD
}

// Must match types of entities
export enum EEntTypeStr {
    'ps',
    '_v',
    '_t',
    '_e',
    '_w',
    'pt',
    'pl',
    'pg',
    'co',
    'mo'
}

// Must match types of entities
// Must also match interface IGeomMaps
export enum EEntStrToGeomMaps {
    'up_posis_verts', // 'posis',
    'dn_verts_posis',
    'dn_tris_verts',
    'dn_edges_verts',
    'dn_wires_edges',
    'dn_points_verts',
    'dn_plines_wires',
    'dn_pgons_wires',
    'colls'
}

/**
 * Attribute maps
 */

export interface IAttribsMaps {
    ps: Map<string, GIAttribMapBase>;
    _v: Map<string, GIAttribMapBase>;
    _e: Map<string, GIAttribMapBase>;
    _w: Map<string, GIAttribMapBase>;
    pt: Map<string, GIAttribMapBase>;
    pl: Map<string, GIAttribMapBase>;
    pg: Map<string, GIAttribMapBase>;
    co: Map<string, GIAttribMapBase>;
    mo: Map<string, any>;
}

// Names of attributes
export enum EAttribNames {
    COORDS =  'xyz',
    NORMAL =  'normal',
    COLOR =   'rgb',
    TEXTURE = 'uv',
    NAME = 'name',
    MATERIAL = 'material',
    VISIBILITY = 'visibility',
    LABEL = 'label',
    TIMESTAMP = '_ts',
    COLL_NAME = 'name',
    COLL_PARENT = '_coll_parent',
    COLL_CHILDS = '_coll_childs',
    COLL_POINTS = '_coll_points',
    COLL_PLINES = '_coll_plines',
    COLL_PGONS = '_coll_pgons',
}

// Wire Type
export enum EWireType {
    PLINE =  'pline',
    PGON =  'pgon',
    PGON_HOLE =   'pgon_hole'
}

// The types of operators that can be used in a filter.
export enum EFilterOperatorTypes {
    IS_EQUAL = '==',
    IS_NOT_EQUAL = '!=',
    IS_GREATER_OR_EQUAL = '>=',
    IS_LESS_OR_EQUAL = '<=',
    IS_GREATER = '>',
    IS_LESS = '<',
    EQUAL = '='
}

export enum ESort {
    DESCENDING = 'descending',
    ASCENDING = 'ascending'
}

export enum EAttribPush {
    AVERAGE,
    MEDIAN,
    SUM,
    MIN,
    MAX,
    FIRST,
    LAST
}

// enums
export enum EAttribDataTypeStrs {
    // INT = 'Int',
    NUMBER = 'number',
    STRING = 'string',
    BOOLEAN = 'boolean',
    LIST = 'list', // a list of anything
    DICT = 'dict' // an object
}

// types
export type Txy = [number, number]; // north direction
export type Txyz = [number, number, number]; // in use
export type TPosi = number;
export type TTri = [number, number, number]; // [position, position, position]
export type TVert = number; // positions
export type TEdge = [number, number]; // [vertex, vertex]
export type TWire = number[]; // [edge, edge,....]
export type TPgonTri = number[]; // [triangle, ...]
export type TPoint = number; // vertex
export type TPline = number; // wire
export type TPgon = number[]; // [wire,....]
export type TColl = [number, number[], number[], number[]]; // [parent, [point, ...], [polyline, ...], [polygon, ....]]
export type TEntity = TTri | TVert | TEdge | TWire | TPoint | TPline | TPgon | TColl;
export type TAttribDataTypes = string | number | boolean | any[] | object;


export const RE_SPACES: RegExp = /\s+/g;

/**
 * Geom arrays
 */
export interface IGeomMaps {
    // down
    dn_verts_posis: Map<number, TVert>; // one to many
    dn_tris_verts: Map<number, TTri>; // one to three
    dn_edges_verts: Map<number, TEdge>; // one to two
    dn_wires_edges: Map<number, TWire>; // one to many
    dn_points_verts: Map<number, TPoint>;
    dn_plines_wires: Map<number, TPline>;
    dn_pgons_tris: Map<number, TPgonTri>; // one to many
    dn_pgons_wires: Map<number, TPgon>; // one to many
    // up
    up_posis_verts: Map<number, number[]>; // one to many
    up_tris_pgons: Map<number, number>;
    up_verts_edges: Map<number, number[]>; // one to two (or one)
    up_verts_tris: Map<number, number[]>; // one to many
    up_edges_wires: Map<number, number>;
    up_verts_points: Map<number, number>;
    up_wires_plines: Map<number, number>;
    up_wires_pgons: Map<number, number>;
    // colls
    colls: Set<number>;
}

// copy geometry
export interface IGeomCopy {
    points: number[];
    plines: number[];
    pgons: number[];
    colls: number[];
}

// note the names of the keys must match EAttribDataTypeStrs
export interface IAttribValues {
    number: [number[], Map<string, number>];
    string: [string[], Map<string, number>];
    list:   [any[],    Map<string, number>];
    dict:   [object[], Map<string, number>];
}

export interface IMetaData {
    // timestamp: number;
    posi_count: number;
    vert_count: number;
    tri_count: number;
    edge_count: number;
    wire_count: number;
    point_count: number;
    pline_count: number;
    pgon_count: number;
    coll_count: number;
    attrib_values: IAttribValues;
}

// data in a snapshot
export interface ISnapshotData {
    ps: Set<number>;
    pt: Set<number>;
    pl: Set<number>;
    pg: Set<number>;
    co: Set<number>;
}

// ================================================================================================
// JSON MODEL DATA
// ================================================================================================

export interface IModelJSONData {
    geometry: IGeomJSONData;
    attributes: IAttribsJSONData;
}

export interface IGeomJSONData {
    posis_i: number[];
    verts: TVert[];
    verts_i: number[];
    tris: TTri[];
    tris_i: number[];
    edges: TEdge[];
    edges_i: number[];
    wires: TWire[];
    wires_i: number[];
    points: TPoint[];
    points_i: number[];
    plines: TPline[];
    plines_i: number[];
    pgons: TPgon[];
    pgontris: TPgonTri[];
    pgons_i: number[];
    colls_i: number[];
    selected: TEntTypeIdx[];
}
export interface IAttribJSONData {
    name: string;
    data_type: EAttribDataTypeStrs;
    data: TEntAttribValuesArr;
}
export interface IAttribsJSONData {
    posis: IAttribJSONData[];
    verts: IAttribJSONData[];
    edges: IAttribJSONData[];
    wires: IAttribJSONData[];
    points: IAttribJSONData[];
    plines: IAttribJSONData[];
    pgons: IAttribJSONData[];
    colls: IAttribJSONData[];
    model: TModelAttribValuesArr;
}

export type TEntAttribValuesArr = Array<[TAttribDataTypes, number[]]>;
export type TModelAttribValuesArr = Array<[string, TAttribDataTypes]>;
