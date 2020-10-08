import { GIModel } from '@libs/geo-info/GIModel';
import { GeoSettings } from '../gi-geo-viewer.settings';
import { EEntType, Txyz, TAttribDataTypes, LONGLAT } from '@libs/geo-info/common';
import * as itowns from 'itowns/dist/itowns';
import { DataService } from '../../gi-viewer/data/data.service';
import * as THREE from 'three';


export const API_MAPS = [
                            'Here map normal',
                            'Here map normal grey',
                            'Here map normal traffic',
                            'Here map normal reduced',
                            'Here map normal pedestrian',
                            'Here map aerial terrain',
                            'Here map aerial satellite',
                            'Here map aerial hybrid',
                            'Bing Map'
                        ];
export const API_MAPS_KEY_MAPPING = {
    'Here map normal': 'here',
    'Here map normal grey': 'here',
    'Here map normal traffic': 'here',
    'Here map normal reduced': 'here',
    'Here map normal pedestrian': 'here',
    'Here map aerial terrain': 'here',
    'Here map aerial satellite': 'here',
    'Here map aerial hybrid': 'here',
    'Bing Map': 'bing'
};

/**
 * Cesium data
 */
export class DataGeo {
    public viewer: any;
    // the GI model to display
    public model: GIModel;

    // Geo Settings
    public settings: GeoSettings;
    public attribution: string;

    public container;
    public view;
    public camTarget;
    public viewColorLayers = [];
    public viewElevationLayers = [];

    _____x = 0;
    _____y = 0;

    /**
     * Constructs a new data subscriber.
     */
    constructor(settings: GeoSettings) {
        this.settings = JSON.parse(JSON.stringify(settings));
        this._getLayers();
        this._getTerrains();
    }

    // matrix points from xyz to long lat
    /**
     *
     */
    public createGeoViewer(threejsScene) {
        this._getLayers();
        this._getTerrains();

        const placement = {
            coord: new itowns.Coordinates('EPSG:4326', LONGLAT[0], LONGLAT[1]),
            range: 1000,
            tilt: 50
        };


        this.container = document.getElementById('threejs-geo-container');
        this.view = new itowns.GlobeView(this.container, placement);
        this.view.mainLoop.gfxEngine.renderer.shadowMap.enabled = true;
        this.view.mainLoop.gfxEngine.renderer.shadowMap.type = itowns.THREE.PCFShadowMap;

        this.camTarget = this.view.controls.getLookAtCoordinate();

        // default orbit control:
        // DOLLY: {mouseButton: 1, enable: true}
        // MOVE_GLOBE: {mouseButton: 0, enable: true, finger: 1}
        // NONE: {}
        // ORBIT: {mouseButton: 0, keyboard: 17, enable: true, finger: 2}
        // PAN: {mouseButton: 2, up: 38, bottom: 40, left: 37, right: 39, up: 38}
        // PANORAMIC: {mouseButton: 0, keyboard: 16, enable: true}
        this.view.controls.states.ORBIT = {mouseButton: 0, enable: true, finger: 2};
        // this.view.controls.states.PAN = {mouseButton: 2, bottom: 40, left: 37, right: 39, up: 38, enable: true};
        // this.view.controls.states.MOVE_GLOBE = {mouseButton: 0, keyboard: 17, enable: true, finger: 1};
        this.view.controls.states.PAN = {mouseButton: 0, keyboard: 17, enable: true, finger: 1};
        this.view.controls.states.MOVE_GLOBE = {mouseButton: 2, bottom: 40, left: 37, right: 39, up: 38, enable: true};


        // const orthoSource = new itowns.TMSSource({
        //     projection: 'EPSG:3857',
        //     isInverted: true,
        //     format: 'image/png',
        //     url: 'http://osm.oslandia.io/styles/klokantech-basic/${z}/${x}/${y}.png',
        //     attribution: {
        //         name: 'OpenStreetMap',
        //         url: 'http://www.openstreetmap.org/'
        //     },
        //     tileMatrixSet: 'PM'
        // });

        // const orthoSource = new itowns.WMTSSource({
        //     projection: 'EPSG:3857',
        //     format: 'image/jpg',
        //     url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/',
        //     tileMatrixSet: 'PM',
        //     name: 'ArcGis'
        // });

        // const orthoSource = new itowns.TMSSource({
        //     name: 'Google map roadmap',
        //     projection: 'EPSG:3857',
        //     format: 'image/jpg',
        //     url: 'https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}',
        //     tileMatrixSet: 'PM',
        // });

        this.view.addLayer(this.viewColorLayers[this._____x]);
        if (this.viewElevationLayers[this._____y]) {
            this.view.addLayer(this.viewElevationLayers[this._____y]);
        }
        // const atmosphere = this.view.getLayerById('atmosphere');
        // atmosphere.setRealisticOn(true);

        if (this.model && threejsScene.model && threejsScene.model === this.model) {
            this.refreshModel(threejsScene);
        }
        this.view.notifyChange();
    }

