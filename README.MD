# [NodeToolSet](https://reactjs.org/)

NodeToolSet is a set of useful command line utilities that can help Node.js developer
life easier. Current it includes utility commands for Node.js and React Native. Your contribution are always welcome.

Built with BIG love from [DayOne](https://dayoneteams.com)!

## Installation
No installation is required. It's recommended to use `npx` to uses the latest version.

For someone who really want to install the package manually:
```
[sudo] npm install -g nodetoolset
```

## Usage
With `npx`.
```
npx nodetoolset <command> ...
```
If you installed the tool using `[sudo] npm install -g nodetoolset`. You can use:
```
nts <command> ...
```

## Commands
All commands below assume that you are using `npx`.

### Node.js
Recursively remove all `node_modules` directories in a certain `directory`
to free up your disk space.
```
npx nodetoolset node:remove-node_modules

# Example
npx nodetoolset node:remove-node_modules ~/my-projects
```

### React Native
#### npx nodetoolset rn:rename-app
Rename React Native app.
##### Examples
```
npx nodetoolset rn:rename-app "My New App"
npx nodetoolset rn:rename-app "My New App" --dir ~/my-projects/my-rn-project --ios
```
Notes: It's recommended to check out Git codebase into new branch, run the command and test carefully.

Change React Native app bundle ID.
```
npx nodetoolset rn:change-bundle-id <new-bundle-id>

# Examples
npx nodetoolset rn:rename-app "com.myorg.myapp"
npx nodetoolset rn:rename-app "com.myorg.myapp" --dir ~/my-projects/my-rn-project --ios
```

### Misc
Show all commands.
```
npx nodetoolset help
```

View details of a specific command.
```
npx nodetoolset help <command>

# Examples
npx nodetoolset help node:remove-node_modules
npx nodetoolset help rn:rename-app
```
