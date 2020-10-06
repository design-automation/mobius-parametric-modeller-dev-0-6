import { GIModel } from '@libs/geo-info/GIModel';
// import * as itowns from 'itowns';
import * as itowns from 'itowns/dist/itowns';
// import {setupLoadingScreen} from '../itowns/LoadingScreen';
import { DataThreejs } from '../../gi-viewer/data/data.threejs';
import { DataService } from '../../gi-viewer/data/data.service';
import {
    Component, Input, OnChanges, OnInit
} from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const LONGLAT = [103.778329, 1.298759];

/**
 * A threejs viewer for viewing geo-info (GI) models.
 * This component gets used in /app/model-viewers/all-viewers/gi-viewer/gi-viewer.component.html
 */
@Component({
    selector: 'threejs-geo-viewer',
    templateUrl: './threejs-geo-viewer.component.html',
    styleUrls: ['./threejs-geo-viewer.component.scss']
})

export class ThreejsGeoViewerComponent implements OnInit, OnChanges {
    @Input() model: GIModel;
    public _data_threejs: DataThreejs;
    _container;
    _view;
    _camTarget;
    _viewColorLayers = [];
    _viewElevationLayers = [];

    _____x = 0;
    _____y = 0;

    constructor(private dataService: DataService) {
    }

    ngOnInit() {
        this.getLayers();
        this.getTerrains();
        this._data_threejs = this.dataService.getThreejsScene();

        const placement = {
            coord: new itowns.Coordinates('EPSG:4326', LONGLAT[0], LONGLAT[1]),
            range: 1000,
            tilt: 50
        };


        this._container = document.getElementById('threejs-geo-container');
        this._view = new itowns.GlobeView(this._container, placement);
        this._view.mainLoop.gfxEngine.renderer.shadowMap.enabled = true;
        this._view.mainLoop.gfxEngine.renderer.shadowMap.type = itowns.THREE.PCFShadowMap;

        this._camTarget = this._view.controls.getLookAtCoordinate();

        // default orbit control:
        // DOLLY: {mouseButton: 1, enable: true}
        // MOVE_GLOBE: {mouseButton: 0, enable: true, finger: 1}
        // NONE: {}
        // ORBIT: {mouseButton: 0, keyboard: 17, enable: true, finger: 2}
        // PAN: {mouseButton: 2, up: 38, bottom: 40, left: 37, right: 39, up: 38}
        // PANORAMIC: {mouseButton: 0, keyboard: 16, enable: true}
        this._view.controls.states.ORBIT = {mouseButton: 0, enable: true, finger: 2};
        // this._view.controls.states.PAN = {mouseButton: 2, bottom: 40, left: 37, right: 39, up: 38, enable: true};
        // this._view.controls.states.MOVE_GLOBE = {mouseButton: 0, keyboard: 17, enable: true, finger: 1};
        this._view.controls.states.PAN = {mouseButton: 0, keyboard: 17, enable: true, finger: 1};
        this._view.controls.states.MOVE_GLOBE = {mouseButton: 2, bottom: 40, left: 37, right: 39, up: 38, enable: true};


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

        this._view.addLayer(this._viewColorLayers[this._____x]);
        if (this._viewElevationLayers[this._____y]) {
            this._view.addLayer(this._viewElevationLayers[this._____y]);
        }
        // const atmosphere = this._view.getLayerById('atmosphere');
        // atmosphere.setRealisticOn(true);

        if (this.model && this._data_threejs.model && this._data_threejs.model === this.model) {
            this.refreshModel();
        }
        this._view.notifyChange();
    }

    ngOnChanges(changes) {
        if (changes.model) {
            if (!this._data_threejs) { return; }
            if (!this.model) {
                this.removeMobiusObjs();
                return;
            }
            if (!this._data_threejs.model || this._data_threejs.model !== this.model) {
                this._data_threejs.model = this.model;
                this._data_threejs.populateScene(this.model, null);
            }
            this.refreshModel();
            this._view.notifyChange();
        }
    }

    removeMobiusObjs() {
        let i = 0;
        while (i < this._view.scene.children.length) {
            const scene_obj = this._view.scene.children[i];
            if (scene_obj.name.startsWith('mobius')) {
                this._view.scene.children.splice(i, 1);
            } else {
                i++;
            }
        }
    }

