import { GIModel } from '@libs/geo-info/GIModel';
import { isDevMode, ViewChild, HostListener } from '@angular/core';
// import @angular stuff
import { Component, Input, OnInit } from '@angular/core';
// import app services
import { DataService as MD } from '@services';
import { ColorPickerService } from 'ngx-color-picker';
import { Vector3, GridHelper } from 'three';
import { SplitComponent } from 'angular-split';
import { ThreejsGeoViewerComponent } from './threejs/threejs-geo-viewer.component';

/**
 * GIViewerComponent
 * This component is used in /app/model-viewers/model-viewers-container.component.html
 */
@Component({
    selector: 'gi-geo-viewer',
    templateUrl: './gi-geo-viewer.component.html',
    styleUrls: ['./gi-geo-viewer.component.scss'],
})
export class GIGeoViewerComponent {
    // model data passed to the viewer
    @Input() data: GIModel;

    @ViewChild(ThreejsGeoViewerComponent, { static: true }) threejs: ThreejsGeoViewerComponent;
    /**
     * constructor
     * @param dataService
     */
    constructor() {
    }

    threejsAction() {
    }

}
