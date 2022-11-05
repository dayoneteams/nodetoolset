import * as shell from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';
import * as colors from 'colors';
import { FileChange } from './models/FileChange';
import { MoveFile } from './models/MoveFile';
import { UpdateFileContent } from './models/UpdateFileContent';
import { RemoveFile } from './models/RemoveFile';

interface RunOptions {
  rootDir?: string;
  report?: boolean;
  skipNoneExistingTargets?: boolean;
}

interface PathPair {
  filePath: string;
  absPath: string;
}

export class FileChangeRunner {
  async runSeries(fileChanges: FileChange[], options: RunOptions = {}) {
    for (let i = 0; i < fileChanges.length; i++) {
      await this.run(fileChanges[i], options);
    }
  }

  private async run(
    fileChange: FileChange,
    options: RunOptions = {}
  ): Promise<void> {
    switch (fileChange.type) {
      case 'move': {
        this.moveFile(fileChange as MoveFile, options);
        return;
      }
      case 'updateContent': {
        this.updateFileContent(fileChange as UpdateFileContent, options);
        return;
      }
      case 'remove': {
        this.removeFile(fileChange as RemoveFile, options);
        return;
      }
      default: {
        throw new Error(`${fileChange.type} type not supported`);
      }
    }
  }

  private updateFileContent(
    fileChange: UpdateFileContent,
    options: RunOptions = {}
  ) {
    const calculateAbsPath = (filePath: string) => ({
      filePath,
      absPath: this.toAbsolutePath(filePath, options.rootDir),
    });
    const removeNonExisting = (pathPair: PathPair) =>
      this.assertFileExisting(
        pathPair.absPath,
        !!options.skipNoneExistingTargets
      );
    const updateContent = ({ filePath, absPath }: PathPair) => {
      shell.sed('-i', fileChange.match, fileChange.replaceWith, absPath);
      console.log(`${filePath} ${colors.green('UPDATED')}.`);
    };

    fileChange.target
      .map(calculateAbsPath)
      .filter(removeNonExisting)
      .forEach(updateContent);
  }

  private moveFile(fileChange: MoveFile, options: RunOptions = {}) {
    const typedFileChange = fileChange as MoveFile;

    const targetWithAbsolutePath = this.toAbsolutePath(
      fileChange.target,
      options.rootDir
    );

    const fileExist = this.assertFileExisting(
      targetWithAbsolutePath,
      !!options.skipNoneExistingTargets
    );
    if (!fileExist) {
      return;
    }

    const dest = this.toAbsolutePath(typedFileChange.dest, options.rootDir);

    if (typedFileChange.createIntermediateDirs && !fs.existsSync(dest)) {
      shell.mkdir('-p', dest);
    }

    shell.mv('-f', targetWithAbsolutePath, dest);

    console.log(`${typedFileChange.target} ${colors.green('MOVED')}.`);
  }

  private removeFile(fileChange: RemoveFile, options: RunOptions = {}) {
    const calculateAbsPath = (filePath: string) => ({
      filePath,
      absPath: this.toAbsolutePath(filePath, options.rootDir),
    });
    const removeNonExisting = (pathPair: PathPair) =>
      this.assertFileExisting(
        pathPair.absPath,
        !!options.skipNoneExistingTargets
      );
    const updateContent = ({ filePath, absPath }: PathPair) => {
      shell.rm('-rf', absPath);
      console.log(`${filePath} ${colors.green('REMOVED')}.`);
    };

    fileChange.target
      .map(calculateAbsPath)
      .filter(removeNonExisting)
      .forEach(updateContent);
  }

  private toAbsolutePath(target: string, rootDir?: string): string {
    if (!rootDir) {
      return target;
    }

    return path.join(rootDir, target);
  }

  private assertFileExisting(filePath: string, skip: boolean): boolean {
    if (fs.existsSync(filePath)) {
      return true;
    }

    if (skip) {
      console.log(`${filePath} ${colors.yellow('NOT FOUND and SKIPPED')}.`);
    } else {
      throw new Error(`${filePath} not found.`);
    }

    return false;
  }
}
