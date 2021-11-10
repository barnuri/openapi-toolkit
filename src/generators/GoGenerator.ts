import { EditorArrayInput } from '../models/editor/EditorArrayInput';
import { EditorInput } from '../models/editor/EditorInput';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { getEditorInput2 } from '../helpers';
import { GeneratorAbstract } from './GeneratorAbstract';
import { EditorObjectInput, EditorPrimitiveInput, OpenApiDefinition } from '../models';
import { camelCase, capitalize } from '../helpers/utilsHelper';

export abstract class GoGenerator extends GeneratorAbstract {
    generateClient(): void {
        writeFileSync(this.options.output + '/go.mod', `module ${this.options.namepsace}\n\ngo 1.17`);
    }
    addNamespace(content: string, customUsing?: string, extraUsing?: string) {
        const usings = customUsing
            ? customUsing
            : `import (
    "time"
    "context"
    "fmt"
    "net/http"
    "net/url"
    "strings"
	"strconv"
    "encoding/json"${extraUsing || ''}
)

var _, _, _, _, _, _, _, _ = time.ANSIC, fmt.Errorf, context.Canceled, strings.Builder{}, json.Compact, http.Client{}, url.Parse, strconv.FormatBool
`;
        return 'package ' + this.options.namepsace + '\n\n' + usings + '\n' + content;
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
        writeFileSync(modelFile, this.addNamespace(modelFileContent));
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
    getPropDesc(obj: EditorInput | OpenApiDefinition, modelModule?: string) {
        modelModule = modelModule ? `${modelModule}.`.replace('..', '.') : ``;
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
                    return 'time.Time';
                case 'enum':
                    if (!fileName) {
                        return 'interface{}';
                    }
                    return `${modelModule}${fileName}Enum`;
            }
        }
        if (editorInput.editorType === 'EditorArrayInput') {
            const arrayInput = editorInput as EditorArrayInput;
            return `[]${this.getPropDesc(arrayInput.itemInput, modelModule)}`;
        }
        if (editorInput.editorType === 'EditorObjectInput') {
            const objectInput = editorInput as EditorObjectInput;
            if (!objectInput.isDictionary) {
                if (!fileName) {
                    return 'interface{}';
                }
                return `${modelModule}${fileName}`;
            }
            return `map[${objectInput.dictionaryKeyInput ? this.getPropDesc(objectInput.dictionaryKeyInput, modelModule) : 'interface{}'}]${
                objectInput.dictionaryInput ? this.getPropDesc(objectInput.dictionaryInput, modelModule) : 'interface{}'
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
    .join(',\n')},
}`;
        writeFileSync(modelFile, this.addNamespace(modelFileContent));
    }
    getFileExtension(isModel: boolean) {
        return '.go';
    }
    getFileName(editorInput: EditorInput) {
        return capitalize(super.getFileName(editorInput) || '');
    }
}
