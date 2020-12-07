import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {  EditorObjectInput } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-object-input',
    templateUrl: './editor-object-input.component.html',
    styleUrls: ['./editor-object-input.component.css'],
})
export class EditorObjectInputComponent implements OnInit {
    constructor() {}
    @Input() changes: any;
    @Output() setChanges = new EventEmitter();
    @Input() value: any;
    @Input() objectInput: EditorObjectInput;
    switchableSelected: string;
    ngOnInit(): void {
        this.objectInput.properties = this.objectInput.properties || [];
        this.objectInput.switchableOptions = this.objectInput.switchableOptions || [];
        this.objectInput.switchableObjects = this.objectInput.switchableObjects || [];
    }
    setSwitchableSelected(val: string) {
        this.switchableSelected = val;
    }
}
