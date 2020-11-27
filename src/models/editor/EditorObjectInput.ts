import { EditorInput } from './EditorInput';

export class EditorObjectInput extends EditorInput {
    properties: EditorInput[];
    switchable: boolean;
    switchableOptions?: string[];
    switchableObjects?: EditorInput[];
    toHtml() {
        this.properties = this.properties || [];
        const propsHtml = this.properties.map(x => x.toHtml()).join('');
        if (this.switchable) {
            const commonProps = `<div style='padding-left:20px'> <b><u>common:</u></b>` + propsHtml + '</div>';
            this.switchableOptions = this.switchableOptions || [];
            this.switchableObjects = this.switchableObjects || [];
            return (
                `<b>${this.getName()}</b>:  ` +
                `<b><u>switchable:</u></b> ${this.switchableOptions.join(',')}` +
                commonProps +
                this.switchableObjects
                    .map((x, i) => `<div style='padding-left:20px'><b><u>${this.switchableOptions![i]}</u></b> props: ${x.toHtml()} </div>`)
                    .join('')
            );
        }
        return `<b>${this.getName()}</b>: <div style='padding-left:20px'>${propsHtml}</div>`;
    }
}
