import { ChangesModel } from 'openapi-toolkit';

export default interface EditorProps {
    changes: ChangesModel;
    setChanges: React.Dispatch<ChangesModel>;
    value: any;
}
