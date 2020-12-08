import { Component, OnInit, OnChanges, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { EditorInput, ChangesModel } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-input',
    template: `
        <app-editor-primitive-input
            [changes]="changes"
            [isChild]="isChild"
            [value]="value"
            *ngIf="editorInput.editorType === 'EditorPrimitiveInput'"
            [primitiveInput]="editorInput"
            [id]="editorInput.path"
            [customName]="customName"
            (setChanges)="setChanges.emit($event)"
        ></app-editor-primitive-input>
        <app-editor-array-input
            [changes]="changes"
            [isChild]="isChild"
            [value]="value"
            *ngIf="editorInput.editorType === 'EditorArrayInput'"
            [arrayInput]="editorInput"
            [id]="editorInput.path"
            [customName]="customName"
            (setChanges)="setChanges.emit($event)"
        ></app-editor-array-input>
        <app-editor-object-input
            [changes]="changes"
            [isChild]="isChild"
            [value]="value"
            *ngIf="editorInput.editorType === 'EditorObjectInput'"
            [objectInput]="editorInput"
            [id]="editorInput.path"
            [customName]="customName"
            (setChanges)="setChanges.emit($event)"
        ></app-editor-object-input>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditorInputComponent {
    @Input() editorInput: EditorInput;
    @Input() changes: ChangesModel;
    @Input() value: any;
    @Input() isChild: boolean;
    @Input() customName: string;
    @Output() setChanges = new EventEmitter();
}
