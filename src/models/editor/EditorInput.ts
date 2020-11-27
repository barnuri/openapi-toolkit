export class EditorInput {
    path: string;
    required: boolean;
    getName() {
        return (this.path || '').split('.').splice(-1)[0];
    }
    toHtml() {
        return '';
    }
}
