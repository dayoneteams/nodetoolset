export const withoutSpaces = (str: string): string => {
  return str.replace(/\s/g, "");
};

export const replaceFirstMatch = (str: string, matchStr: string, replaceWith: string): string => {
  return str.replace(
    new RegExp(matchStr, 'i'),
    replaceWith
  );
};
