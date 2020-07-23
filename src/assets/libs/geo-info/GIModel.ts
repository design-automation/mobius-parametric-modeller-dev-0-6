import { IModelJSONData, IEntSets, IModelJSON } from './common';
import { GIMetaData } from './GIMetaData';
import { GIModelData } from './GIModelData';
import { IThreeJS } from './ThreejsJSON';

/**
 * Geo-info model class.
 */
export class GIModel {
    [x: string]: any; // TODO: What is this???
    public metadata: GIMetaData;
    public modeldata: GIModelData;
    public debug = true;
    /**
     * Constructor
     */
    // constructor(model_data?: IModelData) {
    constructor(meta_data?: GIMetaData) {
        if (meta_data === undefined) {
            this.metadata = new GIMetaData();
        } else {
            this.metadata = meta_data;
        }
        this.modeldata = new GIModelData(this);
    }
    /**
     * Set all data from a JSON string.
     * This includes both the meta data and the model data.
     * Any existing model data wil be deleted.
     * @param meta
     */
    public setJSONStr(json_str: string): void {
        const json_data: IModelJSON = JSON.parse(json_str);
        // merge the meta data
        this.metadata.mergeJSONData(json_data);
        // set the model data
        this.modeldata.setJSONData(json_data.model_data);
    }
    /**
     * Gets all data as a JSON string.
     * This includes both the meta data and the model data.
     */
    public getJSONStr(): string {
        const data: IModelJSON = {
            meta_data: this.metadata.getJSONData(),
            model_data: this.modeldata.getJSONData()
        };
        return JSON.stringify(data);
    }
    /**
     * Sets the data in this model from a JSON data object using shallow copy.
     * Any existing data in the model is deleted.
     * @param model_json_data The JSON data.
     */
    public setModelData (model_json_data: IModelJSONData): void {
        this.modeldata.setJSONData(model_json_data);
    }
    /**
     * Returns the JSON data for this model using shallow copy.
     */
    public getModelData(): IModelJSONData {
        return this.modeldata.getJSONData();
    }
    /**
     * Set the meta data str.
     * @param meta
     */
    public setModelDataJSONStr(model_json_data_str: string) {
        this.modeldata.setJSONData(JSON.parse(model_json_data_str));
    }
    /**
     * Get the meta data str.
     */
    public getModelDataJSONStr(): string {
        return JSON.stringify(this.modeldata.getJSONData());
    }
    /**
     * Set the meta data object.
     * Data is not copied.
     * @param meta
     */
    public setMetaData(meta: GIMetaData) {
        this.metadata = meta;
    }
    /**
     * Get the meta data object.
     * Data is not copied
     */
    public getMetaData(): GIMetaData {
        return this.metadata;
    }
    /**
     * Returns a deep clone of this model.
     * Any deleted entities will remain.
     * Entity IDs will not change.
     */
    public clone(): GIModel {
        const clone: GIModel = new GIModel();
        clone.metadata = this.metadata;
        clone.modeldata = this.modeldata.clone();
        // clone.modeldata.merge(this.modeldata);
        return clone;
    }
    /**
     * Deep copies the model data from a second model into this model.
     * Meta data is assumed to be the same for both models.
     * The existing model data in this model is not deleted.
     * Entity IDs will not change.
     * @param model_data The GI model.
     */
    public merge(model: GIModel): void {
        this.modeldata.merge(model.modeldata);
    }
    /**
     * Deep copies the model data from a second model into this model.
     * Meta data is assumed to be the same for both models.
     * The existing model data in this model is not deleted.
     * The Entity IDs in this model will not change.
     * The Entity IDs in the second model will change.
     * @param model_data The GI model.
     */
    public mergeAndPurge(model: GIModel): void {
        this.modeldata.mergeAndPurge(model.modeldata);
    }
    /**
     * Renumber entities in this model.
     */
    public purge(): void {
        this.modeldata = this.modeldata.purge();
    }
    /**
     * Delete ents in the model.
     */
    public delete(ent_sets: IEntSets, invert: boolean): void {
        if (ent_sets === null) {
            if (!invert) {
                this.modeldata = new GIModelData(this);
                //
                // TODO save model attribs
                //
            }
        } else if (invert) {
            const modeldata2 = new GIModelData(this);
            modeldata2.dumpSelect(this.modeldata, ent_sets);
            this.modeldata = modeldata2;
        } else {
            this.modeldata.geom.del.del(ent_sets);
        }
    }
    /**
     * Check model for internal consistency
     */
    public check(): string[] {
        return this.modeldata.check();
    }
    /**
     * Compares this model and another model.
     * ~
     * This is the answer model.
     * The other model is the submitted model.
     * ~
     * Both models will be modified in the process.
     * ~
     * @param model The model to compare with.
     */
    public compare(model: GIModel, normalize: boolean, check_geom_equality: boolean, check_attrib_equality: boolean):
            {percent: number, score: number, total: number, comment: string} {
        return this.modeldata.compare(model, normalize, check_geom_equality, check_attrib_equality);
    }
    /**
     * Get the threejs data for this model.
     */
    public get3jsData(): IThreeJS {
        return this.modeldata.threejs.get3jsData();
    }
}
