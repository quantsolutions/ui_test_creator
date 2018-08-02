import { Component, OnInit, Input } from "@angular/core";
import { Screen } from "@screens";
import { BackendService } from "@backend";

@Component({
    selector: 'images-screen',
    templateUrl: './images.component.html'
})

export class ImagesScreen extends Screen implements OnInit {
    @Input() imageSelected: string;

    backendImages: any;
    frontendImages: any;
    selectedImageBase64: any;
    constructor(private backend: BackendService) {
        super();
        this.screenName = 'Image Browser'
        this.noModel = true;
    }

    ngOnInit(): void {
        // Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        this.backend.getImages({method: 'last', value: '10'}).then(e => {
            if (e.result && e.data) {
                this.backendImages = e.data;
                this.getSelectedImage(this.model);
                this.frontendImages = this.backendImages;
            } else {
                console.error(e.result);
                console.error(e.data);
            }
        })
    }

    selectImage(image) {
        this.model = String(image);
        this.getSelectedImage(this.model)
    }

    getSelectedImage(image) {
        this.selectedImageBase64 = this.backendImages.filter(img => img.name === image)[0];
    }

    searchImages(searchTerm) {
        if (searchTerm.length >= 1) {
            console.log(this.backendImages)
            this.frontendImages = this.backendImages.filter(img => img.name.includes(searchTerm));
        } else {
            this.frontendImages = this.backendImages;
        }
    }
}
