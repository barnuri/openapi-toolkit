import { EditorArrayInput } from '../models/editor/EditorArrayInput';
import { EditorInput } from '../models/editor/EditorInput';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { getEditorInput2 } from '../helpers';
import { GeneratorAbstract } from './GeneratorAbstract';
import { EditorObjectInput, EditorPrimitiveInput, OpenApiDefinition } from '../models';
import { capitalize, cleanString } from '../helpers';

export abstract class CSharpGenerator extends GeneratorAbstract {
    addNamespace(content: string, customUsing?: string) {
        const usings =
            customUsing ??
            `using System;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using System.Runtime.Serialization;
using Newtonsoft.Json.Converters;
`;
        return usings + '\n#nullable enable' + '\nnamespace ' + this.options.namespace + '\n{\n\t' + content.replace(/\n/g, '\n\t') + '\n}';
    }
    generateObject(objectInput: EditorObjectInput): void {
        if (!this.shouldGenerateModel(objectInput)) {
            return;
        }
        const modelFile = join(this.modelsFolder, this.getFileName(objectInput) + this.getFileExtension(true));
        const extendStr =
            objectInput.implements.length > 0
                ? `: ${this.options.modelNamePrefix}${objectInput.implements[0]}${this.options.modelNameSuffix.split('.')[0]}`
                : ``;
        const modelFileContent = `public class ${this.getFileName(objectInput)} ${extendStr}\n{
${objectInput.properties
    .map(x => {
        let propName = x.name.replace(/\[i\]/g, '');
        let attributes = `[JsonProperty("${propName}")] `;
        propName = capitalize(propName);
        const propType = this.getPropDesc(x);
        if (objectInput.editorType === 'EditorPrimitiveInput' && propType !== 'object') {
            attributes += `[JsonConverter(typeof(StringEnumConverter))] `
        }
        return `\t ${attributes}public ${this.getPropDesc(x)}${x.nullable || !x.required ? '?' : ''} ${propName} { get; set; }`;
    })
    .join('\n')}
}`;
        writeFileSync(modelFile, this.addNamespace(modelFileContent));
    }
    getPropDesc(obj: EditorInput | OpenApiDefinition) {
        const editorInput = (obj as EditorInput)?.editorType ? (obj as EditorInput) : getEditorInput2(this.swagger, obj as OpenApiDefinition);
        const fileName = this.getFileName(editorInput);

        if (editorInput.editorType === 'EditorPrimitiveInput') {
            const primitiveInput = editorInput as EditorPrimitiveInput;
            switch (primitiveInput.type) {
                case 'number':
                    if (primitiveInput.openApiDefinition?.type === 'integer') {
                        return primitiveInput.openApiDefinition?.format === 'int64' ? 'long' : 'int';
                    }
                    return primitiveInput.openApiDefinition?.format === 'float' ? 'float' : 'double';
                case 'string':
                    return 'string';
                case 'boolean':
                    return 'bool';
                case 'date':
                    return 'DateTime';
                case 'enum':
                    if (!fileName) {
                        return 'object';
                    }
                    return `${fileName}`;
            }
        }
        if (editorInput.editorType === 'EditorArrayInput') {
            const arrayInput = editorInput as EditorArrayInput;
            return `${this.getPropDesc(arrayInput.itemInput)}[]`;
        }
        if (editorInput.editorType === 'EditorObjectInput') {
            const objectInput = editorInput as EditorObjectInput;
            if (!objectInput.isDictionary) {
                if (!fileName) {
                    return 'object';
                }
                return `${fileName}`;
            }
            return `Dictionary<${objectInput.dictionaryKeyInput ? this.getPropDesc(objectInput.dictionaryKeyInput) : 'object'}, ${
                objectInput.dictionaryInput ? this.getPropDesc(objectInput.dictionaryInput) : 'object'
            }>`;
        }
    }
    generateEnum(enumInput: EditorPrimitiveInput, enumVals: { [name: string]: string | number }): void {
        if (!this.shouldGenerateModel(enumInput)) {
            return;
        }
        const enumValsAgg = [];
        const enumKeys = Object.keys(enumVals);
        const cleanNameCounter = {};
        for (let index = 0; index < enumKeys.length; index++) {
            const enumKey = enumKeys[index];
            let enumCleanName = cleanString(this.getEnumValueName(enumKey)).replace(/"/g, "");
            const enumAssignment = typeof enumVals[enumKey] === 'number' ? ` = ${enumVals[enumVals[enumKey]]}` : ``;
            if (cleanNameCounter[enumCleanName] === undefined) {
                cleanNameCounter[enumCleanName] = 0;
            }
            let cleanNameSuffix = '';
            if (cleanNameCounter[enumCleanName] > 0) {
                cleanNameSuffix = cleanNameCounter[enumCleanName];
            }
            cleanNameCounter[enumCleanName]++;
            enumValsAgg.push({ 
                index, 
                enumCleanName: `${enumCleanName}${cleanNameSuffix}`,
                enumAssignment, 
                realValue: enumVals[enumKey]
            });
        }
        const modelFile = join(this.modelsFolder, this.getFileName(enumInput) + this.getFileExtension(true));
        const modelFileContent = `public enum ${this.getFileName(enumInput)} 
{
${enumValsAgg
    .map(x => {
        const attributes = `[EnumMember(Value = "${x.realValue}")]`;
        return `\t${attributes}${x.enumCleanName}${x.enumAssignment}`;
    })
    .join(',\n')}
}`;
        writeFileSync(modelFile, this.addNamespace(modelFileContent));
    }
    getFileExtension(isModel: boolean) {
        return '.cs';
    }
}
