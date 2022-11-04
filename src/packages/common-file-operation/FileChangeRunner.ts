import * as shell from 'shelljs';
import {FileChange} from "./FileChange";
import {MoveFile} from "./MoveFile";
import {UpdateFileContent} from "./UpdateFileContent";
import * as path from "path";
import * as fs from "fs";

interface RunOptions {
  rootDir?: string;
  report?: boolean;
  skipNoneExistingTargets?: boolean;
}

export class FileChangeRunner {
  async runSeries(fileChanges: FileChange[], options: RunOptions = {}) {
    for (let i = 0; i < fileChanges.length; i++) {
      await this.run(fileChanges[i], options);
    }
  }

  private async run(fileChange: FileChange, options: RunOptions = {}) {
    if (Array.isArray(fileChange.target)) {
      for (let i = 0; i < fileChange.target.length; i++) {
        await this.run({
          ...fileChange,
          target: fileChange.target[i],
        }, options);
      }
      return;
    }

    const target = options.rootDir ? path.join(options.rootDir, fileChange.target) : fileChange.target;
    if (!fs.existsSync(target) && !options.skipNoneExistingTargets) {
      throw new Error(`${target} does not exist. Process has been stopped.`);
    }

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
