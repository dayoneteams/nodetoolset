# [NodeToolSet](https://reactjs.org/)

NodeToolSet is a set of useful command line utilities that can help Node.js developer
life easier. Current it includes utility commands for Node.js and React Native. Your contribution are always welcome.

Built with BIG love from [DayOne](https://dayoneteams.com)!

## Installation
Notes: Skip if you want use `npx`.

```
[sudo] npm install -g nodetoolset
```

## Usage
You can use the commands directly using `npx`.
```
npx nodetoolset <command> ...
```
If you installed the tool using `npm install -g`. You can use.
```
nts <command> ...
```

## Commands
Recursively remove all `node_modules` directories in a certain `directory`
to free up your disk space.
```
nts node:remove-node_modules <dir>
```

Rename React Native app.
```
nts rn:rename-app <new-app-name>
```
Notes: It's recommended to check out Git codebase into new branch, run the command and test carefully. 

Get command help
```
nts --help
```
