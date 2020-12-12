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
