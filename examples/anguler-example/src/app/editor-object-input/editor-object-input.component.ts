import { Component, OnInit, Output, EventEmitter, Input, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { objectGetSelectedSwitchable, EditorObjectInput, objectSetSelectedSwitchable, ChangesModel } from 'openapi-tools';

@Component({
    selector: 'app-editor-object-input',
    templateUrl: './editor-object-input.component.html',
    styleUrls: ['./editor-object-input.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorObjectInputComponent implements OnInit {
    @Output() onDelete = new EventEmitter<void>();
    @Input() objectInput: EditorObjectInput;
    @Input() changes: ChangesModel;
    @Input() value: any;
    @Input() isChild: boolean;
    @Input() customName: string;
    @Output() setChanges = new EventEmitter();

    ngOnInit() {
        this.objectInput.properties = this.objectInput.properties || [];
        this.objectInput.switchableOptions = this.objectInput.switchableOptions || [];
        this.objectInput.switchableObjects = this.objectInput.switchableObjects || [];
    }

    getSwitchableSelected = () => {
        return objectGetSelectedSwitchable(this.objectInput, this.value, this.changes);
    };
    setSwitchableSelected = (val: string) => {
        this.setChanges.emit(objectSetSelectedSwitchable(this.objectInput, this.changes, val));
    };
}
