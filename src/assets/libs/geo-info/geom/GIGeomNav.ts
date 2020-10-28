
import {  EEntType, IGeomMaps } from '../common';
import { GIModelData } from '../GIModelData';
import { isPosi, isVert, isPoint, isEdge, isWire, isPline, isPgon, isColl, isTri } from '../common_id_funcs';
/**
 * Class for navigating the geometry.
 */
export class GIGeomNav {
    private modeldata: GIModelData;
    private _geom_maps: IGeomMaps;
    /**
     * Constructor
     */
    constructor(modeldata: GIModelData, geom_maps: IGeomMaps) {
        this.modeldata = modeldata;
        this._geom_maps = geom_maps;
    }
    // ============================================================================
    // Navigate down the hierarchy
    // ============================================================================
    public navVertToPosi(vert_i: number): number {
        return this._geom_maps.dn_verts_posis.get(vert_i);
    }
    public navTriToVert(tri_i: number): number[] {
        return this._geom_maps.dn_tris_verts.get(tri_i);
    }
    public navEdgeToVert(edge_i: number): number[] {
        return this._geom_maps.dn_edges_verts.get(edge_i);
    }
    public navWireToEdge(wire_i: number): number[] {
        return this._geom_maps.dn_wires_edges.get(wire_i);
    }
    public navPgonToTri(pgon_i: number): number[] {
        return this._geom_maps.dn_pgons_tris.get(pgon_i);
    }
    public navPointToVert(point_i: number): number {
        return this._geom_maps.dn_points_verts.get(point_i);
    }
    public navPlineToWire(line_i: number): number {
        return this._geom_maps.dn_plines_wires.get(line_i);
    }
    public navPgonToWire(pgon_i: number): number[] {
        return this._geom_maps.dn_pgons_wires.get(pgon_i);
    }
    public navCollToPoint(coll_i: number): number[] {
        // get the descendants of this collection
        const coll_and_desc_i: number[] = this.modeldata.attribs.colls.getCollDescendents(coll_i);
        // if no descendants, just return the the ents in this coll
        if (coll_and_desc_i.length === 0) {
            return this.modeldata.attribs.colls.getCollPoints(coll_i); // coll points
        }
        // we have descendants, so get all points
        coll_and_desc_i.splice(0, 0, coll_i);
        const points_i_set: Set<number> = new Set();
        for (const one_coll_i of coll_and_desc_i) {
            for (const point_i of this.modeldata.attribs.colls.getCollPoints(one_coll_i)) {
                points_i_set.add(point_i);
            }
        }
        return Array.from(points_i_set);
    }
    public navCollToPline(coll_i: number): number[] {
        // get the descendants of this collection
        const coll_and_desc_i: number[] = this.modeldata.attribs.colls.getCollDescendents(coll_i);
        // if no descendants, just return the the ents in this coll
        if (coll_and_desc_i.length === 0) {
            return this.modeldata.attribs.colls.getCollPlines(coll_i); // coll lines
        }
        // we have descendants, so get all plines
        coll_and_desc_i.splice(0, 0, coll_i);
        const plines_i_set: Set<number> = new Set();
        for (const one_coll_i of coll_and_desc_i) {
            for (const pline_i of this.modeldata.attribs.colls.getCollPlines(one_coll_i)) {
                plines_i_set.add(pline_i);
            }
        }
        return Array.from(plines_i_set);
    }
    public navCollToPgon(coll_i: number): number[] {
        // get the descendants of this collection
        const coll_and_desc_i: number[] = this.modeldata.attribs.colls.getCollDescendents(coll_i);
        // if no descendants, just return the the ents in this coll
        if (coll_and_desc_i.length === 0) {
            return this.modeldata.attribs.colls.getCollPgons(coll_i); // coll pgons
        }
        // we have descendants, so get all pgons
        coll_and_desc_i.splice(0, 0, coll_i);
        const pgons_i_set: Set<number> = new Set();
        for (const one_coll_i of coll_and_desc_i) {
            for (const pgon_i of this.modeldata.attribs.colls.getCollPgons(one_coll_i)) {
                pgons_i_set.add(pgon_i);
            }
        }
        return Array.from(pgons_i_set);
    }
    public navCollToCollChildren(coll_i: number): number[] {
        return this.modeldata.attribs.colls.getCollChildren(coll_i); // coll children
    }
    // ============================================================================
    // Navigate up the hierarchy
    // ============================================================================
    public navPosiToVert(posi_i: number): number[] {
        const ssid: number = this.modeldata.active_ssid;
        return this._geom_maps.up_posis_verts.get(posi_i).filter( ent_i => this.modeldata.geom.snapshot.hasEnt(ssid, EEntType.VERT, ent_i) );
    }
    public navVertToTri(vert_i: number): number[] {
        return this._geom_maps.up_verts_tris.get(vert_i);
    }
    public navVertToEdge(vert_i: number): number[] {
        return this._geom_maps.up_verts_edges.get(vert_i);
    }
    public navEdgeToWire(edge_i: number): number {
        return this._geom_maps.up_edges_wires.get(edge_i);
    }
    public navVertToPoint(vert_i: number): number {
        return this._geom_maps.up_verts_points.get(vert_i);
    }
    public navWireToPline(wire_i: number): number {
        return this._geom_maps.up_wires_plines.get(wire_i);
    }
    public navTriToPgon(tri_i: number): number {
        return this._geom_maps.up_tris_pgons.get(tri_i);
    }
    public navWireToPgon(wire_i: number): number {
        return this._geom_maps.up_wires_pgons.get(wire_i);
    }
    public navPointToColl(point_i: number): number[] {
        return this.modeldata.attribs.colls.getPointColls(point_i);
    }
    public navPlineToColl(pline_i: number): number[] {
        return this.modeldata.attribs.colls.getPlineColls(pline_i);
    }
    public navPgonToColl(pgon_i: number): number[] {
        return this.modeldata.attribs.colls.getPgonColls(pgon_i);
    }
    public navCollToCollParent(coll_i: number): number {
        // return undefined if no parent
        return this.modeldata.attribs.colls.getCollParent(coll_i); // coll parent
    }
    // ============================================================================
    // Navigate from any level to ? (up or down)
    // ============================================================================
    /**
     * Navigate from any level to the colls.
     * This will filter out colls that are not in teh active snapshot.
     * @param ent_type
     * @param index
     */
    public navAnyToColl(ent_type: EEntType, index: number): number[] {
        if (isColl(ent_type)) { return [index]; }
        const set_colls_i: Set<number> = new Set();
        const points_i: number[] = this.navAnyToPoint(ent_type, index);
        for (const point_i of points_i) {
            const point_colls_i: number[] = this.navPointToColl(point_i);
            for (const coll_i of point_colls_i) {
                set_colls_i.add(coll_i);
            }
        }
        const plines_i: number[] = this.navAnyToPline(ent_type, index);
        for (const pline_i of plines_i) {
            const pline_colls_i: number[] = this.navPointToColl(pline_i);
            for (const coll_i of pline_colls_i) {
                set_colls_i.add(coll_i);
            }
        }
        const pgons_i: number[] = this.navAnyToPgon(ent_type, index);
        for (const pgon_i of pgons_i) {
            const pgon_colls_i: number[] = this.navPointToColl(pgon_i);
            for (const coll_i of pgon_colls_i) {
                set_colls_i.add(coll_i);
            }
        }
        return Array.from(set_colls_i);
    }
    /**
     * Navigate from any level to the pgons
     * @param ent_type
     * @param index
     */
    public navAnyToPgon(ent_type: EEntType, index: number): number[] {
        if (isPgon(ent_type)) { return [index]; }
        const wires_i: number[] = this.navAnyToWire(ent_type, index);
        return wires_i.map( wire_i => this.navWireToPgon(wire_i) ).filter(pgon_i => pgon_i !== undefined);
    }
    /**
     * Navigate from any level to the plines
     * @param ent_type
     * @param index
     */
    public navAnyToPline(ent_type: EEntType, index: number): number[] {
        if (isPline(ent_type)) { return [index]; }
        const wires_i: number[] = this.navAnyToWire(ent_type, index);
        return wires_i.map( wire_i => this.navWireToPline(wire_i) ).filter(pline_i => pline_i !== undefined);
    }
    /**
     * Navigate from any level to the points
     * @param ent_type
     * @param index
     */
    public navAnyToPoint(ent_type: EEntType, index: number): number[] {
        if (isPoint(ent_type)) { return [index]; }
        const verts_i: number[] = this.navAnyToVert(ent_type, index);
        return verts_i.map( vert_i => this.navVertToPoint(vert_i) ).filter(point_i => point_i !== undefined);
    }
    // /**
    //  * Navigate from any level to the faces
    //  * @param ent_type
    //  * @param index
    //  */
    // public navAnyToFace(ent_type: EEntType, index: number): number[] {
    //     if (isPosi(ent_type)) {
    //         const verts_i: number[] = this.navPosiToVert(index);
    //         // avoid getting duplicates
    //         const faces_i_set: Set<number> = new Set();
    //         for (const vert_i of verts_i) {
    //             const faces_i: number[] = this.navAnyToFace(EEntType.VERT, vert_i);
    //             for (const face_i of faces_i) {
    //                 faces_i_set.add(face_i);
    //             }
    //         }
    //         return Array.from(new Set(faces_i_set));
    //     } else if (isVert(ent_type)) {
    //         const edges_i: number[] = this.navVertToEdge(index); // two edges
    //         return this.navAnyToFace(EEntType.EDGE, edges_i[0]);
    //     } else if (isTri(ent_type)) {
    //         return [this.navTriToFace(index)];
    //     } else if (isEdge(ent_type)) {
    //         const wire_i: number = this.navEdgeToWire(index);
    //         return this.navAnyToFace(EEntType.WIRE, wire_i);
    //     } else if (isWire(ent_type)) {
    //         return [this.navWireToFace(index)];
    //     } else if (isFace(ent_type)) { // target
    //         return [index];
    //     } else if (isPoint(ent_type)) {
    //         return [];
    //     } else if (isPline(ent_type)) {
    //         return [];
    //     } else if (isPgon(ent_type)) {
    //         return [this.navPgonToFace(index)];
    //     } else if (isColl(ent_type)) {
    //         const pgons_i: number[] = this.navCollToPgon(index);
    //         return pgons_i.map(pgon_i => this.navPgonToFace(pgon_i));
    //     }
    //     throw new Error('Bad navigation in geometry data structure: ' + ent_type + index);
    // }
    /**
     * Navigate from any level to the wires
     * @param ent_type
     * @param index
     */
    public navAnyToWire(ent_type: EEntType, index: number): number[] {
        if (isPosi(ent_type)) {
            const verts_i: number[] = this.navPosiToVert(index);
            // avoid getting duplicates
            const wires_i_set: Set<number> = new Set();
            for (const vert_i of verts_i) {
                const wires_i: number[] = this.navAnyToWire(EEntType.VERT, vert_i);
                for (const wire_i of wires_i) {
                    wires_i_set.add(wire_i);
                }
            }
            return Array.from(new Set(wires_i_set));
        } else if (isVert(ent_type)) {
            const edges_i: number[] = this.navVertToEdge(index);
            return [].concat(...edges_i.map( edge_i => this.navEdgeToWire(edge_i) ));
        } else if (isTri(ent_type)) {
            return [];
        } else if (isEdge(ent_type)) {
            return [this.navEdgeToWire(index)];
        } else if (isWire(ent_type)) { // target
            return [index];
        } else if (isPoint(ent_type)) {
            return [];
        } else if (isPline(ent_type)) {
            return [this.navPlineToWire(index)];
        } else if (isPgon(ent_type)) {
            return this.navPgonToWire(index);
        } else if (isColl(ent_type)) {
            const all_wires_i: number[] = [];
            const plines_i: number[] = this.navCollToPline(index);
            for (const pline_i of plines_i) {
                const wire_i: number = this.navPlineToWire(pline_i);
                all_wires_i.push(wire_i);
            }
            const pgons_i: number[] = this.navCollToPgon(index);
            for (const pgon_i of pgons_i) {
                const wires_i: number[] = this.navPgonToWire(pgon_i);
                for (const wire_i of wires_i) {
                    all_wires_i.push(wire_i);
                }
            }
            return all_wires_i;
        }
        throw new Error('Bad navigation in geometry data structure: ' + ent_type + index);
    }
    /**
     * Navigate from any level to the edges
     * @param ent_type
     * @param index
     */
    public navAnyToEdge(ent_type: EEntType, index: number): number[] {
        if (isPosi(ent_type)) {
            const verts_i: number[] = this.navPosiToVert(index);
            return [].concat(...verts_i.map( vert_i => this.navVertToEdge(vert_i) ));
        } else if (isVert(ent_type)) {
            return this.navVertToEdge(index);
        } else if (isTri(ent_type)) {
            return [];
        } else if (isEdge(ent_type)) {
            return [index];
        } else if (isWire(ent_type)) {
            return this.navWireToEdge(index);
        } else if (isPoint(ent_type)) {
            return [];
        } else if (isPline(ent_type)) {
            const wire_i: number = this.navPlineToWire(index);
            return this.navAnyToEdge(EEntType.WIRE, wire_i);
        } else if (isPgon(ent_type)) {
            const wires_i: number[] = this.navPgonToWire(index);
            const all_edges_i: number[] = [];
            for (const wire_i of wires_i) {
                const edges_i: number[] = this.navWireToEdge(wire_i);
                for (const edge_i of edges_i) {
                    all_edges_i.push(edge_i);
                }
            }
            return all_edges_i;
        } else if (isColl(ent_type)) {
            const all_edges_i: number[] = [];
            const plines_i: number[] = this.navCollToPline(index);
            for (const pline_i of plines_i) {
                const edges_i: number[] = this.navAnyToEdge(EEntType.PLINE, pline_i);
                for (const edge_i of edges_i) {
                    all_edges_i.push(edge_i);
                }
            }
            const pgons_i: number[] = this.navCollToPgon(index);
            for (const pgon_i of pgons_i) {
                const edges_i: number[] = this.navAnyToEdge(EEntType.PGON, pgon_i);
                for (const edge_i of edges_i) {
                    all_edges_i.push(edge_i);
                }
            }
            return all_edges_i;
        }
        throw new Error('Bad navigation in geometry data structure: ' + ent_type + index);
    }
    /**
     * Navigate from any level to the vertices
     * @param ent_type
     * @param index
     */
    public navAnyToVert(ent_type: EEntType, index: number): number[] {
        if (isPosi(ent_type)) {
            return this.navPosiToVert(index);
        } else if (isVert(ent_type)) {
            return [index];
        } else if (isTri(ent_type)) {
            return this.navTriToVert(index);
        } else if (isEdge(ent_type)) {
            return this.navEdgeToVert(index);
        } else if (isWire(ent_type)) {
            return this.modeldata.geom.query.getWireVerts(index); // avoids duplicate verts
        } else if (isPoint(ent_type)) {
            return  [this.navPointToVert(index)];
        } else if (isPline(ent_type)) {
            const wire_i: number = this.navPlineToWire(index);
            return this.navAnyToVert(EEntType.WIRE, wire_i);
        } else if (isPgon(ent_type)) {
            const wires_i: number[] = this.navPgonToWire(index);
            const verts_i: number[] = [];
            for (const wire_i of wires_i) {
                const wire_verts_i: number [] = this.modeldata.geom.query.getWireVerts(wire_i); // avoids duplicate verts
                for (const vert_i of wire_verts_i) { verts_i.push(vert_i); }
            }
            return verts_i;
        } else if (isColl(ent_type)) {
            const all_verts_i: number[] = [];
            const points_i: number[] = this.navCollToPoint(index);
            for (const point_i of points_i) {
                const vert_i: number = this.navPointToVert(point_i);
                all_verts_i.push(vert_i);
            }
            const plines_i: number[] = this.navCollToPline(index);
            for (const pline_i of plines_i) {
                const verts_i: number[] = this.navAnyToVert(EEntType.PLINE, pline_i);
                for (const vert_i of verts_i) {
                    all_verts_i.push(vert_i);
                }
            }
            const pgons_i: number[] = this.navCollToPgon(index);
            for (const pgon_i of pgons_i) {
                const verts_i: number[] = this.navAnyToVert(EEntType.PGON, pgon_i);
                for (const vert_i of verts_i) {
                    all_verts_i.push(vert_i);
                }
            }
            return all_verts_i;
        }
        throw new Error('Bad navigation in geometry data structure: ' + ent_type + index);
    }
    /**
     * Navigate from any level to the triangles
     * @param ent_type
     * @param index
     */
    public navAnyToTri(ent_type: EEntType, index: number): number[] {
        if (isPosi(ent_type)) {
            const verts_i: number[] = this.navPosiToVert(index);
            return [].concat(...verts_i.map(vert_i => this.navVertToTri(vert_i)));
        } else if (isVert(ent_type)) {
            return this.navVertToTri(index);
        } else if (isTri(ent_type)) {
            return [index];
        } else if (isEdge(ent_type)) {
            return [];
        } else if (isWire(ent_type)) {
            return [];
        } else if (isPoint(ent_type)) {
            return [];
        } else if (isPline(ent_type)) {
            return [];
        } else if (isPgon(ent_type)) {
            return this.navPgonToTri(index);
        } else if (isColl(ent_type)) {
            const all_tris_i: number[] = [];
            const pgons_i: number[] = this.navCollToPgon(index);
            for (const pgon_i of pgons_i) {
                const tris_i: number[] = this.navPgonToTri(pgon_i);
                for (const tri_i of tris_i) {
                    all_tris_i.push(tri_i);
                }
            }
            return all_tris_i;
        }
        throw new Error('Bad navigation in geometry data structure: ' + ent_type + index);
    }
    /**
     * Navigate from any level to the positions
     * @param ent_type
     * @param index
     */
    public navAnyToPosi(ent_type: EEntType, index: number): number[] {
        if (isPosi(ent_type)) { return [index]; }
        const verts_i: number[] = this.navAnyToVert(ent_type, index);
        const posis_i: number[] = verts_i.map(vert_i => this.navVertToPosi(vert_i));
        return Array.from(new Set(posis_i)); // remove duplicates
    }
    // ============================================================================
    // Navigate from any to any, general method
    // ============================================================================
    /**
     * Navigate from any level down to the positions
     * @param index
     */
    public navAnyToAny(from_ets: EEntType, to_ets: EEntType, index: number): number[] {
        // check if this is nav coll to coll
        // for coll to coll, we assume we are going down, from parent to children
        if (from_ets === EEntType.COLL && to_ets === EEntType.COLL) {
            return this.navCollToCollChildren(index);
        }
        // same level
        if (from_ets === to_ets) { return [index]; }
        // from -> to
        switch (to_ets) {
            case EEntType.POSI:
                return this.navAnyToPosi(from_ets, index);
            case EEntType.VERT:
                return this.navAnyToVert(from_ets, index);
            case EEntType.EDGE:
                return this.navAnyToEdge(from_ets, index);
            case EEntType.WIRE:
                return this.navAnyToWire(from_ets, index);
            case EEntType.POINT:
                return this.navAnyToPoint(from_ets, index);
            case EEntType.PLINE:
                return this.navAnyToPline(from_ets, index);
            case EEntType.PGON:
                return this.navAnyToPgon(from_ets, index);
            case EEntType.COLL:
                return this.navAnyToColl(from_ets, index);
            default:
                throw new Error('Bad navigation in geometry data structure: ' + to_ets + index);
        }
    }
}