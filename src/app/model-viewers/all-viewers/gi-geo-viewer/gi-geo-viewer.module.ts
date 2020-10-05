import { AngularSplitModule } from 'angular-split';
import { NgxPaginationModule} from 'ngx-pagination';
// import @angular stuff
import { NgModule, ModuleWithProviders } from '@angular/core';
import { MatSliderModule } from '@angular/material/slider';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule} from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule} from '@angular/material/expansion';
import { ColorPickerModule } from 'ngx-color-picker';

// import app components
import { GIGeoViewerComponent } from './gi-geo-viewer.component';
import { ThreejsGeoViewerComponent } from './threejs/threejs-geo-viewer.component';

// import { ModalService } from '../gi-viewer/html/modal-window.service';
// import { ThreeJSViewerService } from '../gi-viewer/threejs/threejs-viewer.service';

// import { ModalService } from './html/modal-window.service';
// import { ThreeJSViewerService } from './threejs/threejs-viewer.service';

/**
 * GIViewer
 * A viewer for Geo-Info models.
 */
@NgModule({
    declarations: [
        GIGeoViewerComponent,
        ThreejsGeoViewerComponent
    ],
    exports: [
        GIGeoViewerComponent
    ],
    imports: [
        CommonModule,
        AngularSplitModule,
        MatSliderModule,
        MatIconModule,
        NgxPaginationModule,
        MatExpansionModule,
        MatTooltipModule,
        FormsModule,
        ColorPickerModule
    ],
    providers: [
        // ModalService,
        // ThreeJSViewerService
    ]
})
export class GIGeoViewerModule {
     static forRoot(): ModuleWithProviders {
        return {
            ngModule: GIGeoViewerModule
        };
    }
}
