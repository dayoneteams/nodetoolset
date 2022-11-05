import * as shell from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';
import * as colors from "colors";
import {FileChange} from './FileChange';
import {MoveFile} from './MoveFile';
import {UpdateFileContent} from './UpdateFileContent';

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
    switch (fileChange.type) {
      case 'move': {
        this.moveFile(fileChange as MoveFile, options);
        return;
      }
      case 'updateContent': {
        this.updateFileContent(fileChange as UpdateFileContent, options);
        return;
      }
      // case 'remove': {
      //   const typedFileChange = fileChange as UpdateFileContent;
      //   shell.rm(
      //     '-rf',
      //     target
      //   );
      //   console.log(`${fileChange.target} ${colors.green('REMOVED')}.`);
      //   return;
      // }
      default: {
        throw new Error(`${fileChange.type} type not supported`);
      }
    }
  }

  private updateFileContent(fileChange: UpdateFileContent, options: RunOptions = {}) {
    const targetWithAbsolutePath = this.toAbsolutePaths(fileChange.target, options.rootDir);

    if (options.skipNoneExistingTargets) {
      this.assertExisting(targetWithAbsolutePath);
    }

    shell.sed(
      '-i',
      fileChange.match,
      fileChange.replaceWith,
      targetWithAbsolutePath
    );

    fileChange.target.forEach((filePath) => `${filePath} ${colors.green('UPDATED')}.`);
  }

  private moveFile(fileChange: MoveFile, options: RunOptions = {}) {
    const typedFileChange = fileChange as MoveFile;

    const targetWithAbsolutePath = this.toAbsolutePath(fileChange.target, options.rootDir);

    if (options.skipNoneExistingTargets) {
      this.assertExisting(targetWithAbsolutePath);
    }

    const dest = this.toAbsolutePath(typedFileChange.dest, options.rootDir);
    shell.mv('-f', targetWithAbsolutePath, dest);

    console.log(`${typedFileChange.target} ${colors.green('MOVED')}.`);
  }

  private toAbsolutePaths(target: string[], rootDir?: string): string[] {
    if (!rootDir) {
      return target;
    }

    return target.map(filePath => this.toAbsolutePath(filePath, rootDir) as string);
  }

  private toAbsolutePath(target: string, rootDir?: string): string {
    if (!rootDir) {
      return target;
    }

    return path.join(rootDir, target);
  }

  private assertExisting(filePath: string | string[]) {
    if (Array.isArray(filePath)) {
      filePath.forEach(this.assertExisting);
    }

    if (!fs.existsSync(filePath as string)) {
      throw new Error(`${filePath} not founded.`);
    }
  }
}
