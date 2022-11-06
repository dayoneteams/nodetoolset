import * as path from 'path';
import * as fs from 'fs';
import {valueFromJsonFile, valueFromXmlFile} from '../../utils/file-util';
import {javaPackageToDirPath} from '../../utils/string-util';

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

  private async detectAppName() {
    const appDotJsonFilePath = path.join(this.rootDir, 'app.json');
    const appDotJsonFileExists = fs.existsSync(appDotJsonFilePath);
    if (!appDotJsonFileExists) {
      throw new Error('app.json not found.');
    }

    this.appDisplayName = await valueFromJsonFile(
      'displayName',
      appDotJsonFilePath
    );
    this.appKey = await valueFromJsonFile('name', appDotJsonFilePath);
    if (!this.appKey) {
      throw new Error(
        'App name not found in app.json. Please ensure "name" key exists in your app.json file.'
      );
    }
  }

  public async detectAndroidBundleId() {
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

  public iosFilesWithAppKeyInContent(): string[] {
    return [
      'index.ios.js',
      `ios/${this.appKey}.xcodeproj/project.pbxproj`,
      `ios/${this.appKey}.xcworkspace/contents.xcworkspacedata`,
      `ios/${this.appKey}.xcodeproj/xcshareddata/xcschemes/${this.appKey}-tvOS.xcscheme`,
      `ios/${this.appKey}.xcodeproj/xcshareddata/xcschemes/${this.appKey}.xcscheme`,
      `ios/${this.appKey}/AppDelegate.m`,
      `ios/${this.appKey}Tests/${this.appKey}Tests.m`,
      'ios/build/info.plist',
      'ios/Podfile',
    ];
  }

  public iosLaunchScreenFiles(): string[] {
    return [
      `ios/${this.appKey}/Base.lproj/LaunchScreen.xib`,
      `ios/${this.appKey}/LaunchScreen.storyboard`,
    ];
  }

  public absPathOf(relativePath: string): string {
    return path.join(this.rootDir, relativePath);
  }

  public androidJavaCodeRootDir() {
    return path.join(
      this.absPathOf('android/app/src/main/java'),
      javaPackageToDirPath(this.androidBundleId)
    );
  }
}
