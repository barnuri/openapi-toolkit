import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditorInput } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-input',
    template: `
        <app-editor-primitive-input
            [changes]="changes"
            (setChanges)="setChanges.emit($event)"
            [value]="value"
            *ngIf="editorInput.editorType === 'EditorPrimitiveInput'"
            [primitiveInput]="editorInput"
        ></app-editor-primitive-input>
        <app-editor-array-input
            [changes]="changes"
            (setChanges)="setChanges.emit($event)"
            [value]="value"
            *ngIf="editorInput.editorType === 'EditorArrayInput'"
            [arrayInput]="editorInput"
        ></app-editor-array-input>
        <app-editor-object-input
            [changes]="changes"
            (setChanges)="setChanges.emit($event)"
            [value]="value"
            *ngIf="editorInput.editorType === 'EditorObjectInput'"
            [objectInput]="editorInput"
        ></app-editor-object-input>
    `,
})
export class EditorInputComponent implements OnInit {
    constructor() {}
    @Input() editorInput: EditorInput;
    @Input() changes: any;
    @Output() setChanges = new EventEmitter();
    @Input() value: any;
    ngOnInit(): void {}
}
