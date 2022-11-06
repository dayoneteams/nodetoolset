Node Toolset is a set of useful command lines that can help nodejs developer
life easier.

Built with BIG love from DayOne Teams!

### Installation
`[sudo] npm install -g nodetoolset`

### Usage
Recursively remove all `node_modules` directories in a certain `directory`
to free up your disk space.
```
[npx] nts node:remove-node_modules <dir>
```

Rename React Native app.
```
[npx] nts rn:rename-app <new-app-name>
```
Notes: It's recommended to check out Git codebase into new branch, run the command and test carefully. 

Get command help
```
nts --help
```
