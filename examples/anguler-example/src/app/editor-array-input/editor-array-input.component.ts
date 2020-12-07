import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { EditorArrayInput, arrayChildModifyIndex, arrayDeleteItem, arrayItemsCount, arrayIsItemDeleted } from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-array-input',
    templateUrl: './editor-array-input.component.html',
})
export class EditorArrayInputComponent implements OnInit, OnChanges {
    constructor() {}

    @Input() changes: any;
    @Output() setChanges = new EventEmitter();
    @Input() value: any;
    @Input() arrayInput: EditorArrayInput;
    count: number;
    ngOnInit(): void {
        this.count = arrayItemsCount(this.arrayInput, this.value, this.changes);
    }
    getIndexes() {
        return Array.from({ length: this.count }, (x, i) => i);
    }
    addItem() {
        this.count = this.count + 1;
    }
    modifyIndex(index) {
        return arrayChildModifyIndex(index, this.arrayInput);
    }
    deleteItem(index) {
        const res = arrayDeleteItem(index, this.changes, this.value, this.arrayInput, this.count);
        this.count = res.count;
        this.setChanges.emit(res.changes);
    }
    isItemDeleted(index) {
        return arrayIsItemDeleted(this.arrayInput, this.value, this.changes, index);
    }
    ngOnChanges(changes: any): void {
        if (
            changes.arrayInput.currentValue.name === this.arrayInput.name &&
            this.value === changes.value.currentValue &&
            changes.changes.currentValue === this.changes
        ) {
            return;
        }
    }
}
