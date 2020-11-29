import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditorInput } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-input',
    templateUrl: './editor-input.component.html',
    styleUrls: ['./editor-input.component.css'],
})
export class EditorInputComponent implements OnInit {
    constructor() {}
    @Input() editorInput: EditorInput;
    @Input() changes: any;
    @Output() setChanges = new EventEmitter();
    @Input() value: any;
    ngOnInit(): void {}
}
