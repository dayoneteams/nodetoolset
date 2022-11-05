import * as fs from 'fs';
import { promisify } from 'util';
import * as xml2js from 'xml2js';

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
