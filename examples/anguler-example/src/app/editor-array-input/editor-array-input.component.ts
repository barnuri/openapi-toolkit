import { Component, OnInit, Input } from '@angular/core';
import { EditorArrayInput, getEditorInputName } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-array-input',
    templateUrl: './editor-array-input.component.html',
    styleUrls: ['./editor-array-input.component.css'],
})
export class EditorArrayInputComponent implements OnInit {
    constructor() {}
    @Input() getChanges: () => any;
    @Input() setChanges: (val: any) => void;
    @Input() value: any;
    @Input() arrayInput: EditorArrayInput;
    items: any[] = [];
    name: string;
    arrayPath: string;
    ngOnInit(): void {
        this.arrayPath = this.arrayInput.path.replace('[i]', ``);
        this.items = this.value[this.arrayPath] || [];
        this.name = getEditorInputName(this.arrayInput).replace('[i]', ``);
    }
    deleteItem(index: number) {
        this.items[index] = this.items[index] || {};
        this.items[index]['x-editorDeleted'] = true;
        const prefixKey = this.arrayInput.itemInput.path.replace('[i]', `[${index}]`);
        const changes = this.getChanges();
        Object.keys(changes)
            .filter(key => key.includes(prefixKey))
            .forEach(key => delete changes[key]);
        this.setChanges({ ...changes });
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