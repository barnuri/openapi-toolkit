import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EditorArrayInput, arrayChildModifyIndex, arrayDeleteItem, arrayItemsCount, arrayIsItemDeleted } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-array-input',
    templateUrl: './editor-array-input.component.html',
})
export class EditorArrayInputComponent implements OnInit {
    constructor() {}
    @Input() changes: any;
    @Output() setChanges = new EventEmitter();
    @Input() value: any;
    @Input() arrayInput: EditorArrayInput;
    indexes: number[];
    ngOnInit(): void {
        this.indexes = Array.from({ length: arrayItemsCount(this.arrayInput, this.value, this.changes) }, (x, i) => i);
    }
    addItem() {
        this.indexes.push(this.indexes.length);
    }
    modifyIndex(index) {
        return arrayChildModifyIndex(index, this.arrayInput);
    }
    deleteItem(index) {
        this.setChanges.emit(arrayDeleteItem(index, this.changes, this.value, this.arrayInput));
    }
    isItemDeleted(index) {
        return arrayIsItemDeleted(this.arrayInput, this.value, this.changes, index);
    }
}
