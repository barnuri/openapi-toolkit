import { Component, OnInit, Input } from '@angular/core';
import { EditorInput } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-input',
    templateUrl: './editor-input.component.html',
    styleUrls: ['./editor-input.component.css'],
})
export class EditorInputComponent implements OnInit {
    constructor() {}
    @Input() editorInput: EditorInput;
    @Input() getChanges: () => any;
    @Input() setChanges: (val: any) => void;
    @Input() value: any;
    ngOnInit(): void {}
}
