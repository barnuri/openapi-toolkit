import { OpenApiPathParamInVals } from './../models/openapi/OpenApiDocument';
import { OpenApiDefinition, OpenApiDocument, OpenApiDefinitionReference, OpenApiDefinitionObject, OpenApiDefinitionsDictionary, ApiPath } from '../models';

export function getOpenApiDefinitionObject(
    definition: OpenApiDefinition,
    definitions: OpenApiDefinitionsDictionary,
): { def: OpenApiDefinitionObject; refName: string | undefined } {
    definition = definition || {};
    definitions = definitions || {};
    if (Object.keys(definition).includes('$ref')) {
        const refName = (definition as OpenApiDefinitionReference).$ref.split('/').splice(-1)[0];
        return { def: definitions[refName], refName };
    }
    if (Object.keys(definition).includes('oneOf')) {
        const openApiDefinitionObject = (definition as OpenApiDefinitionObject).oneOf!.filter((x: any) => x.type != 'null')[0];
        return getOpenApiDefinitionObject(openApiDefinitionObject, definitions);
    }
    return { def: definition as OpenApiDefinitionObject, refName: undefined };
}

export function getOpenApiDefinitionObjectProps(
    definitionObj: OpenApiDefinitionObject,
    includeInheritProps: boolean,
    definitions: OpenApiDefinitionsDictionary,
): { [propName: string]: OpenApiDefinition } {
    definitionObj = definitionObj || {};
    const props = definitionObj.properties || ({} as any);
    const props2 = (((definitionObj.allOf || []).filter(x => Object.keys(x).includes('properties'))[0] as OpenApiDefinitionObject) || {}).properties;
    let inheritProps = {};
    if (includeInheritProps && definitionObj['x-ignore-inherit'] !== true) {
        const refsObjs = (definitionObj.allOf || []).filter(x => Object.keys(x).includes('$ref')).map(x => getOpenApiDefinitionObject(x, definitions));
        for (const x of refsObjs) {
            inheritProps = { ...getOpenApiDefinitionObjectProps(x.def, true, definitions) };
        }
    }
    return {
        ...inheritProps,
        ...props2,
        ...props,
    };
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
            paths.push({
                controller: (methodDetails.tags || []).find(_ => true) || 'Default',
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
