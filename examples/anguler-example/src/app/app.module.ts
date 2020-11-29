import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { EditorInputComponent } from './editor-input/editor-input.component';
import { EditorComponent } from './editor/editor.component';
import { EditorObjectInputComponent } from './editor-object-input/editor-object-input.component';
import { EditorArrayInputComponent } from './editor-array-input/editor-array-input.component';
import { EditorPrimitiveInputComponent } from './editor-primitive-input/editor-primitive-input.component';
import { EditorsComponent } from './editors/editors.component';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        AppComponent,
        EditorComponent,
        EditorInputComponent,
        EditorObjectInputComponent,
        EditorArrayInputComponent,
        EditorPrimitiveInputComponent,
        EditorsComponent,
    ],
    imports: [BrowserModule, CommonModule],
    providers: [],
    bootstrap: [AppComponent],
    schemas: [],
})
export class AppModule {}
