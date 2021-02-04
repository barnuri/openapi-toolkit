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

export function jsonPath(json: any, path: string) {
    try {
        const JSONPath = require('jsonpath-plus');
        return JSONPath({ json, path });
    } catch {
        try {
            var jp = require('simple-jsonpath');
            return jp.query(json, path);
        } catch {
            var jp = require('jsonpath');
            return jp.query(json, path);
        }
    }
}

export function findPropsByValue(val: any, search: string | number | boolean | Date | any, prefix: string = ''): string[] {
    prefix = prefix || '';
    let res: string[] = [];
    if (val.isArray()) {
        for (let i = 0; i < val.length; i++) {
            res = [...res, ...findPropsByValue(val[i], search, `${prefix}[${i}].`)];
        }
    } else if (typeof val === 'object' && val !== null) {
        for (const key of Object.keys(val)) {
            prefix = !prefix ? '' : `${prefix}.`;
            res = [...res, ...findPropsByValue(val[key], search, `${prefix}${key}.`)];
        }
    } else {
        res = [...res, prefix];
    }
    return res;
}