    onChanges(changes, threejsScene) {
        if (changes.data) {
            if (!threejsScene) { return; }
            if (!this.model) {
                this.removeMobiusObjs();
                return;
            }
            if (!threejsScene.model || threejsScene.model !== this.model) {
                threejsScene.model = this.model;
                threejsScene.populateScene(this.model, null);
            }
            this.refreshModel(threejsScene);
            this.view.notifyChange();
        }
    }

    public updateSettings(settings: GeoSettings = null) {
        let newSetting: GeoSettings;
        if (settings !== null) {
            newSetting = <GeoSettings> JSON.parse(JSON.stringify(settings));
        } else {
            newSetting = <GeoSettings> JSON.parse(localStorage.getItem('cesium_settings'));
        }
        if (!newSetting) { return; }
        if (newSetting.imagery) {
            if (newSetting.imagery.layer && this.settings.imagery.layer !== newSetting.imagery.layer) {
                for (const layerProvider of this.viewColorLayers) {
                    if (layerProvider.name === newSetting.imagery.layer) {
                        const viewer_layers = this.viewer.imageryLayers;
                        const newLayer = new Cesium.ImageryLayer(layerProvider.creationCommand(
                            this.settings.imagery.apiKey[API_MAPS_KEY_MAPPING[this.settings.imagery.layer]]));
                        viewer_layers.removeAll();
                        viewer_layers.add(newLayer);
                        this.settings.imagery.layer = newSetting.imagery.layer;
                    }
                }
            }
            if (newSetting.imagery.apiKey) {
                if (!this.settings.imagery.apiKey) {
                    this.settings.imagery.apiKey = {};
                }
                for (const i of Object.keys(newSetting.imagery.apiKey)) {
                    this.settings.imagery.apiKey[i] = newSetting.imagery.apiKey[i];
                }
            }
            if (newSetting.imagery.terrain && this.settings.imagery.terrain !== newSetting.imagery.terrain) {
                for (const terrainProvider of this.viewElevationLayers) {
                    if (terrainProvider.name === newSetting.imagery.terrain) {
                        this.viewer.terrainProvider = terrainProvider.creationCommand();
                        this.settings.imagery.terrain = newSetting.imagery.terrain;
                    }
                }
            }
        }
        if (newSetting.camera) {
            if (newSetting.camera.pos) {
                this.settings.camera.pos.x = newSetting.camera.pos.x;
                this.settings.camera.pos.y = newSetting.camera.pos.y;
                this.settings.camera.pos.z = newSetting.camera.pos.z;
                this.settings.camera.direction.x = newSetting.camera.direction.x;
                this.settings.camera.direction.y = newSetting.camera.direction.y;
                this.settings.camera.direction.z = newSetting.camera.direction.z;
                this.settings.camera.up.x = newSetting.camera.up.x;
                this.settings.camera.up.y = newSetting.camera.up.y;
                this.settings.camera.up.z = newSetting.camera.up.z;
                this.settings.camera.right.x = newSetting.camera.right.x;
                this.settings.camera.right.y = newSetting.camera.right.y;
                this.settings.camera.right.z = newSetting.camera.right.z;
            }
        }
        if (newSetting.time) {
            if (newSetting.time.date) {
                this.settings.time.date = newSetting.time.date;
                if (this.settings.time.date.indexOf('T') === -1) {
                    Cesium.JulianDate.fromIso8601(this.settings.time.date, this.viewer.clock.currentTime);
                    Cesium.JulianDate.addDays(this.viewer.clock.currentTime, -1, this.viewer.clock.startTime);
                    Cesium.JulianDate.addDays(this.viewer.clock.currentTime, 1, this.viewer.clock.stopTime);
                    this.viewer.timeline.zoomTo(this.viewer.clock.startTime, this.viewer.clock.stopTime);
                } else {
                    Cesium.JulianDate.fromIso8601(this.settings.time.date.split('T')[0], this.viewer.clock.currentTime);
                    Cesium.JulianDate.addDays(this.viewer.clock.currentTime, -1, this.viewer.clock.startTime);
                    Cesium.JulianDate.addDays(this.viewer.clock.currentTime, 1, this.viewer.clock.stopTime);
                    Cesium.JulianDate.fromIso8601(this.settings.time.date + ':00Z', this.viewer.clock.currentTime);
                    this.viewer.timeline.zoomTo(this.viewer.clock.startTime, this.viewer.clock.stopTime);
                }
            }
        }
        // if (newSetting.model) {
        //     if (newSetting.model.polygonEdge !== this.settings.model.polygonEdge) {
        //         this.settings.model.polygonEdge = newSetting.model.polygonEdge;
        //         setTimeout(() => {
        //             this.addGeometry(this.model, null, false);
        //         }, 0);
        //     }
        // }
        if (newSetting.updated) {
            this.settings.updated = newSetting.updated;
        }
        localStorage.setItem('geo_settings', JSON.stringify(this.settings));
    }

