import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Editor } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
})
export class EditorComponent implements OnInit {
    constructor() {}
    @Input() editor: Editor;
    @Input() value: any;
    @Input() changes: any;
    @Output() setChanges = new EventEmitter();
    ngOnInit(): void {}
}
