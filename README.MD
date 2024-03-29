# [NodeToolSet](https://www.npmjs.com/package/nodetoolset)

NodeToolSet is a set of useful command line utilities. Currently, it includes commands for Node.js and React Native. Your contribution are always welcomed!

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
All examples assume that you are using `npx` but you can also use `nts`.

### Node.js
#### `node:remove-node_modules`
Remove all `node_modules` directories to free up your disk space.
##### Examples
```
npx nodetoolset node:remove-node_modules ~/my-projects
```

### React Native
#### `rn:rename-app`
Rename React Native app.
##### Examples
```
npx nodetoolset rn:rename-app "My New App"
npx nodetoolset rn:rename-app "My New App" --dir ~/my-projects/my-rn-project --ios
```
Notes: It's recommended to check out Git codebase into new branch, run the command and test carefully.

#### `rn:change-bundle-id`
Change React Native app bundle ID.
##### Examples
```
npx nodetoolset rn:change-bundle-id "com.myorg.myapp"
npx nodetoolset rn:change-bundle-id "com.myorg.myapp" --dir ~/my-projects/my-rn-project --ios
```

### Misc
#### `help`
Detailed documentation for the tool and each command.
##### Examples
```
# Show all commands.
npx nodetoolset help

# View details of a specific command.
npx nodetoolset help node:remove-node_modules
npx nodetoolset help rn:rename-app
```
