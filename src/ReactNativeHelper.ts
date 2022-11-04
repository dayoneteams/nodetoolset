import { ReactNativeProject } from './packages/react-native/ReactNativeProject';
import { FileChangeRunner } from './packages/common-file-operation/FileChangeRunner';

export class ReactNativeHelper {
  constructor() {}

  async renameReactNativeProject(
    projectDirPath: string,
    newName: string,
    options: {
      ios: boolean;
      android: boolean;
    }
  ) {
    const prj = await ReactNativeProject.build(projectDirPath);
    const fileChanges = await prj.toNewName(newName, options);
    const fileChangeRunner = new FileChangeRunner();
    await fileChangeRunner.runSeries(fileChanges, {
      rootDir: projectDirPath,
      report: true,
      skipNoneExistingTargets: true,
    });
  }
}