    refreshModel() {
        this.removeMobiusObjs();
        const threeJSGroup = new itowns.THREE.Group();
        threeJSGroup.name = 'mobius_geom';

        const camTarget = this._camTarget.clone();
        camTarget.altitude += 2;
        const cameraTargetPosition = camTarget.as(this._view.referenceCrs);

        for (const i of this._data_threejs.scene.children) {
            if (i.name.startsWith('obj_')) {
                // console.log(i)
                threeJSGroup.add(i.clone());
            }
        }
        threeJSGroup.position.copy(cameraTargetPosition)
        threeJSGroup.lookAt(new THREE.Vector3(0, 0, 0));
        threeJSGroup.rotateY(Math.PI);
        threeJSGroup.updateMatrixWorld();
        this._view.scene.add(threeJSGroup);

        const scale = this._data_threejs._all_objs_sphere.radius;
        const azimuth = 50;
        const altitude = 90;

        const lightTarget = new THREE.Object3D();
        lightTarget.name = 'mobius_lightTarget';
        lightTarget.position.copy(cameraTargetPosition);
        lightTarget.name = 'lightTarget';
        lightTarget.updateMatrixWorld();
        this._view.scene.add(lightTarget);

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
        lighting.position.copy(camTarget.as(this._view.referenceCrs));

        const cam = <THREE.OrthographicCamera> lighting.shadow.camera;
        cam.up.set(0, 0, 1);
        cam.left = -scale;
        cam.right = scale;
        cam.top = scale;
        cam.bottom = -scale;

        lighting.updateMatrixWorld();

        this._view.scene.add(lighting);
    }


    onMouseDown(event) {
    }

    onMouseUp(event) {
    }

    getLayers() {
        this._viewColorLayers = [];
        // this._viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Terrain(Background)',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Stamen World terrain (Background).\nhttp://www.maps.stamen.com/',
        //     creationFunction: function () {
        //         return new Cesium.OpenStreetMapImageryProvider({
        //             url: 'https://stamen-tiles.a.ssl.fastly.net/terrain-background/',
        //         });
        //     },
        // }));
        this._viewColorLayers.push(new itowns.ColorLayer('Ortho', {
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
        this._viewColorLayers.push(new itowns.ColorLayer('Ortho', {
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

        this._viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Stamen Toner',
                projection: 'EPSG:3857',
                format: 'image/png',
                url: 'https://stamen-tiles.a.ssl.fastly.net/toner/${z}/${x}/${y}.png',
                tileMatrixSet: 'PM'
            })
        }));
        this._viewColorLayers.push(new itowns.ColorLayer('Ortho', {
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
        this._viewColorLayers.push(new itowns.ColorLayer('Ortho', {
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

        this._____x = 8;

        this._viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Google map roadmap',
                projection: 'EPSG:3857',
                format: 'image/jpg',
                url: 'https://mt1.google.com/vt/lyrs=m&x=${x}&y=${y}&z=${z}',
                tileMatrixSet: 'PM',
            })
        }));
        this._viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Google map altered roadmap',
                projection: 'EPSG:3857',
                format: 'image/jpg',
                url: 'https://mt1.google.com/vt/lyrs=r&x=${x}&y=${y}&z=${z}',
                tileMatrixSet: 'PM',
            })
        }));
        this._viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Google map satellite only',
                projection: 'EPSG:3857',
                format: 'image/jpg',
                url: 'https://mt1.google.com/vt/lyrs=s&x=${x}&y=${y}&z=${z}',
                tileMatrixSet: 'PM',
            })
        }));
        this._viewColorLayers.push(new itowns.ColorLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Google map hybrid',
                projection: 'EPSG:3857',
                format: 'image/jpg',
                url: 'https://mt1.google.com/vt/lyrs=y&x=${x}&y=${y}&z=${z}',
                tileMatrixSet: 'PM',
            })
        }));
        this._viewColorLayers.push(new itowns.ColorLayer('Ortho', {
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


        // this._viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map normal',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'base' + here2 + 'normal.day' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this._viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map normal grey',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'base' + here2 + 'normal.day.grey' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this._viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map normal traffic',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'base' + here2 + 'normal.day.transit' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this._viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map normal reduced',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'base' + here2 + 'reduced.day' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this._viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map normal pedestrian',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'base' + here2 + 'pedestrian.day' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this._viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map aerial terrain',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'aerial' + here2 + 'terrain.day' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this._viewColorLayers.push(new Cesium.ProviderViewModel({
        //     name: 'Here map aerial satellite',
        //     iconUrl: Cesium.buildModuleUrl('Widgets/Images/TerrainProviders/CesiumWorldTerrain.png'),
        //     tooltip: 'Here',
        //     creationFunction: function (apiKey) {
        //         return new Cesium.UrlTemplateImageryProvider({
        //             url: here1 + 'aerial' + here2 + 'satellite.day' + here3 + apiKey,
        //         });
        //     },
        // }));

        // this._viewColorLayers.push(new Cesium.ProviderViewModel({
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
    getTerrains() {
        this._viewElevationLayers = [];
        this._____y = 1;
        this._viewElevationLayers.push(null);
        this._viewElevationLayers.push(new itowns.ElevationLayer('Ortho', {
            source: new itowns.TMSSource({
                name: 'Google map terrain only',
                projection: 'EPSG:3857',
                format: 'image/jpg',
                url: 'https://mt1.google.com/vt/lyrs=t&x=${x}&y=${y}&z=${z}',
                tileMatrixSet: 'TMS:4326',
            })
        }));
    }
}

