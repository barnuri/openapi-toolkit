import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditorArrayInput, getEditorInputName } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-array-input',
    templateUrl: './editor-array-input.component.html',
    styleUrls: ['./editor-array-input.component.css'],
})
export class EditorArrayInputComponent implements OnInit {
    constructor() {}
    @Input() changes: any;
    @Output() setChanges = new EventEmitter();
    @Input() value: any;
    @Input() arrayInput: EditorArrayInput;
    count: number;
    ngOnInit(): void {
        this.count = [].length;
    }
    addItem() {
        this.count = this.count + 1;
    }
}
