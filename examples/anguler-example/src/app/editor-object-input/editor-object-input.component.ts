import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditorInput, EditorObjectInput, getEditorInputName } from 'openapi-definition-to-editor';

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
    name: string;
    ngOnInit(): void {
        this.name = getEditorInputName(this.objectInput);
        this.objectInput.properties = this.objectInput.properties || [];
        this.objectInput.switchableOptions = this.objectInput.switchableOptions || [];
        this.objectInput.switchableObjects = this.objectInput.switchableObjects || [];
    }
    fixIndexPath(x: EditorInput) {
        x.path = `${this.objectInput.path}.${getEditorInputName(x)}`;
        return x;
    }
    setSwitchableSelected(val: string) {
        this.switchableSelected = val;
    }
}
