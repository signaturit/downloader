Downloader
==========

This application allows the API user to download all signed documents of his user accounts.


Development
-----------

For the development, you only need to execute the `yarn install` command and all the dependencies are going to be installed.

After that, execute a `yarn start` to start the development. You will need to activate the developer tools in `main.ts` file `win.webContents.openDevTools();` that you must comment before creating a new release.

Also, you may want to enable the *livereload* feature in the `index.jade` file for easier development experience. Remember to comment again that line before creating a new release.


Creating a new release
----------------------

In order to create a new release, increment the package version in `package.json` and execute the command `GH_TOKEN=YOUR_GITHUB_TOKEN yarn release`.
