import { Editor, editorFilterUnkownPaths, findPropsByValue, getAllEditorInputsByEditors } from '../index';

export interface SearchResult {
    searchResults: SearchMatch[];
    resultsCount: number;
}

export interface SearchMatch {
    tab: string;
    results: string[][];
}

interface SearchPartialMatch {
    [editorName: string]: string[];
}

export function searchValueInEditors(searchText: string, editors: Editor[], configValue: any): SearchResult {
    if (!searchText) {
        return { resultsCount: 0, searchResults: [] };
    }
    const results: SearchMatch[] = [];
    const resByPropName = searchByPropName(searchText, editors);
    const resByPropValue = searchByPropValue(searchText, editors, configValue);
    const mergedRes = mergeSearchResults(resByPropName, resByPropValue);
    const onlyUnique = (value, index, self) => self.indexOf(value) === index;
    for (const editorName of Object.keys(mergedRes)) {
        if (mergedRes[editorName].length > 0) {
            const matches = mergedRes[editorName].filter(onlyUnique).map(path => path.split('.'));
            results.push({ tab: editorName, results: matches });
        }
    }
    return { searchResults: results, resultsCount: results.reduce((acc, current) => acc + current.results.length, 0) };
}

function searchByPropName(propName: string, editors: Editor[]): SearchPartialMatch {
    const res: SearchPartialMatch = {};
    const propNameSearch = propName.trim().toLowerCase();
    for (const editor of editors) {
        const inputs = getAllEditorInputsByEditors([editor]);
        const matches = inputs.filter(x => (x.name || '').toLowerCase().includes(propNameSearch));
        res[editor.name] = matches.map(x => `by prop: ${x.path}`);
    }
    return res;
}

function searchByPropValue(valueToFind: any, editors: Editor[], configValue: any): SearchPartialMatch {
    const propsPaths = findPropsByValue(configValue, valueToFind);
    const res: SearchPartialMatch = {};
    for (const editor of editors) {
        res[editor.name] = editorFilterUnkownPaths(editor, propsPaths).map(x => `by value: ${x}`);
    }
    return res;
}

function mergeSearchResults(res1: SearchPartialMatch, res2: SearchPartialMatch) {
    const editorNames = [...Object.keys(res1), ...Object.keys(res2)];
    const res: SearchPartialMatch = {};
    for (const editorName of editorNames) {
        res[editorName] = [...(res1[editorName] || []), ...(res2[editorName] || [])];
    }
    return res;
}