    removeMobiusObjs() {
        let i = 0;
        while (i < this.view.scene.children.length) {
            const scene_obj = this.view.scene.children[i];
            if (scene_obj.name.startsWith('mobius')) {
                this.view.scene.children.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    refreshModel(threejsScene) {
        this.removeMobiusObjs();
        const threeJSGroup = new itowns.THREE.Group();
        threeJSGroup.name = 'mobius_geom';

        const camTarget = this.camTarget.clone();
        camTarget.altitude += 2;
        const cameraTargetPosition = camTarget.as(this.view.referenceCrs);

        for (const i of threejsScene.scene.children) {
            if (i.name.startsWith('obj_')) {
                // console.log(i)
                threeJSGroup.add(i.clone());
            }
        }
        threeJSGroup.position.copy(cameraTargetPosition)
        threeJSGroup.lookAt(new THREE.Vector3(0, 0, 0));
        threeJSGroup.rotateY(Math.PI);
        threeJSGroup.updateMatrixWorld();
        this.view.scene.add(threeJSGroup);

        const scale = threejsScene._all_objs_sphere.radius;
        const azimuth = 50;
        const altitude = 90;

        const lightTarget = new THREE.Object3D();
        lightTarget.name = 'mobius_lightTarget';
        lightTarget.position.copy(cameraTargetPosition);
        lightTarget.name = 'lightTarget';
        lightTarget.updateMatrixWorld();
        this.view.scene.add(lightTarget);

        const lighting = new itowns.THREE.DirectionalLight(0xFFFFFF, 1);
        lighting.name = 'mobius_lighting';
        // this.getDLPosition(distance);
        lighting.castShadow = true;
        lighting.visible = true;
        lighting.shadow.mapSize.width = 2048;  // default
        lighting.shadow.mapSize.height = 2048; // default
        lighting.shadow.camera.near = 0.5;
        lighting.shadow.camera.far = scale * 20;
        lighting.shadow.bias = -0.0003;

        camTarget.altitude = scale * 1.5;
        lighting.position.copy(camTarget.as(this.view.referenceCrs));

        const cam = <THREE.OrthographicCamera> lighting.shadow.camera;
        cam.up.set(0, 0, 1);
        cam.left = -scale;
        cam.right = scale;
        cam.top = scale;
        cam.bottom = -scale;

        lighting.updateMatrixWorld();

        this.view.scene.add(lighting);
    }


    // PRIVATE METHODS
    private _getLayers() {
        this.viewColorLayers = [];
        // this.viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Terrain(Background)',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Stamen World terrain (Background).\nhttp://www.maps.stamen.com/',
        //     creationFunction: function () {
        //         return new Cesium.OpenStreetMapImageryProvider({
        //             url: 'https://stamen-tiles.a.ssl.fastly.net/terrain-background/',
        //         });
        //     },
        // }));
        this.viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'OpenStreetMap',
                projection: 'EPSG:3857',
                format: 'image/png',
                url: 'https://a.tile.openstreetmap.org/${z}/${x}/${y}.png',
                attribution: {
                    name: 'OpenStreetMap',
                    url: 'http://www.openstreetmap.org/',
                    html: ''
                },
                tileMatrixSet: 'PM',
                zoom: {
                    min: 0,
                    max: 19
                }
            })
        }));
        this.viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'OpenTopoMap',
                projection: 'EPSG:3857',
                format: 'image/png',
                url: 'https://a.tile.opentopomap.org/${z}/${x}/${y}.png',
                tileMatrixSet: 'PM',
                zoom: {
                    min: 0,
                    max: 17
                }
            })
        }));

        this.viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Stamen Toner',
                projection: 'EPSG:3857',
                format: 'image/png',
                url: 'https://stamen-tiles.a.ssl.fastly.net/toner/${z}/${x}/${y}.png',
                tileMatrixSet: 'PM'
            })
        }));
        this.viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Stamen terrain',
                projection: 'EPSG:3857',
                format: 'image/png',
                url: 'https://stamen-tiles.a.ssl.fastly.net/terrain/${z}/${x}/${y}.png',
                tileMatrixSet: 'PM',
                zoom: {
                    min: 2,
                    max: 17
                }
            })
        }));
        this.viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Stamen watercolor',
                projection: 'EPSG:3857',
                format: 'image/png',
                url: 'https://stamen-tiles.a.ssl.fastly.net/watercolor/${z}/${x}/${y}.png',
                tileMatrixSet: 'PM',
                zoom: {
                    min: 0,
                    max: 18
                }
            })
        }));

        this.viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Google map roadmap',
                projection: 'EPSG:3857',
                format: 'image/jpg',
                url: 'https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}',
                tileMatrixSet: 'PM',
            })
        }));
        this.viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Google map altered roadmap',
                projection: 'EPSG:3857',
                format: 'image/jpg',
                url: 'https://mt1.google.com/vt/lyrs=r&x=${x}&y=${y}&z=${z}',
                tileMatrixSet: 'PM',
            })
        }));
        this.viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Google map satellite only',
                projection: 'EPSG:3857',
                format: 'image/jpg',
                url: 'https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}',
                tileMatrixSet: 'PM',
            })
        }));
        this.viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Google map hybrid',
                projection: 'EPSG:3857',
                format: 'image/jpg',
                url: 'https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}',
                tileMatrixSet: 'PM',
            })
        }));
        this.viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.WMTSSource({
                name: 'ArcGIS Terrain',
                projection: 'EPSG:3857',
                format: 'image/jpg',
                url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/',
                tileMatrixSet: 'PM'
            })
        }));


        const here1 = 'https://1.';
        const here2 = '.maps.ls.hereapi.com/maptile/2.1/maptile/newest/';
        const here3 = '/{z}/{x}/{y}/{width}/png8?apiKey=';


        // this.viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map normal',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'base' + here2 + 'normal.day' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this.viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map normal grey',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'base' + here2 + 'normal.day.grey' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this.viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map normal traffic',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'base' + here2 + 'normal.day.transit' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this.viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map normal reduced',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'base' + here2 + 'reduced.day' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this.viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map normal pedestrian',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'base' + here2 + 'pedestrian.day' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this.viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map aerial terrain',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'aerial' + here2 + 'terrain.day' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this.viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map aerial satellite',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'aerial' + here2 + 'satellite.day' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this.viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map aerial hybrid',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'aerial' + here2 + 'hybrid.day' + here3 + apiKey,
        //         });
        //     },
        // }));
    }

    private _getTerrains() {
        this.viewElevationLayers = [];
        this.viewElevationLayers.push(null);
        this.viewElevationLayers.push(new itowns.ElevationLayer('elevation', {
            source: new itowns.WMTSSource({
                projection: 'EPSG:3857',
                url: 'http://wxs.ign.fr/3ht7xcw6f7nciopo16etuqp2/geoportail/wmts',
                name: 'ELEVATION.ELEVATIONGRIDCOVERAGE',
                tileMatrixSet: 'WGS84G',
                format: 'image/x-bil;bits=32'
            })
        }));
    }
}

