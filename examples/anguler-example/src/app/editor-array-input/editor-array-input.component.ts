import { Component, OnInit, OnChanges, Output, Input, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import {
    EditorArrayInput,
    arrayChildModifyIndex,
    arrayIsItemDeleted,
    arrayDeleteItem,
    arrayKeyPrefix,
    arrayGetIndexes,
    changesSetValue,
    ChangesModel,
    arrayOriginalItemsCount,
    arrayAddItem,
    arrayItemsCount,
} from 'openapi-definition-to-editor';

@Component({
    selector: 'app-editor-array-input',
    templateUrl: './editor-array-input.component.html',
    styleUrls: ['./editor-array-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorArrayInputComponent {
    @Output() onDelete = new EventEmitter<void>();
    @Input() arrayInput: EditorArrayInput;
    @Input() changes: ChangesModel;
    @Input() value: any;
    @Input() isChild: boolean;
    @Input() customName: string;
    @Output() setChanges = new EventEmitter();
    insertText = '';
    getIndexes = () => {
        return arrayGetIndexes(this.arrayInput, this.changes, this.value);
    }
    modifyIndex = (index: number) => {
        return arrayChildModifyIndex(index, this.arrayInput);
    }
    deleteItem = (index: number) => {
        const res = arrayDeleteItem(index, this.changes, this.value, this.arrayInput);
        this.setChanges.emit(res);
    }
    isItemDeleted = (index: number) => {
        return arrayIsItemDeleted(this.arrayInput, this.value, this.changes, index);
    }
    isNewItem = (index: number) => {
        return index > arrayOriginalItemsCount(this.arrayInput, this.value) - 1;
    }
    addObjectItem = () => {
        this.setChanges.emit(arrayAddItem(this.arrayInput, this.changes, this.value));
    }
    addItem = event => {
        const insertedText = event.currentTarget.value;
        if (insertedText === '') {
            return;
        }
        let changes = JSON.parse(JSON.stringify(this.changes));
        const newIndex = arrayItemsCount(this.arrayInput, this.value, changes);
        const key = arrayKeyPrefix(newIndex, this.arrayInput);
        changes = arrayAddItem(this.arrayInput, changes, this.value);
        changes = changesSetValue(insertedText, changes, key);
        this.setChanges.emit(changes);
        event.currentTarget.value = '';
    }
    isCurrentlyEmpty = () => {
        const indexes = this.getIndexes();
        const editorDeletedItems = indexes.filter(index => arrayIsItemDeleted(this.arrayInput, this.value, this.changes, index)).length;
        return indexes.length - editorDeletedItems <= 0;
    }
}
