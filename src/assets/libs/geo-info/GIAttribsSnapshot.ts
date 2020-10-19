import { EAttribDataTypeStrs, EAttribNames, EEntType, EEntTypeStr, IAttribsMaps, TAttribDataTypes, TEntTypeIdx } from './common';
import { GIAttribMapBase } from './GIAttribMapBase';
import { GIAttribMapList } from './GIAttribMapList';
import { GIAttribMapNum } from './GIAttribMapNum';
import { GIAttribMapStr } from './GIAttribMapStr';
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
    public addSnapshot(ssid: number, include?: number[]): void {
        // create new attribs maps for snapshot
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
        // add attributes for built in types
        attribs.ps.set(EAttribNames.COORDS, new GIAttribMapList(this.modeldata, EAttribNames.COORDS, EEntType.POSI, EAttribDataTypeStrs.LIST));
        attribs._v.set(EAttribNames.COLOR, new GIAttribMapList(this.modeldata, EAttribNames.COLOR, EEntType.VERT, EAttribDataTypeStrs.LIST));
        attribs._v.set(EAttribNames.NORMAL, new GIAttribMapList(this.modeldata, EAttribNames.NORMAL, EEntType.VERT, EAttribDataTypeStrs.LIST));
        // this.modeldata.attribs.add.addAttribActive(EEntType.POSI, EAttribNames.COORDS, EAttribDataTypeStrs.LIST);
        // this.modeldata.attribs.add.addAttribActive(EEntType.VERT, EAttribNames.COLOR, EAttribDataTypeStrs.LIST);
        // this.modeldata.attribs.add.addAttribActive(EEntType.VERT, EAttribNames.NORMAL, EAttribDataTypeStrs.LIST);
        // add attributes for time stamps
        attribs.pt.set(EAttribNames.TIMESTAMP, new GIAttribMapNum(this.modeldata, EAttribNames.TIMESTAMP, EEntType.POINT, EAttribDataTypeStrs.NUMBER));
        attribs.pl.set(EAttribNames.TIMESTAMP, new GIAttribMapNum(this.modeldata, EAttribNames.TIMESTAMP, EEntType.PLINE, EAttribDataTypeStrs.NUMBER));
        attribs.pg.set(EAttribNames.TIMESTAMP, new GIAttribMapNum(this.modeldata, EAttribNames.TIMESTAMP, EEntType.PGON, EAttribDataTypeStrs.NUMBER));
        // this.modeldata.attribs.add.addAttribActive(EEntType.POINT, EAttribNames.TIMESTAMP, EAttribDataTypeStrs.NUMBER);
        // this.modeldata.attribs.add.addAttribActive(EEntType.PLINE, EAttribNames.TIMESTAMP, EAttribDataTypeStrs.NUMBER);
        // this.modeldata.attribs.add.addAttribActive(EEntType.PGON, EAttribNames.TIMESTAMP, EAttribDataTypeStrs.NUMBER);
        // add attributes for collections
        attribs.co.set(EAttribNames.COLL_NAME, new GIAttribMapStr(this.modeldata, EAttribNames.COLL_NAME, EEntType.COLL, EAttribDataTypeStrs.STRING));
        attribs.co.set(EAttribNames.COLL_PARENT, new GIAttribMapNum(this.modeldata, EAttribNames.COLL_PARENT, EEntType.COLL, EAttribDataTypeStrs.NUMBER));
        attribs.co.set(EAttribNames.COLL_CHILDS, new GIAttribMapList(this.modeldata, EAttribNames.COLL_CHILDS, EEntType.COLL, EAttribDataTypeStrs.LIST));
        attribs.co.set(EAttribNames.COLL_POINTS, new GIAttribMapList(this.modeldata, EAttribNames.COLL_POINTS, EEntType.COLL, EAttribDataTypeStrs.LIST));
        attribs.co.set(EAttribNames.COLL_PLINES, new GIAttribMapList(this.modeldata, EAttribNames.COLL_PLINES, EEntType.COLL, EAttribDataTypeStrs.LIST));
        attribs.co.set(EAttribNames.COLL_PGONS, new GIAttribMapList(this.modeldata, EAttribNames.COLL_PGONS, EEntType.COLL, EAttribDataTypeStrs.LIST));
        // this.modeldata.attribs.add.addAttribActive(EEntType.COLL, EAttribNames.COLL_NAME, EAttribDataTypeStrs.STRING);
        // this.modeldata.attribs.add.addAttribActive(EEntType.COLL, EAttribNames.COLL_PARENT, EAttribDataTypeStrs.NUMBER);
        // this.modeldata.attribs.add.addAttribActive(EEntType.COLL, EAttribNames.COLL_CHILDS, EAttribDataTypeStrs.LIST);
        // this.modeldata.attribs.add.addAttribActive(EEntType.COLL, EAttribNames.COLL_POINTS, EAttribDataTypeStrs.LIST);
        // this.modeldata.attribs.add.addAttribActive(EEntType.COLL, EAttribNames.COLL_PLINES, EAttribDataTypeStrs.LIST);
        // this.modeldata.attribs.add.addAttribActive(EEntType.COLL, EAttribNames.COLL_PGONS, EAttribDataTypeStrs.LIST);
        // merge data
        if (include !== undefined) {
            for (const exist_ssid of include) {
                const exist_attribs: IAttribsMaps = this.modeldata.attribs.attribs_maps.get(exist_ssid);
                this.modeldata.attribs.io.merge(ssid, exist_attribs);
            }
        }
    }
    /**
     *
     * @param ssid
     */
    public delSnapshot(ssid: number): void {
        this.modeldata.attribs.attribs_maps.delete(ssid);
    }
    /**
     * Add attributes of ents from the specified snapshot to the current snapshot.
     * @param ssid ID of snapshot to copy attributes from.
     * @param ents ID of ents in both ssid and in the active snapshot
     */
    public addEntsToActiveSnapshot(ssid: number, ents: TEntTypeIdx[]): void {
        const from_attrib_maps: IAttribsMaps = this.modeldata.attribs.attribs_maps.get(ssid);
        for (const [ent_type, ent_i] of ents) {
            const attribs: Map<string, GIAttribMapBase> = from_attrib_maps[EEntTypeStr[ent_type]];
            attribs.forEach( (attrib: GIAttribMapBase, attrib_name: string) => {
                const attrib_val: TAttribDataTypes = attrib.getEntVal(ent_i);
                if (attrib_val !== undefined) {
                    this.modeldata.attribs.add.setCreateEntsAttribValActive(ent_type, ent_i, attrib_name, attrib_val);
                }
            });
        }
        from_attrib_maps.mo.forEach( (val, name) => this.modeldata.attribs.add.setModelAttribValActive(name, val) );
    }
}
