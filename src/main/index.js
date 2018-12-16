'use strict'

import { app, BrowserWindow } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

const { exec } = require('child_process')
// change for different OSs
let rPath = '/usr/local/bin/R'
const rserve = require('rserve-js')

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  // 1. display "Loading" window
  mainWindow.loadURL(winURL)

  // 2. load R daemon
  console.log(' * launching R')

  const rs = exec(`${rPath} -e "Rserve::run.Rserve(args = '--no-save')"`)
  // rs.on('message', (message) => {
  //   console.log(message)
  // })
  // rs.on('close', (code, signal) => {
  //   console.log(
  //     `child process terminated due to receipt of signal ${signal}`);
  // });
  // exec(`kill -9 ${rs.pid}`)
  rs.on('exit', code => {
    console.log(`Exit code is ${code}`)
  })

  let rc = rserve.connect('localhost', 6311, function () {
    rc.eval('as.character(getRversion())', function (err, res) {
      if (err) {
        console.error(err)
        return
      }
      console.log('Connected to R ' + res[0])
      // trigger the app to continue loading
    })
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
