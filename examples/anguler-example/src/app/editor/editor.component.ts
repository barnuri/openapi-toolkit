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
    ngOnInit(): void {
        this.changes = {};
    }
    setChanges(val: any): void {
        val = val || {};
        this.changes = { ...val };
        console.log(this.changes);
    }
    getChanges() {
        this.changes = this.changes || {};
        return this.changes;
    }
}
