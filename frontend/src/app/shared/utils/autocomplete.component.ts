import { Component, ElementRef, Input, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'autocomplete',
    host: {
        '(document:click)': 'handleClick($event)',
    },
    template: `
        <div class="container" >
            <div class="input row">
              <input id="country" type="text" class="input form-control" [placeholder]="placeholder" [(ngModel)]="query" (keyup)="filter($event)" (keydown)="preventKey($event)" >
            </div>
            <div *ngIf="filteredOptions.length > 0" class="suggestions">
                <div class="item col-12" [ngClass]="{'selectedItem': item === selectedItem }"*ngFor="let item of filteredOptions" (click)="select(item)">
                    {{item[optionText]}}
                </div>
            </div>
        </div>  	
        `,
    styles: [`
        .suggestions {
            border: 1px solid #ababab;
            border-radius: 5px;
            position: absolute;
            left: 0;
            z-index: 1500;
            background-color: white;
            width: 100%;
        }

        .item:hover {
            background-color: #222;
            color: white;
        }

        .item {
            width: 100%;
            color: black;
        }

        .selectedItem {
            background-color: #222;
            color: white;
        }
    `]
})

export class AutocompleteComponent implements OnInit{
    @Input() options: Array<any> = [];
    @Input() placeholder: string = "Start typing to search ...";
    @Input() queryText: string = "";
    @Input() filterOn: string = "description";
    @Input() optionText: string = "description";
    @Input() clear: boolean = true;
    @Output() optionSelected: EventEmitter<any> = new EventEmitter();
    filteredOptions: Array<any> = [];
    elementRef;
    selectedItem: any = null;
    query: string = "";

    constructor(myElement: ElementRef) {
        this.elementRef = myElement;
    }

    ngOnInit() {
        if (this.queryText) {
            this.query = this.queryText;
        }
    }

    preventKey(key) {
        if (key.keyCode === 13) {
            key.preventDefault();
            if (this.selectedItem) {
                this.select(this.selectedItem);
            }
        }
        if (key.keyCode === 40) {
            key.preventDefault();
            let pos = this.filteredOptions.indexOf(this.selectedItem); 
            if (pos < this.filteredOptions.length - 1) {
                this.selectedItem = this.filteredOptions[pos + 1]
            }
        }
        if (key.keyCode === 38) {
            key.preventDefault();
            let pos = this.filteredOptions.indexOf(this.selectedItem);
            if (pos > 0) {
                this.selectedItem = this.filteredOptions[pos - 1]
            }
        }        
    }

    filter(key) {
        if (key.keyCode === 13 || key.keyCode === 39 || key.keyCode === 37) {
            key.preventDefault();
            return;
        }
        this.filteredOptions = this.options.filter(el => ((el[this.filterOn].toLowerCase()).indexOf(this.query.toLowerCase()) > -1));
    }

    select(item) {
        this.optionSelected.emit(item);
        this.filteredOptions = [];
        if(this.clear) {
            this.query = "";
        } else {
            this.query = item[this.optionText];
        }
        this.selectedItem = null;
    }

    clearQuery() {
        this.query = ""; 
    }

    setQuery(term) {
        this.query = term; 
    }

    handleClick(event) {
        let clickedComponent = event.target;
        let inside = false;
        do {
            if (clickedComponent === this.elementRef.nativeElement) {
                inside = true;
            }
            clickedComponent = clickedComponent.parentNode;
        } while (clickedComponent);
        if (!inside) {
            this.filteredOptions = [];
        }
    }
}
