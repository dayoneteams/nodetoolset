import {FileChange} from "./FileChange";

export interface MoveFile extends FileChange {
  type: 'move';
  dest: string;
}
