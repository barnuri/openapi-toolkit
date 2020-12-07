import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditorPrimitiveInput } from 'openapi-definition-to-editor';
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
    ngOnInit(): void {
    }
}
