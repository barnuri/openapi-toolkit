import { Component, OnInit } from '@angular/core';
import { ChangesModelDefaultValue, Editor, getEditor, OpenApiDocument } from 'openapi-definition-to-editor';
import openapiSchemaExample from 'openapi-definition-to-editor/src/openapiSchemaExample2.json';

@Component({
    selector: 'app-editors',
    templateUrl: './editors.component.html',
    styleUrls: ['./editors.component.css'],
})
export class EditorsComponent implements OnInit {
    constructor() {}
    editors: Editor[];
    value: any;
    changes: any;
    ngOnInit(): void {
        this.editors = ['DeepMappingSettings'].map(tabName => getEditor((openapiSchemaExample as any) as OpenApiDocument, tabName));
        this.value = {};
        this.changes = ChangesModelDefaultValue;
        console.log(this.editors);
    }
    setChanges(val: any): void {
        val = val || ChangesModelDefaultValue;
        this.changes = { ...val };
        console.log(this.changes);
    }
}
