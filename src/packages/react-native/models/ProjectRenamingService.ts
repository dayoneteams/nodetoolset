import * as globby from 'globby';
import * as path from 'path';
import {ReactNativeProject} from './ReactNativeProject';
import {UpdateFileContent} from '../../file-change/models/UpdateFileContent';
import {MoveFile} from '../../file-change/models/MoveFile';
import {
  javaPackageToDirPath,
  replaceFirstMatch,
  withoutSpaces,
} from '../../utils/string-util';
import {RemoveFile} from '../../file-change/models/RemoveFile';
import {FileChange} from '../../file-change/models/FileChange';

interface PlatformOptions {
  android: boolean;
  ios: boolean;
}
export class ProjectRenamingService {
  public async renameApp(
    project: ReactNativeProject,
    newDisplayName: string,
    {ios, android}: PlatformOptions
  ): Promise<FileChange[]> {
    const newAppKey = withoutSpaces(newDisplayName);

    const iosChanges: FileChange[] = ios
      ? await this.iosChangesToNewName(project, newAppKey, newDisplayName)
      : [];
    const androidChanges: FileChange[] = android
      ? await this.androidChangesToNewName(project, newAppKey, newDisplayName)
      : [];
    const commonChanges = this.commonChangesToNewName(
      project,
      newAppKey,
      newDisplayName
    );

    return [...iosChanges, ...androidChanges, ...commonChanges];
  }

  public async changeBundleId(
    project: ReactNativeProject,
    newBundleId: string,
    {ios, android}: PlatformOptions
  ): Promise<FileChange[]> {
    await project.detectAndroidBundleId();

    const iosChanges = ios
      ? this.iosChangesToNewBundleId(project, newBundleId)
      : [];
    const androidChanges = android
      ? this.androidChangesToNewBundleId(project, newBundleId)
      : [];

    return [...iosChanges, ...androidChanges];
  }

