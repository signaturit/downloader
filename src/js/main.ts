const { app, BrowserWindow, Menu } = require('electron')

declare var __dirname: string

declare var process: NodeJS.Process

let win

let createWindow = () => {
    let width  = 400
    let height = process.platform == 'darwin' ? 300 : 340

    win = new BrowserWindow({ width: width, height: height, maxWidth: width, maxHeight: height, minWidth: width, minHeight: height })

    win.loadURL(`file://${__dirname}/../views/index.html`)

    win.webContents.openDevTools()

    win.on(
        'closed',
        () => {
            win = null
        }
    )

    var template = [
        {
            label: 'Downloader',
            submenu: [
                { label: 'About Application', selector: 'orderFrontStandardAboutPanel:' },
                { type: 'separator' },
                { label: 'Clear', click: () => { win.webContents.executeJavaScript('localStorage.clear(); location.reload()') }},
                { type: 'separator' },
                { label: 'Quit', accelerator: 'Command+Q', click: () => { app.quit() }}
            ]
        }, {
            label: 'Edit',
            submenu: [
                { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
                { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
                { type: 'separator' },
                { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
                { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
                { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
                { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' }
            ]
        }
    ]

    Menu.setApplicationMenu(
        Menu.buildFromTemplate(template)
    )
}

app.on('ready', createWindow)

app.on(
    'window-all-closed',
    () => {
        if (process.platform !== 'darwin') {
            app.quit()
        }
    }
)

app.on(
    'activate',
    () => {
        if (win === null) {
            createWindow()
        }
    }
)
