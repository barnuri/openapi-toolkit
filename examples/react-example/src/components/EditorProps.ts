import { ChangesModel } from 'openapi-tools';

export default interface EditorProps {
    changes: ChangesModel;
    setChanges: React.Dispatch<ChangesModel>;
    value: any;
}
