import {FileChange} from './FileChange';

export interface UpdateFileContent extends FileChange {
  target: string[];
  type: 'updateContent';
  match: string | RegExp;
  replaceWith: string;
}
