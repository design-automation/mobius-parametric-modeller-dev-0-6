import { EAttribDataTypeStrs, EAttribNames, EEntType, IAttribsMaps, TAttribDataTypes } from './common';
import { GIModelData } from './GIModelData';

/**
 * Class for attribute snapshot.
 */
export class GIAttribsSnapshot {
    private modeldata: GIModelData;
   /**
     * Creates an object to store the attribute data.
     * @param modeldata The JSON data
     */
    constructor(modeldata: GIModelData) {
        this.modeldata = modeldata;
    }
    // ============================================================================
    // Start
    // ============================================================================
    /**
     *
     * @param ssid
     * @param include
     */
    public init(ssid: number, include?: number[]): void {
        /// create new attribs maps for snapshot
        const attribs: IAttribsMaps = {
                ps: new Map(),
                _v: new Map(),
                _e: new Map(),
                _w: new Map(),
                _f: new Map(),
                pt: new Map(),
                pl: new Map(),
                pg: new Map(),
                co: new Map(),
                mo: new Map()
        };
        this.modeldata.attribs.attribs_maps.set(ssid, attribs);
        // add attributes
        this.modeldata.attribs.add.addAttrib(EEntType.POSI, EAttribNames.COORDS, EAttribDataTypeStrs.LIST);
        this.modeldata.attribs.add.addAttrib(EEntType.POINT, EAttribNames.TIMESTAMP, EAttribDataTypeStrs.NUMBER);
        this.modeldata.attribs.add.addAttrib(EEntType.PLINE, EAttribNames.TIMESTAMP, EAttribDataTypeStrs.NUMBER);
        this.modeldata.attribs.add.addAttrib(EEntType.PGON, EAttribNames.TIMESTAMP, EAttribDataTypeStrs.NUMBER);
        this.modeldata.attribs.add.addAttrib(EEntType.COLL, EAttribNames.COLL_PARENT, EAttribDataTypeStrs.NUMBER);
        this.modeldata.attribs.add.addAttrib(EEntType.COLL, EAttribNames.COLL_CHILDS, EAttribDataTypeStrs.LIST);
        this.modeldata.attribs.add.addAttrib(EEntType.COLL, EAttribNames.COLL_POINTS, EAttribDataTypeStrs.LIST);
        this.modeldata.attribs.add.addAttrib(EEntType.COLL, EAttribNames.COLL_PLINES, EAttribDataTypeStrs.LIST);
        this.modeldata.attribs.add.addAttrib(EEntType.COLL, EAttribNames.COLL_PGONS, EAttribDataTypeStrs.LIST);
        // merge data
        if (include !== undefined) {
            for (const exist_ssid of include) {
                const exist_attribs: IAttribsMaps = this.modeldata.attribs.attribs_maps.get(exist_ssid);
                this.modeldata.attribs.io.merge(ssid, exist_attribs);
            }
        }
    }
}