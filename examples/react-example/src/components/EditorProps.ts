import { ChangesModel } from 'openapi-definition-to-editor';

export default interface EditorProps {
    changes: ChangesModel;
    setChanges: React.Dispatch<any>;
    value: any;
}
