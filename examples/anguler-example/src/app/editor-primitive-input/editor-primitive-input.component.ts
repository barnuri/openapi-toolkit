import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditorPrimitiveInput, getEditorInputName } from 'openapi-definition-to-editor';
import * as jp from 'jsonpath';

@Component({
    selector: 'app-editor-primitive-input',
    templateUrl: './editor-primitive-input.component.html',
    styleUrls: ['./editor-primitive-input.component.css'],
})
export class EditorPrimitiveInputComponent implements OnInit {
    constructor() {}
    @Input() changes: any;
    @Output() setChanges = new EventEmitter();
    @Input() value: any;
    @Input() primitiveInput: EditorPrimitiveInput;
    pathValue: any;
    enumOptions: any[];
    ngOnInit(): void {
        this.value = this.value || {};
        this.pathValue = this.changes.$set[this.primitiveInput.path] ?? jp.query(this.value, '$.' + this.primitiveInput.path) ?? '';
        this.enumOptions = this.primitiveInput.enumNames || this.primitiveInput.enumValues || [];
    }
    setValue(newVal) {
        this.setChanges.emit({ $set: { ...this.changes.$set, [this.primitiveInput.path]: newVal }, $unset: this.changes.$unset });
    }
    getName() {
        return getEditorInputName(this.primitiveInput);
    }
}
