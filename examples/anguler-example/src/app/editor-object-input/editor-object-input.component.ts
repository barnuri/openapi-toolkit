import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditorObjectInput, objectGetSelectedSwitchable, objectSetSelectedSwitchable, arrayChildModifyIndex } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-object-input',
    templateUrl: './editor-object-input.component.html',
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
        this.switchableSelected = objectGetSelectedSwitchable(this.objectInput, this.value, this.changes);
    }
    setSwitchableSelected(newVal) {
        const newChanges = objectSetSelectedSwitchable(this.objectInput, this.changes, newVal);
        this.switchableSelected = objectGetSelectedSwitchable(this.objectInput, this.value, newChanges);
        this.setChanges.emit(newChanges);
    }
}
