import { FileChange } from './FileChange';

export interface MoveFile extends FileChange {
  target: string;
  type: 'move';
  dest: string;
  createIntermediateDirs?: boolean;
}
