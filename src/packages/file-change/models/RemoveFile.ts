import {FileChange} from './FileChange';

export interface RemoveFile extends FileChange {
  target: string[];
  type: 'remove';
}
