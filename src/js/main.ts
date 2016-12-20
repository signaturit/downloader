const { app, BrowserWindow } = require('electron');

declare var __dirname: string;

declare var process: NodeJS.Process;

let win;

let createWindow = () => {
    win = new BrowserWindow({ width: 400, height: 300, maxWidth: 400, maxHeight: 300, minWidth: 400, minHeight: 300 });

    win.loadURL(`file://${__dirname}/../views/index.html`);

    win.webContents.openDevTools();

    win.on(
        'closed',
        () => {
            win = null;
        }
    );
}

app.on('ready', createWindow);

app.on(
    'window-all-closed',
    () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    }
);

app.on(
    'activate',
    () => {
        if (win === null) {
            createWindow();
        }
    }
);
