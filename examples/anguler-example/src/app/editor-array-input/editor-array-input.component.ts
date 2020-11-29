import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditorArrayInput, getEditorInputName } from 'openapi-definition-to-editor';
import * as jp from 'jsonpath';

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
    items: any[] = [];
    name: string;
    arrayPath: string;
    originalItemCount: number;
    ngOnInit(): void {
        this.arrayPath = this.arrayInput.path.replace('[i]', ``);
        const originalItems = (jp.query(this.value, '$.' + this.arrayPath) as any[]).map(() => ({}));
        this.originalItemCount = originalItems.length;
        this.items = originalItems || [];
        this.name = getEditorInputName(this.arrayInput).replace('[i]', ``);
    }
    deleteItem(index: number) {
        this.items[index] = this.items[index] || {};
        this.items[index]['x-editorDeleted'] = true;
        const prefixKey = this.arrayInput.itemInput.path.replace('[i]', `[${index}]`);
        const changes = this.changes;
        Object.keys(changes)
            .filter(key => key.includes(prefixKey))
            .forEach(key => delete changes[key]);

        // existing item
        if (index <= this.originalItemCount - 1) {
            changes[prefixKey + '.x-editorDeleted'] = true;
        }

        this.setChanges.emit({ ...changes });
    }
    addItem() {
        this.items.push({ 'x-editorDeleted': false });
    }
    modifyIndex(i: number) {
        const itemInput = Object.assign({}, this.arrayInput.itemInput);
        itemInput.path = itemInput.path.replace('[i]', `[${i}]`);
        return itemInput;
    }
}
