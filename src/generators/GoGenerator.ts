import { EditorArrayInput } from '../models/editor/EditorArrayInput';
import { EditorInput } from '../models/editor/EditorInput';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { getEditorInput2 } from '../helpers';
import { GeneratorAbstract } from './GeneratorAbstract';
import { EditorObjectInput, EditorPrimitiveInput, OpenApiDefinition } from '../models';
import { camelCase, capitalize } from '../helpers/utilsHelper';

export abstract class GoGenerator extends GeneratorAbstract {
    modelsNamespace = this.options.namepsace + 'Models';
    addNamespace(content: string, extraUsing?: string, customNamespace?: string) {
        customNamespace = customNamespace || this.options.namepsace;
        extraUsing = extraUsing || '';
        const usings = `import (
    "time"
    "context"
    "fmt"
    "net/http"
    "net/url"
    "strings"
    "encoding/json"
    ${this.modelsNamespace} "../models"
    ${extraUsing})
`;
        return 'package ' + customNamespace + '\n\n' + usings + '\n' + content;
    }
    generateObject(objectInput: EditorObjectInput): void {
        if (!this.shouldGenerateModel(objectInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(objectInput) + this.getFileExtension(true));
        const modelFileContent = `type ${this.getFileName(objectInput)} struct {
${this.getObjectProps(objectInput)}
}`
            .trim()
            .replace(/\n\n/, '\n');
        writeFileSync(modelFile, this.addNamespace(modelFileContent, ``, this.modelsNamespace));
    }
    getObjectProps(objectInput: EditorObjectInput) {
        let props = objectInput.properties
            .map(x => ({ displayName: x.name.replace(/\[i\]/g, ''), prop: x }))
            .map(x => `\t ${capitalize(x.displayName)} ${this.getPropDesc(x.prop)} \`json:"${camelCase(x.displayName)},omitempty"\``)
            .join('\n');
        if (objectInput.implements.length > 0) {
            props +=
                '\n' +
                this.allEditorInputs
                    .filter(x => objectInput.implements.includes(x.name) && x.editorType === 'EditorObjectInput')
                    .map(x => this.getObjectProps(x as EditorObjectInput));
        }
        return props;
    }
    getPropDesc(obj: EditorInput | OpenApiDefinition) {
        const editorInput = (obj as EditorInput)?.editorType ? (obj as EditorInput) : getEditorInput2(this.swagger, obj as OpenApiDefinition);
        const fileName = this.getFileName(editorInput);

        if (editorInput.editorType === 'EditorPrimitiveInput') {
            const primitiveInput = editorInput as EditorPrimitiveInput;
            switch (primitiveInput.type) {
                case 'number':
                    if (primitiveInput.openApiDefinition?.type === 'integer') {
                        return primitiveInput.openApiDefinition?.format === 'int64' ? 'int64' : 'int';
                    }
                    return 'float64';
                case 'string':
                    return 'string';
                case 'boolean':
                    return 'bool';
                case 'date':
                    return 'Time';
                case 'enum':
                    if (!fileName) {
                        return 'interface{}';
                    }
                    return `${this.modelsNamespace}.${fileName}Enum`;
            }
        }
        if (editorInput.editorType === 'EditorArrayInput') {
            const arrayInput = editorInput as EditorArrayInput;
            return `[]${this.getPropDesc(arrayInput.itemInput)}`;
        }
        if (editorInput.editorType === 'EditorObjectInput') {
            const objectInput = editorInput as EditorObjectInput;
            if (!objectInput.isDictionary) {
                if (!fileName) {
                    return 'interface{}';
                }
                return `${this.modelsNamespace}.${fileName}`;
            }
            return `map[${objectInput.dictionaryKeyInput ? this.getPropDesc(objectInput.dictionaryKeyInput) : 'interface{}'}]${
                objectInput.dictionaryInput ? this.getPropDesc(objectInput.dictionaryInput) : 'interface{}'
            }`;
        }
    }
    generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): void {
        if (!this.shouldGenerateModel(enumInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(enumInput) + this.getFileExtension(true));
        const isNumberEnum = typeof enumVals[0] === 'number';
        const enumName = `${this.getFileName(enumInput)}Enum`;
        const modelFileContent = `type ${enumName} ${isNumberEnum ? 'int64' : 'string'}
var ${this.getFileName(enumInput)} = struct {
${Object.keys(enumVals)
    .map(x => `\t${x} ${enumName}`)
    .join('\n')}
} {
${Object.keys(enumVals)
    .map(x => `\t${x}: ${isNumberEnum ? enumVals[x] : `"${enumVals[x]}"`}`)
    .join(',\n')}
}`;
        writeFileSync(modelFile, this.addNamespace(modelFileContent, ``, this.modelsNamespace));
    }
    getFileExtension(isModel: boolean) {
        return '.go';
    }
}
