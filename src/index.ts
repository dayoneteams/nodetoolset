#!/usr/bin/env node

import {createCommand} from 'commander';
import * as fs from 'fs-extra';
import * as path from 'path';
import {ReactNativeService} from './packages/react-native/ReactNativeService';

const inquirer = require('inquirer');

const program = createCommand();

program.version('0.0.1', '-v, --version');

program
  .command('node:remove-node_modules <dir-path>')
  .description(
    'Recursively remove all node_modules directories within provided <dir-path>.'
  )
  // .option(
  //   '--pickup',
  //   'Interactively pickup which directories to remove from a displayed list'
  // )
  .action(async dir => {
    const searchDir = 'node_modules';
    const foundDirs: string[] = _findDirectoriesRecursivelyByName(
      searchDir,
      dir
    );

    if (foundDirs.length === 0) {
      console.log(
        `No directory named ${searchDir} has been founded in ${dir}.`
      );
      return;
    }

    console.log(
      `List of directories named ${searchDir} has been founded in ${dir}:`
    );
    foundDirs.forEach((dir, i) => {
      console.log(`${i + 1}. ${dir}`);
    });

    const answers = await inquirer.prompt([
      {
        type: 'confirm',
        message: 'Are you sure you want to remove all directories above?',
        name: 'confirmation',
        default: true,
      },
    ]);

    if (!answers.confirmation) {
      console.log('Directories have been kept.');
      return;
    }

    foundDirs.forEach(dirPath => {
      fs.removeSync(dirPath);
    });

    console.log(
      `${foundDirs.length} ${
        foundDirs.length === 1 ? 'directory' : 'directories'
      } have been removed successfully.`
    );
  });

program
  .command('rn:rename-app <new-app-name>')
  .description('Rename React Native app name.')
  .option('--dir [dirPath]', 'Path to React Native project root folder.')
  .option('--android', 'Only change Android files.')
  .option('--ios', 'Only change iOS files.')
  .action(async (newName, {dir = process.cwd(), android, ios}) => {
    const rnHelper = new ReactNativeService();
    const options = {
      ios: !android || !!ios,
      android: !ios || !!android,
    };
    await rnHelper.renameProject(dir, newName, options);
  });

program
  .command('rn:change-bundle-id <new-bundle-id>')
  .description('Change React Native app bundle ID.')
  .option('--dir [dirPath]', 'Path to React Native project root folder.')
  .option('--android', 'Only change Android files.')
  .option('--ios', 'Only change iOS files.')
  .action(async (newBundleId, {dir = process.cwd(), android, ios}) => {
    const rnHelper = new ReactNativeService();
    const options = {
      ios: !android || !!ios,
      android: !ios || !!android,
    };
    await rnHelper.changeBundleId(dir, newBundleId, options);
  });

program.parse(process.argv);

if (!program.args || program.args.length === 0) {
  program.help();
}

function _findDirectoriesRecursivelyByName(searchDir: string, inDir: string) {
  const result: string[] = [];
  const filesAndFolders = fs.readdirSync(inDir, {withFileTypes: true});
  filesAndFolders.forEach(item => {
    if (item.isDirectory() && item.name[0] !== '.') {
      const subDirPath = path.join(inDir, item.name);
      if (item.name === searchDir) {
        result.push(subDirPath);
      } else {
        const resultInSubDir = _findDirectoriesRecursivelyByName(
          searchDir,
          subDirPath
        );
        resultInSubDir.forEach(item => result.push(item));
      }
    }
  });
  return result;
}
