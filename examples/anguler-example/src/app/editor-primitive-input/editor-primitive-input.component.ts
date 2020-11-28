import { Component, OnInit, Input } from '@angular/core';
import { EditorPrimitiveInput, getEditorInputName } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-primitive-input',
    templateUrl: './editor-primitive-input.component.html',
    styleUrls: ['./editor-primitive-input.component.css'],
})
export class EditorPrimitiveInputComponent implements OnInit {
    constructor() {}
    @Input() changes: any;
    @Input() setChanges: (val: any) => void;
    @Input() value: any;
    @Input() primitiveInput: EditorPrimitiveInput;
    name: string;
    pathValue: any;
    enumOptions: any[];
    ngOnInit(): void {
        this.name = getEditorInputName(this.primitiveInput);
        this.value = this.value || {};
        this.changes = this.changes || {};
        this.pathValue = this.changes[this.primitiveInput.path] || this.value[this.primitiveInput.path] || '';
        this.enumOptions = this.primitiveInput.enumNames || this.primitiveInput.enumValues || [];
    }
    setValue(newVal) {
        this.setChanges({ ...this.changes, [this.primitiveInput.path]: newVal });
    }
}
