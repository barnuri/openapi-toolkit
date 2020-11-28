# Integration React & Angular

# Vscode autocompletion

add .vscode/settings.json file

```json
{
    "html.customData": ["@node_modules/editor-input/html.customData.json"]
}
```

## React

main file

```js
import { defineCustomElements, JSX as LocalJSX, applyPolyfills } from 'editor-input/loader';
import { HTMLAttributes } from 'react';

type StencilToReact = {
    [P in keyof LocalJSX.IntrinsicElements]?: LocalJSX.IntrinsicElements[P] & Omit<HTMLAttributes<Element>, 'className'> & { class?: string };
};

declare global {
    export namespace JSX {
        interface IntrinsicElements extends StencilToReact {}
    }
}

applyPolyfills().then(() => defineCustomElements(window));
```

## Anguler

https://stenciljs.com/docs/angular

main.ts

```js
import { defineCustomElements, applyPolyfills } from 'editor-input/loader';

applyPolyfills().then(() => {
    defineCustomElements();
});
```

## using

```tsx
<editor-input></<editor-input>>
```
