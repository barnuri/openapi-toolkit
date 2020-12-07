import { Component, OnInit, Input } from '@angular/core';
import { Editor } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css'],
})
export class EditorComponent implements OnInit {
    constructor() {}
    @Input() editor: Editor;
    @Input() value: any;
    @Input() changes: any;
    ngOnInit(): void {
    }
}
