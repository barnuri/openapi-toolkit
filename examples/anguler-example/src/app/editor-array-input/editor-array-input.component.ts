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
    originalItemsCount: number;
    ngOnInit(): void {
        const originalItems = (jp.query(this.value, '$.' + this.getArrayPath()) as any[]).map(() => ({}));
        this.originalItemsCount = originalItems.length;
        this.items = originalItems || [];
    }
    getName() {
        return getEditorInputName(this.arrayInput).replace('[i]', ``);
    }
    getArrayPath() {
        return this.arrayInput.path.replace('[i]', ``);
    }
    addItem() {
        this.items.push({});
    }
    modifyIndex(i: number) {
        const itemInput = Object.assign({}, this.arrayInput.itemInput);
        itemInput.path = itemInput.path.replace('[i]', `.${i}`);
        return itemInput;
    }
    deleteItem(index: number) {
        this.items[index] = this.items[index] || {};
        this.items[index]['x-editorDeleted'] = true;
        const prefixKey = (i: number) => this.arrayInput.itemInput.path.replace('[i]', `.${i}`);
        // cleanup
        Object.keys(this.changes.$set)
            .filter(key => key.includes(prefixKey(index)))
            .forEach(key => delete this.changes.$set[key]);

        // new item, reorganized indexes
        if (index > this.originalItemsCount - 1) {
            for (let minNewIndexToModify = index + 1; minNewIndexToModify < this.items.length; minNewIndexToModify++) {
                const oldKey = prefixKey(minNewIndexToModify);
                const newKey = prefixKey(minNewIndexToModify - 1);
                Object.keys(this.changes.$set)
                    .filter(key => key.includes(oldKey))
                    .forEach(key => {
                        this.changes.$set[key.replace(oldKey, newKey)] = this.changes.$set[key];
                        delete this.changes.$set[key];
                    });
            }
            this.items.splice(index, 1);
        }
        // existing item
        else {
            this.changes.$unset = { ...this.changes.$unset, [this.getArrayPath()]: '' };
        }
        this.setChanges.emit({ ...this.changes });
    }
}
