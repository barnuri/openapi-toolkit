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

const isMatch = (val, search) => {
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

export function distinct<T>(arr: T[]) {
    return [...new Set(arr)];
}

export function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
