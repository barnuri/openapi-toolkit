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
    changes: any;
    ngOnInit(): void {
        this.changes = { $set: {}, $unset: {} };
        this.value = this.value || {};
    }
    setChanges(val: any): void {
        val = val || { $set: {}, $unset: {} };
        this.changes = { ...val };
        console.log(this.changes);
    }
    getChanges() {
        this.changes = this.changes || { $set: {}, $unset: {} };
        return this.changes;
    }
}
