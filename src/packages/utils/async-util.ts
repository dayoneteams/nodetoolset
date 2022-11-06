export const sleep = (millSec: number) =>
  new Promise(resolve => setTimeout(resolve, millSec));
