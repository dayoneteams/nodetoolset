import * as path from 'path';
import * as fs from 'fs';
import * as shell from 'shelljs';
import * as colors from 'colors';

const replace = require('node-replace');

export class ReactNativeHelper {
  async renameReactNativeProject(
    projectDirPath: string,
    newName: string,
    options: {
      ios: boolean;
      android: boolean;
    }
  ) {
    const currentAppName = this.detectCurrentAppName(projectDirPath);

    if (options.ios) {
      await this.moveIosFiles(projectDirPath, currentAppName, newName);
      // await this.updateIosFileContents(currentAppName, newName);
    }

    // this.updateCommonFiles();
  }

  private detectCurrentAppName(projectDirPath: string) {
    const jsonStr = fs.readFileSync(path.join(projectDirPath, 'app.json'));
    const jsonData = JSON.parse(jsonStr.toString());
    return jsonData.name;
  }

  private async moveIosFiles(
    projectDirPath: string,
    currentAppName: string,
    newAppName: string
  ) {
    const filesToMove = [
      `ios/${currentAppName}`,
      `ios/${currentAppName}-tvOS`,
      `ios/${currentAppName}-tvOSTests`,
      `ios/${currentAppName}.xcodeproj`,
      `ios/${currentAppName}.xcodeproj/xcshareddata/xcschemes/${currentAppName}-tvOS.xcscheme`,
      `ios/${currentAppName}.xcodeproj/xcshareddata/xcschemes/${currentAppName}.xcscheme`,
      `ios/${currentAppName}Tests`,
      `ios/${currentAppName}Tests/${currentAppName}Tests.m`,
      `ios/${currentAppName}.xcworkspace`,
      `ios/${currentAppName}/${currentAppName}.entitlements`,
      `ios/${currentAppName}-Bridging-Header.h`,
    ];

    const moveFile = async (currentFilePath: string) => {
      const newFilePath = currentFilePath.replace(
        new RegExp(currentAppName, 'i'),
        newAppName
      );

      const src = toFullPath(currentFilePath);
      const dest = toFullPath(newFilePath);

      return new Promise(resolve =>
        shell.exec(
          `mv -f ${src} ${dest}`,
          { silent: true },
          (code, stdout, stderr) => {
            if (code === 0) {
              console.log(`/${currentFilePath} RENAMED to /${newFilePath}`);
            } else {
              console.log(
                colors.yellow(
                  `/${currentFilePath} SKIPPED (file does not exists)`
                )
              );
            }
            resolve();
          }
        )
      );
    };

    const toFullPath = (relativePath: string) =>
      path.join(projectDirPath, relativePath);

    await Promise.all(filesToMove.map(moveFile));
  }

  private async updateIosFileContents(
    projectDirPath: string,
    currentAppName: string,
    newAppName: string
  ) {
    const filesToUpdate = [
      // 'index.js',
      'index.ios.js',
      `ios/${newAppName}.xcodeproj/project.pbxproj`,
      `ios/${newAppName}.xcworkspace/contents.xcworkspacedata`,
      `ios/${newAppName}.xcodeproj/xcshareddata/xcschemes/${newAppName}-tvOS.xcscheme`,
      `ios/${newAppName}.xcodeproj/xcshareddata/xcschemes/${newAppName}.xcscheme`,
      `ios/${newAppName}/AppDelegate.m`,
      `ios/${newAppName}Tests/${newAppName}Tests.m`,
      'ios/build/info.plist',
      'ios/Podfile',
      // 'app.json',
    ];

    // replace({
    //   regex: currentAppName,
    //   replacement: newAppName,
    //   paths: filesToUpdate,
    //   recursive: true,
    //   silent: true,
    // });

    filesToUpdate.forEach(file => console.log(`/${file} UPDATED`));
  }
}
