import * as path from 'path';
// import {globbySync} from 'globby';
import * as fs from 'fs';
import { valueFromJsonFile, valueFromXmlFile } from '../utils/file-utils';
import { replaceFirstMatch, withoutSpaces } from '../utils/string-utils';
import { UpdateFileContent } from '../common-file-operation/UpdateFileContent';
import { MoveFile } from '../common-file-operation/MoveFile';
import { FileChange } from '../common-file-operation/FileChange';
import { RemoveFile } from '../common-file-operation/RemoveFile';

export class ReactNativeProject {
  rootDir: string;
  appDisplayName: string;
  appKey: string;
  androidBundleId: string;

  static async build(rootDir: string): Promise<ReactNativeProject> {
    const prj = new ReactNativeProject(rootDir);
    await prj.detectAppName();
    return prj;
  }

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    this.appDisplayName = '';
    this.appKey = '';
    this.androidBundleId = '';
  }

  async toNewName(
    newDisplayName: string,
    options: { ios: boolean; android: boolean }
  ): Promise<FileChange[]> {
    await this.detectAppName();

    const newAppKey = withoutSpaces(newDisplayName);
    let iosChanges: FileChange[] = [];
    let androidChanges: FileChange[] = [];

    if (options.ios) {
      iosChanges = await this.iosChangesToNewName(newAppKey, newDisplayName);
    }

    if (options.android) {
      androidChanges = await this.androidChangesToNewName(
        newAppKey,
        newDisplayName
      );
    }

    const commonChanges = this.commonChangesToNewName(
      newAppKey,
      newDisplayName
    );

    return [...commonChanges, ...iosChanges, ...androidChanges];
  }

  async toNewBundleId(
    newBundleId: string,
    options: { ios: boolean; android: boolean }
  ): Promise<FileChange[]> {
    let androidChanges: FileChange[] = [];
    let iosChanges: FileChange[] = [];

    await this.detectAndroidBundleId();

    if (options.ios) {
      iosChanges = [
        {
          type: 'updateContent',
          match: new RegExp('PRODUCT_BUNDLE_IDENTIFIER = "(.*?)"'),
          replaceWith: `PRODUCT_BUNDLE_IDENTIFIER = "${newBundleId}"`,
          target: [`ios/${this.appKey}.xcodeproj/project.pbxproj`],
        },
      ] as UpdateFileContent[];
    }

    if (options.android) {
      const updateAndroidFiles = [
        {
          type: 'updateContent',
          match: `package="${this.androidBundleId}"`,
          replaceWith: `package="${newBundleId}"`,
          target: ['android/app/src/main/AndroidManifest.xml'],
        },
        {
          type: 'updateContent',
          match: `"${this.androidBundleId}"`,
          replaceWith: `"${newBundleId}"`,
          target: ['android/app/BUCK', 'android/app/_BUCK', 'android/app/build.gradle'],
        },
        // {
        //   type: 'updateContent',
        //   match: `package ${this.androidBundleId}.`,
        //   replaceWith: `package ${newBundleId}.`,
        //   target: [globbySync('android/app/main/java/**/*.java')],
        // },
      ] as UpdateFileContent[];
      const moveAndroidFiles = [
      ] as MoveFile[];
      androidChanges = [...updateAndroidFiles, ...moveAndroidFiles];
    }

    return [...iosChanges, ...androidChanges];
  }

  private async iosChangesToNewName(
    newAppKey: string,
    newDisplayName: string
  ): Promise<FileChange[]> {
    // Update all files' content.
    const filesToUpdateContent = [
      'index.ios.js',
      `ios/${this.appKey}.xcodeproj/project.pbxproj`,
      `ios/${this.appKey}.xcworkspace/contents.xcworkspacedata`,
      `ios/${this.appKey}.xcodeproj/xcshareddata/xcschemes/${
        this.appKey
      }-tvOS.xcscheme`,
      `ios/${this.appKey}.xcodeproj/xcshareddata/xcschemes/${
        this.appKey
      }.xcscheme`,
      `ios/${this.appKey}/AppDelegate.m`,
      `ios/${this.appKey}Tests/${this.appKey}Tests.m`,
      'ios/build/info.plist',
      'ios/Podfile',
    ];
    const updateContentBatch: UpdateFileContent[] = [
      {
        type: 'updateContent',
        target: filesToUpdateContent,
        match: this.appKey,
        replaceWith: newAppKey,
      },
      {
        type: 'updateContent',
        match: `text="${this.appDisplayName}"`,
        replaceWith: `text="${newDisplayName}"`,
        target: [
          `ios/${this.appKey}/Base.lproj/LaunchScreen.xib`,
          `ios/${this.appKey}/LaunchScreen.storyboard`,
        ],
      },
      {
        type: 'updateContent',
        match: this.appDisplayName,
        replaceWith: newDisplayName,
        target: [`ios/${this.appKey}/Info.plist`],
      },
    ];

    // Move root folders and files first.
    const dirsAndFilesToMoveFirst = [
      `ios/${this.appKey}`,
      `ios/${this.appKey}-tvOS`,
      `ios/${this.appKey}-tvOSTests`,
      `ios/${this.appKey}.xcodeproj`,
      `ios/${this.appKey}Tests`,
      `ios/${this.appKey}.xcworkspace`,
      `ios/${this.appKey}-Bridging-Header.h`,
    ];
    const firstMoveBatch: MoveFile[] = dirsAndFilesToMoveFirst.map(
      filePath => ({
        type: 'move',
        target: filePath,
        dest: filePath.replace(new RegExp(this.appKey, 'i'), newAppKey),
      })
    );

    // Final, move sub folders and files. Paths are changed as root folders have been moved.
    const dirsAndFilesToMoveLast = [
      `ios/${this.appKey}.xcodeproj/xcshareddata/xcschemes/${
        this.appKey
      }-tvOS.xcscheme`,
      `ios/${this.appKey}.xcodeproj/xcshareddata/xcschemes/${
        this.appKey
      }.xcscheme`,
      `ios/${this.appKey}Tests/${this.appKey}Tests.m`,
      `ios/${this.appKey}/${this.appKey}.entitlements`,
    ];
    const secondMoveBatch: MoveFile[] = dirsAndFilesToMoveLast.map(filePath => {
      const target = replaceFirstMatch(filePath, this.appKey, newAppKey);
      const dest = replaceFirstMatch(target, this.appKey, newAppKey);
      return { target, dest, type: 'move' };
    });

    // Remove iOS build.
    const cleanBuild: RemoveFile = {
      type: 'remove',
      target: ['ios/build'],
    };

    return [
      ...updateContentBatch,
      ...firstMoveBatch,
      ...secondMoveBatch,
      cleanBuild,
    ];
  }

  private async androidChangesToNewName(
    newAppKey: string,
    newDisplayName: string
  ): Promise<FileChange[]> {
    const fileChanges: UpdateFileContent[] = [
      {
        type: 'updateContent',
        match: `<string name='app_name'>${this.appDisplayName}</string>`,
        replaceWith: `<string name='app_name'>${newDisplayName}</string>`,
        target: ['android/app/src/main/res/values/strings.xml'],
      },
      {
        type: 'updateContent',
        match: this.appKey,
        replaceWith: newAppKey,
        target: ['index.android.js', 'android/settings.gradle'],
      },
    ];

    // Remove Android build.
    const cleanBuild: RemoveFile = {
      type: 'remove',
      target: ['android/.gradle', 'android/app/build', 'android/build'],
    };

    return [...fileChanges, cleanBuild];
  }

  private commonChangesToNewName(
    newAppKey: string,
    newDisplayName: string
  ): UpdateFileContent[] {
    return [
      {
        type: 'updateContent',
        match: `"displayName": "${this.appDisplayName}"`,
        replaceWith: `"displayName": "${newDisplayName}"`,
        target: ['app.json'],
      },
      {
        type: 'updateContent',
        match: `"name": "${this.appKey}"`,
        replaceWith: `"name": "${newAppKey}"`,
        target: ['app.json', 'package.json'],
      },
    ];
  }

  private async detectAppName() {
    const appDotJsonFilePath = path.join(this.rootDir, 'app.json');
    const appDotJsonFileExists = fs.existsSync(appDotJsonFilePath);
    if (!appDotJsonFileExists) {
      console.error('app.json not found.');
      process.exit(1);
    }

    this.appDisplayName = await valueFromJsonFile(
      'displayName',
      appDotJsonFilePath
    );
    this.appKey = await valueFromJsonFile('name', appDotJsonFilePath);
    if (!this.appKey) {
      console.error(
        'App name not found in app.json. Please ensure "name" key exists in your app.json file.'
      );
    }
  }

  private async detectAndroidBundleId() {
    const androidManifestPath = 'android/app/src/main/AndroidManifest.xml';
    const androidManifestAbsPath = path.join(this.rootDir, androidManifestPath);
    const androidManifestFileExists = fs.existsSync(androidManifestAbsPath);
    if (!androidManifestFileExists) {
      return;
    }

    this.androidBundleId = await valueFromXmlFile(
      'manifest',
      'package',
      androidManifestAbsPath
    );
  }
}
