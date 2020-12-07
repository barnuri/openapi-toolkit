import { EditorArrayInput } from '../models';
import getArrayPath from './getArrayPath';
import * as jp from 'jsonpath';

export default (arrayInput: EditorArrayInput, value: any) => {
    try {
        return (jp.query(value, '$.' + getArrayPath(arrayInput)) as any[]).length
    }
    catch {
        return 0;
    }
};
