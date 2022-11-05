import { ReactNativeProject } from './models/ReactNativeProject';
import { FileChangeRunner } from '../file-change/FileChangeRunner';

export class ReactNativeHelper {
  constructor() {}

  async renameProject(
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

  async changeBundleId(
    projectDirPath: string,
    newBundleId: string,
    options: {
      ios: boolean;
      android: boolean;
    }
  ) {
    const prj = await ReactNativeProject.build(projectDirPath);
    const fileChanges = await prj.toNewBundleId(newBundleId, options);
    const fileChangeRunner = new FileChangeRunner();
    await fileChangeRunner.runSeries(fileChanges, {
      rootDir: projectDirPath,
      report: true,
      skipNoneExistingTargets: true,
    });
  }
}
