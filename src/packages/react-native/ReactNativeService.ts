import {ReactNativeProject} from './models/ReactNativeProject';
import {FileChangeRunner} from '../file-change/FileChangeRunner';
import {ProjectRenamingService} from './models/ProjectRenamingService';

export class ReactNativeService {
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
    const service = new ProjectRenamingService();

    const fileChanges = await service.renameApp(prj, newName, options);

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
    const service = new ProjectRenamingService();

    const fileChanges = await service.changeBundleId(prj, newBundleId, options);

    const fileChangeRunner = new FileChangeRunner();
    await fileChangeRunner.runSeries(fileChanges, {
      rootDir: projectDirPath,
      report: true,
      skipNoneExistingTargets: true,
    });
  }
}
