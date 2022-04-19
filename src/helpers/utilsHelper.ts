import swaggerUpgrade = require('swagger2openapi');
import JSONPath = require('jsonpath-plus');
import { OpenApiDocument } from '../index';

const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
const reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

const dateParser = function (key, value) {
    try {
        if (typeof value === 'string') {
            if (reISO.exec(value)) {
                return new Date(value);
            }
            const match = reMsAjax.exec(value);
            if (match) {
                var matchSplit = match[1].split(/[-+,.]/);
                return new Date(matchSplit[0] ? +matchSplit[0] : 0 - +matchSplit[1]);
            }
        }
        return value;
    } catch {
        return value;
    }
};

export function cloneHelper<T>(value: T): T {
    return JSON.parse(JSON.stringify(value), dateParser);
}

function my_json_path(json: any, jpath_expression: string): any {
    const propsNames = jpath_expression.replace('$.', '').split('.');
    let currentPoint = json;
    for (const propName of propsNames) {
        let modifiedPropName = propName;
        // handle list
        if (modifiedPropName.includes('[') && modifiedPropName.includes(']')) {
            while (modifiedPropName.includes('[') && modifiedPropName.includes(']')) {
                const endOfPropName = modifiedPropName.indexOf('[');
                const endOfArrayIndex = modifiedPropName.indexOf(']');
                const arrayIndex = +modifiedPropName.substring(endOfPropName + 1, endOfArrayIndex);
                modifiedPropName = modifiedPropName.substring(0, endOfPropName);
                currentPoint = currentPoint.get(modifiedPropName);
                if (currentPoint == undefined || Array.isArray(currentPoint) || (currentPoint as any[]).length < arrayIndex + 1) {
                    return undefined;
                }
                currentPoint = currentPoint[arrayIndex];
            }
        }
        // prop without list
        else {
            currentPoint = currentPoint[modifiedPropName];
            if (!currentPoint) {
                return currentPoint;
            }
        }
    }
    return currentPoint;
}

export function jsonPath(json: any, jpath_expression: string): any {
    try {
        return my_json_path(json, jpath_expression.toString());
    } catch {
        return JSONPath.JSONPath({ json, path: jpath_expression })[0];
    }
}

const isMatch = (val, search): boolean => {
    try {
        const valStr = val.toString().trim().toLowerCase();
        const searchStr = search.toString().trim().toLowerCase();
        return val == search || searchStr == valStr || valStr.includes(searchStr);
    } catch {
        return val == search;
    }
};

export function findPropsByValue(val: any, search: string | number | boolean | Date | any, prefix: string = ''): string[] {
    prefix = prefix || '';
    let res: string[] = [];
    if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) {
            res = [...res, ...findPropsByValue(val[i], search, `${prefix}[${i}]`)];
        }
    } else if (typeof val === 'object' && val !== null) {
        for (const key of Object.keys(val)) {
            res = [...res, ...findPropsByValue(val[key], search, `${!prefix ? '' : `${prefix}.`}${key}`)];
        }
    } else if (isMatch(val, search) && prefix && prefix.length > 0) {
        res = [...res, prefix];
    }
    return res;
}

export function distinct<T>(arr: T[]): T[] {
    return [...new Set(arr)];
}

export function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export function camelCase(str: string) {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '');
}

export async function upgradeSwaggers(swaggers: OpenApiDocument[]): Promise<OpenApiDocument[]> {
    const promises: Promise<OpenApiDocument>[] = [];
    for (const swagger of swaggers) {
        promises.push(
            new Promise((resolve, reject) => {
                if (swagger.openapi || `${swagger.openapi}`.startsWith('3.')) {
                    resolve(swagger as any as OpenApiDocument);
                    return;
                }
                swaggerUpgrade.convertObj(swagger, {}, function (err, options) {
                    if (err) {
                        reject(err);
                    }
                    resolve(options.openapi as any as OpenApiDocument);
                });
            }),
        );
    }
    return await Promise.all(promises);
}

export async function mergeSwaggers(swaggers: OpenApiDocument[]): Promise<OpenApiDocument> {
    swaggers = await upgradeSwaggers(swaggers);
    let finalSwagger = swaggers[0];
    prepareSwagger(finalSwagger);
    for (const swagger of swaggers.slice(1)) {
        prepareSwagger(swagger);
        finalSwagger.components!.schemas = { ...finalSwagger.components!.schemas, ...swagger.components!.schemas, ...swagger.definitions };
        finalSwagger.components!.securitySchemes = { ...finalSwagger.components!.securitySchemes, ...swagger.components!.securitySchemes };
        finalSwagger.security = [ ...finalSwagger.security!, ...swagger.security! ];
        finalSwagger.tags = [ ...finalSwagger.tags!, ...swagger.tags! ];
        finalSwagger.paths = { ...finalSwagger.paths!, ...swagger.paths! };
    }
    return finalSwagger;
}

const prepareSwagger = (swagger: OpenApiDocument): OpenApiDocument => {
    swagger.components = swagger.components || {};
    swagger.components.schemas = swagger.components.schemas || {};
    swagger.components.securitySchemes = swagger.components.securitySchemes || {};
    swagger.security = swagger.security || [];
    swagger.tags = swagger.tags || [];
    swagger.paths = swagger.paths || {};
    swagger.definitions = swagger.definitions || {};
    return swagger;
};
