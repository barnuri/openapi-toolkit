import { Component, OnInit, Input, Output, EventEmitter, OnChanges, ChangeDetectionStrategy } from '@angular/core';
import { Editor, ChangesModel } from 'openapi-toolkit';

@Component({
    selector: 'app-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorComponent {
    @Input() editor: Editor;
    @Input() changes: ChangesModel;
    @Input() value: any;
    @Input() isChild: boolean;
    @Input() customName: string;
    @Output() setChanges = new EventEmitter();
}
