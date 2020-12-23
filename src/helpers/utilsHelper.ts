try {
    if (JSON && !(JSON as any).dateParser) {
        const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
        const reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;
        (JSON as any).dateParser = function (key, value) {
            try {
                if (typeof value === 'string') {
                    var a = reISO.exec(value);
                    if (a) return new Date(value);
                    a = reMsAjax.exec(value);
                    if (a) {
                        var b = a[1].split(/[-+,.]/);
                        return new Date(b[0] ? +b[0] : 0 - +b[1]);
                    }
                }
                return value;
            } catch {
                return value;
            }
        };
    }
} catch (e) {
    console.log(e);
}

export function cloneHelper<T>(value: T): T {
    return JSON.parse(JSON.stringify(value, (JSON as any).dateParser));
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
