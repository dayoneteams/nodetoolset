export const withoutSpaces = (str: string): string => str.replace(/\s/g, '');

export const replaceFirstMatch = (
  str: string,
  matchStr: string,
  replaceWith: string
): string => str.replace(new RegExp(matchStr, 'i'), replaceWith);

export const javaPackageToDirPath = (javaPackageStr: string): string =>
  javaPackageStr.replace(new RegExp('\\.', 'g'), '/');
