import * as fs from 'fs';
import { promisify } from 'util';
import * as xml2js from 'xml2js';
import * as shell from 'shelljs';

export const readFileAsync = promisify(fs.readFile);

export const valueFromJsonFile = async (
  key: string,
  jsonFilePath: string
): Promise<string> => {
  const jsonStr = await readFileAsync(jsonFilePath);
  const jsonData = JSON.parse(jsonStr.toString());
  return jsonData[key];
};

export const valueFromXmlFile = async (
  tag: string,
  attr: string,
  xmlFilePath: string
): Promise<string> => {
  const xmlStr = await readFileAsync(xmlFilePath);
  const xmlData = await xml2js.parseStringPromise(xmlStr.toString());
  return xmlData[tag].$[attr];
};

export const topLevelDirsNamed = (dirName: string, inDir: string): string[] => {
  const result = shell.exec(`find ${inDir} -name '${dirName}' -type d -prune`, {silent: true});
  return result.stdout.split('\n').filter(dirPath => !!dirPath);
};
