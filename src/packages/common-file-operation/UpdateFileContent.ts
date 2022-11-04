import { FileChange } from './FileChange';

export interface UpdateFileContent extends FileChange {
  type: 'updateContent';
  match: string | RegExp;
  replaceWith: string;
}
