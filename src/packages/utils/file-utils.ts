import * as fs from 'fs';
import { promisify } from 'util';

export const readFileAsync = promisify(fs.readFile);

export const valueFromJsonFile = async (
  key: string,
  jsonFilePath: string
): Promise<string> => {
  const jsonStr = await readFileAsync(jsonFilePath);
  const jsonData = JSON.parse(jsonStr.toString());
  return jsonData[key];
};
