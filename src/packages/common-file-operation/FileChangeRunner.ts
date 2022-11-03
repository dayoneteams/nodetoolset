import * as shell from 'shelljs';
import {FileChange} from "./FileChange";
import {MoveFile} from "./MoveFile";
import {UpdateFileContent} from "./UpdateFileContent";
import * as path from "path";

interface RunOptions {
  rootDir?: string;
  report?: boolean;
}

export class FileChangeRunner {
  async runSeries(fileChanges: FileChange[], options: RunOptions = {}) {
    console.log(fileChanges)
    for (let i = 0; i < fileChanges.length; i++) {
      await this.run(fileChanges[i], options);
    }
  }

  private async run(fileChange: FileChange, options: RunOptions = {}) {
    const target = options.rootDir ? path.join(options.rootDir, fileChange.target) : fileChange.target;
    switch (fileChange.type) {
      case 'move': {
        const typedFileChange = fileChange as MoveFile;
        const dest = options.rootDir ? path.join(options.rootDir, typedFileChange.dest) : typedFileChange.dest;
        return shell.mv('-f', target, dest);
      }
      case 'updateContent': {
        const typedFileChange = fileChange as UpdateFileContent;
        return shell.sed('-i', typedFileChange.match, typedFileChange.replaceWith, target);
      }
      default: {
        throw new Error(`${fileChange.type} type not supported`);
      }
    }
  }
}
