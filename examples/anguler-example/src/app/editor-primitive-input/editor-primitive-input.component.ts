import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditorPrimitiveInput, primitiveGetValue, primitiveSetValue } from 'openapi-definition-to-editor';
@Component({
    selector: 'app-editor-primitive-input',
    templateUrl: './editor-primitive-input.component.html',
})
export class EditorPrimitiveInputComponent implements OnInit {
    constructor() {}
    @Input() changes: any;
    @Output() setChanges = new EventEmitter();
    @Input() value: any;
    @Input() primitiveInput: EditorPrimitiveInput;
    pathValue: any;
    ngOnInit(): void {
        this.pathValue = primitiveGetValue(this.changes, this.value, this.primitiveInput);
    }
    setValue(newVal) {
        this.setChanges.emit(primitiveSetValue(newVal, this.changes, this.primitiveInput));
    }
}