  private async iosChangesToNewName(
    project: ReactNativeProject,
    newAppKey: string,
    newDisplayName: string
  ) {
    // Update all files' content.
    const updateContentBatch: UpdateFileContent[] = [
      {
        type: 'updateContent',
        target: project.iosFilesWithAppKeyInContent(),
        match: project.appKey,
        replaceWith: newAppKey,
      },
      {
        type: 'updateContent',
        match: `text="${project.appDisplayName}"`,
        replaceWith: `text="${newDisplayName}"`,
        target: project.iosLaunchScreenFiles(),
      },
      {
        type: 'updateContent',
        match: project.appDisplayName,
        replaceWith: newDisplayName,
        target: [`ios/${project.appKey}/Info.plist`],
      },
    ];

    // Move root folders and files first.
    const dirsAndFilesToMoveFirst = [
      `ios/${project.appKey}`,
      `ios/${project.appKey}-tvOS`,
      `ios/${project.appKey}-tvOSTests`,
      `ios/${project.appKey}.xcodeproj`,
      `ios/${project.appKey}Tests`,
      `ios/${project.appKey}.xcworkspace`,
      `ios/${project.appKey}-Bridging-Header.h`,
    ];
    const firstMoveBatch: MoveFile[] = dirsAndFilesToMoveFirst.map(
      filePath => ({
        type: 'move',
        target: filePath,
        dest: filePath.replace(new RegExp(project.appKey, 'i'), newAppKey),
      })
    );

    // Final, move sub folders and files. Paths are changed as root folders have been moved.
    const dirsAndFilesToMoveLast = [
      `ios/${project.appKey}.xcodeproj/xcshareddata/xcschemes/${project.appKey}-tvOS.xcscheme`,
      `ios/${project.appKey}.xcodeproj/xcshareddata/xcschemes/${project.appKey}.xcscheme`,
      `ios/${project.appKey}Tests/${project.appKey}Tests.m`,
      `ios/${project.appKey}/${project.appKey}.entitlements`,
    ];
    const secondMoveBatch: MoveFile[] = dirsAndFilesToMoveLast.map(filePath => {
      const target = replaceFirstMatch(filePath, project.appKey, newAppKey);
      const dest = replaceFirstMatch(target, project.appKey, newAppKey);
      return {target, dest, type: 'move'};
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
    project: ReactNativeProject,
    newAppKey: string,
    newDisplayName: string
  ): Promise<FileChange[]> {
    const fileChanges: UpdateFileContent[] = [
      {
        type: 'updateContent',
        match: `<string name='app_name'>${project.appDisplayName}</string>`,
        replaceWith: `<string name='app_name'>${newDisplayName}</string>`,
        target: ['android/app/src/main/res/values/strings.xml'],
      },
      {
        type: 'updateContent',
        match: project.appKey,
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
    project: ReactNativeProject,
    newAppKey: string,
    newDisplayName: string
  ): UpdateFileContent[] {
    return [
      {
        type: 'updateContent',
        match: `"displayName": "${project.appDisplayName}"`,
        replaceWith: `"displayName": "${newDisplayName}"`,
        target: ['app.json'],
      },
      {
        type: 'updateContent',
        match: `"name": "${project.appKey}"`,
        replaceWith: `"name": "${newAppKey}"`,
        target: ['app.json', 'package.json'],
      },
    ];
  }

  private iosChangesToNewBundleId(
    project: ReactNativeProject,
    newBundleId: string
  ): FileChange[] {
    return [
      {
        type: 'updateContent',
        match: new RegExp('PRODUCT_BUNDLE_IDENTIFIER = "(.*?)"'),
        replaceWith: `PRODUCT_BUNDLE_IDENTIFIER = "${newBundleId}"`,
        target: [`ios/${project.appKey}.xcodeproj/project.pbxproj`],
      },
    ] as UpdateFileContent[];
  }

  private androidChangesToNewBundleId(
    project: ReactNativeProject,
    newBundleId: string
  ): FileChange[] {
    const javaFiles = globby
      .sync(path.join(project.rootDir, 'android/app/src/main/java/**/*.java'))
      .map(absPath => path.relative(project.rootDir, absPath));
    const updateAndroidFiles = [
      {
        type: 'updateContent',
        match: `package="${project.androidBundleId}"`,
        replaceWith: `package="${newBundleId}"`,
        target: ['android/app/src/main/AndroidManifest.xml'],
      },
      {
        type: 'updateContent',
        match: `"${project.androidBundleId}"`,
        replaceWith: `"${newBundleId}"`,
        target: [
          'android/app/BUCK',
          'android/app/_BUCK',
          'android/app/build.gradle',
        ],
      },
      {
        type: 'updateContent',
        match: `package ${project.androidBundleId}`,
        replaceWith: `package ${newBundleId}`,
        target: javaFiles,
      },
    ] as UpdateFileContent[];
    const newDirOfJavaFiles = path.join(
      'android/app/src/main/java',
      javaPackageToDirPath(newBundleId)
    );

    // TODO: Can make better code here by changing MoveFile to also accept target as blob string, e.g: target: "android/app/src/main/java/*".
    const moveAndroidFiles: MoveFile[] = globby
      .sync(path.join(project.androidJavaCodeRootDir(), '/*'), {
        onlyFiles: false,
      })
      .map(absPath => path.relative(project.rootDir, absPath))
      .map(relPath => ({
        type: 'move',
        target: relPath,
        dest: newDirOfJavaFiles,
        createIntermediateDirs: true,
      }));
    const removeUnusedDir: RemoveFile = {
      type: 'remove',
      target: [
        path.join(
          'android/app/src/main/java',
          javaPackageToDirPath(project.androidBundleId)
        ),
      ],
    };

    return [...updateAndroidFiles, ...moveAndroidFiles, removeUnusedDir];
  }
}
