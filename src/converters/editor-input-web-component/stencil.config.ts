import { Config } from '@stencil/core';

export const config: Config = {
    namespace: 'editor-input',
    outputTargets: [
        {
            type: 'dist',
            esmLoaderPath: '../loader',
        },
        {
            type: 'dist-custom-elements-bundle',
        },
        {
            type: 'docs-readme',
        },
        {
            type: 'docs-vscode',
            file: 'html.customData.json',
        },
    ],
};
