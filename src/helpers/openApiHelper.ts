import { OpenApiPathParamInVals } from './../models/openapi/OpenApiDocument';
import { OpenApiDefinition, OpenApiDocument, OpenApiDefinitionReference, OpenApiDefinitionObject, OpenApiDefinitionsDictionary, ApiPath } from '../models';
import { cleanString, jsonPath } from '../helpers/utilsHelper';

export function getOpenApiDefinitionObject(
    openApiDocument: OpenApiDocument,
    definition: OpenApiDefinition,
    definitions: OpenApiDefinitionsDictionary,
): { def: OpenApiDefinitionObject; refName: string | undefined; ignoreInherit: boolean } {
    definition = definition || {};
    definitions = definitions || {};
    const ignoreInherit = definition['x-ignore-inherit'] === true;
    if (Object.keys(definition).includes('$ref')) {
        const refPath = (definition as OpenApiDefinitionReference).$ref;
        if (refPath.includes('/anyOf/') || refPath.includes('/oneOf/') || refPath.includes('/allOf/')) {
            const refJsonPath = refPath.trim('#').replace(/\//g, '.');
            let def = jsonPath(openApiDocument, refJsonPath);
            if (Object.keys(definition).includes('$ref')) {
                return getOpenApiDefinitionObject(openApiDocument, def, definitions);
            }
            return { def, refName: def.title, ignoreInherit };
        } else {
            return { def: definitions[refName], refName: refPath.split('/').splice(-1)[0], ignoreInherit };
        }
    }
    if (Object.keys(definition).includes('oneOf')) {
        const openApiDefinitionObject = (definition as OpenApiDefinitionObject).oneOf!.filter((x: any) => x.type != 'null')[0];
        return getOpenApiDefinitionObject(openApiDocument, openApiDefinitionObject, definitions);
    }
    return { def: definition as OpenApiDefinitionObject, refName: undefined, ignoreInherit };
}

export function getOpenApiDefinitionObjectProps(
    openApiDocument: OpenApiDocument,
    definitionObj: OpenApiDefinitionObject,
    includeInheritProps: boolean,
    definitions: OpenApiDefinitionsDictionary,
): { [propName: string]: OpenApiDefinition } {
    return getOpenApiDefinitionPropGetter(
        openApiDocument,
        definitionObj,
        includeInheritProps,
        definitions,
        def => (def as OpenApiDefinitionObject)?.properties || {},
        'object',
    ) as any;
}

export function getOpenApiDefinitionPropGetter<T>(
    openApiDocument: OpenApiDocument,
    definitionObj: OpenApiDefinitionObject,
    includeInheritProps: boolean,
    definitions: OpenApiDefinitionsDictionary,
    getter: (definition: OpenApiDefinition) => T,
    getterType: 'array' | 'object' | 'primitive',
): T {
    definitionObj = definitionObj || {};
    const defaultVal: any = getterType === 'object' ? {} : [];
    const vals = getter(definitionObj);
    const combineVals: any = (a: T, b: T) => (getterType === 'object' ? { ...a, ...b } : getterType === 'array' ? [...(a as any), ...(b as any)] : [a, b]);
    let vals2 = defaultVal;
    for (const def of definitionObj.allOf || []) {
        vals2 = combineVals(vals2, getter(def));
    }
    let inheritVals = defaultVal;
    if (includeInheritProps) {
        const refsObjs = (definitionObj.allOf || []).filter(x => Object.keys(x).includes('$ref')).map(x => getOpenApiDefinitionObject(openApiDocument, x, definitions));
        for (const x of refsObjs) {
            inheritVals = combineVals(inheritVals, getOpenApiDefinitionPropGetter(openApiDocument, x.def, true, definitions, getter, getterType));
        }
    }
    return combineVals(combineVals(inheritVals, vals2), vals);
}

export function getApiPaths(openApiDocument: OpenApiDocument): ApiPath[] {
    const paths: ApiPath[] = [];
    const docPaths = openApiDocument.paths || {};
    for (const path of Object.keys(docPaths)) {
        const pathMethods = docPaths[path] || {};
        for (const method of Object.keys(pathMethods)) {
            const methodDetails = pathMethods[method];
            const parameters = methodDetails.parameters || [];
            const getParamsByType = (type: OpenApiPathParamInVals) =>
                parameters.filter(x => x.in === type).map(x => ({ name: x.name, schema: x.schema, require: x.required }));
            const oldBody = getParamsByType('body').find(_ => true);
            const body = methodDetails.requestBody;
            let response = (methodDetails.responses || {})['200'] || {};
            let controller = ((methodDetails.tags || []).find(_ => true) || 'Default').trim();
            controller = cleanString(controller);
            paths.push({
                controller,
                method,
                path,
                body: {
                    schema: Object.values(body?.content || {}).find(_ => true)?.schema || oldBody?.schema || {},
                    required: body?.required || oldBody?.require || false,
                    haveBody: body !== undefined || oldBody !== undefined,
                },
                queryParams: getParamsByType('query'),
                headerParams: getParamsByType('header'),
                cookieParams: getParamsByType('cookie'),
                pathParams: getParamsByType('path'),
                response: Object.values(response.content || {}).find(_ => true)?.schema || response.schema || {},
            });
        }
    }
    return paths;
}
