import { Component, EventEmitter, Output, NgModule, Input } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import * as $ from 'jquery';

@Component({
    selector: 'file-upload',
    template: `
                <label class="btn btn-profile btn-file clickable" style="margin: 0">
                    <i class="{{ buttonIcon }}"></i>&ensp;{{buttonName}} <input type="file" accept="{{acceptString}}" id="filePath" (change)="saveFile()" style="display: none;">
                </label>
              `
})

export class FileUploadComponent {
    @Output() uploaded: EventEmitter<{ save: boolean, data: any }> = new EventEmitter<{ save: boolean, data: any }>();
    @Input() buttonIcon: string = "fa fa-plus";
    @Input() buttonName: string = "Add File";
    @Input() acceptFileType: Array<string> = [];

    acceptString: string = "";

    constructor() { }

    saveFile() {
        let file = $('#filePath');
        file = file[0].files[0];
        let fileSize = file.size / 1000;
        let reader = new FileReader();
        let fileObject = {};
        reader.addEventListener('load', function () {
            this.uploaded.emit({
                save: true,
                data: reader.result,
                size: fileSize,
                name: file.name.substr(0, file.name.lastIndexOf('.'))
            });
        }.bind(this), false);
        if (file) {
            reader.readAsDataURL(file);
        }
    }
}
