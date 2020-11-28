import { Component, Prop, h } from '@stencil/core';

@Component({
    tag: 'editor-input',
    styleUrl: 'editor-input.css',
    shadow: true,
})
export class EditorInputComponent {
    render() {
        return <div>Hello, World! I'm </div>;
    }
}
