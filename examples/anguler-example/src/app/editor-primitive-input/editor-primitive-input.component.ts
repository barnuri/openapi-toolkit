import { Component, OnInit, OnChanges, Input, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { EditorPrimitiveInput, primitiveSetValue, primitiveGetValue, ChangesModel } from 'openapi-definition-to-editor';
@Component({
    selector: 'app-editor-primitive-input',
    templateUrl: './editor-primitive-input.component.html',
    styleUrls: ['./editor-primitive-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorPrimitiveInputComponent implements OnInit {
    @Input() changes: ChangesModel;
    @Input() value: any;
    @Input() isChild: boolean;
    @Input() customName: string;
    @Output() setChanges = new EventEmitter();
    pathValue: any;
    @Input() primitiveInput: EditorPrimitiveInput;
    constructor() {}

    ngOnInit() {
        this.pathValue = primitiveGetValue(this.changes, this.value, this.primitiveInput) || '';
    }

    setValue = newVal => {
        this.setChanges.emit(primitiveSetValue(newVal, this.changes, this.primitiveInput));
    }
}
