const {app, dialog, BrowserWindow, Menu} = require('electron');

const {autoUpdater} = require('electron-updater');

const logger = require('electron-log');

logger.transports.file.level = 'debug';

autoUpdater.logger = logger;

declare var __dirname: string;

declare var process: NodeJS.Process;

let win;

let createWindow = () => {
    let width  = 400;
    let height = process.platform == 'darwin' ? 300 : 340;

    win = new BrowserWindow({
        width: width,
        height: height,
        maxWidth: width,
        maxHeight: height,
        minWidth: width,
        minHeight: height
    });

    win.loadURL(`file://${__dirname}/../views/index.html`);

    // win.webContents.openDevTools();

    win.on(
        'closed',
        () => {
            win = null
        }
    );

    const template = [
        {
            label: 'Downloader',
            submenu: [
                {label: 'About', selector: 'orderFrontStandardAboutPanel:'},
                {type: 'separator'},
                {
                    label: 'Clear',
                    click: () => win.webContents.executeJavaScript('localStorage.clear(); location.reload()')
                },
                {type: 'separator'},
                {
                    label: 'Quit', accelerator: 'Command+Q',
                    click: () => app.quit()
                }
            ]
        }, {
            label: 'Edit',
            submenu: [
                {label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:'},
                {label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:'},
                {type: 'separator'},
                {label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:'},
                {label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:'},
                {label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:'},
                {label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:'}
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);

    Menu.setApplicationMenu(menu);

    autoUpdater.checkForUpdatesAndNotify().then(null)
};

app.on('ready', createWindow);

app.on(
    'window-all-closed',
    () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    }
);

app.on(
    'activate',
    () => {
        if (win === null) {
            createWindow()
        }
    }
);

autoUpdater.on(
    'update-downloaded',
    () => {
        dialog.showMessageBox(
            {
                type: 'info',
                buttons: ['Restart', 'Later'],
                title: 'Application Update',
                message: 'A new version is available!',
                detail: 'A new version is now available. Restart the application to apply the update.'
            },
            response => {
                if (response === 0) autoUpdater.quitAndInstall()
            }
        )
    }
);

autoUpdater.on('error', (error) => logger.error(error));
