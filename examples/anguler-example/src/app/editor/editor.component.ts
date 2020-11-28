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
    changes: any;
    getChanges;
    ngOnInit(): void {
        this.changes = {};
    }
    setChanges(val: any): void {
        val = val || {};
        this.changes = { ...this.changes, ...val };
        console.log(this.changes);
    }
}
