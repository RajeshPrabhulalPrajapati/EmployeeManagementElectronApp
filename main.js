const { autoUpdater } = require('electron-updater');
const { app, BrowserWindow, globalShortcut, Tray, Menu, MenuItem,  dialog,ipcMain } = require('electron');
const os = require('os');

//const sqlite3 = require('@journeyapps/sqlcipher').verbose();
// require('update-electron-app')({
//   repo: 'https://github.com/RajeshPrabhulalPrajapati/EmployeeManagementElectronApp'
// })
//console.log("before sql init");
//const sqlite = require('sqlite-cipher');
//console.log("after sql init");
 const platforms = {
    WINDOWS: 'WINDOWS',
    MAC: 'MAC',
    LINUX: 'LINUX',
    SUN: 'SUN',
    OPENBSD: 'OPENBSD',
    ANDROID: 'ANDROID',
    AIX: 'AIX',
};

const platformsNames = {
    win32: platforms.WINDOWS,
    darwin: platforms.MAC,
    linux: platforms.LINUX,
    sunos: platforms.SUN,
    openbsd: platforms.OPENBSD,
    android: platforms.ANDROID,
    aix: platforms.AIX,
};

const currentPlatform = platformsNames[os.platform()];
const url = require("url");
const path = require("path");
const notifier = require('node-notifier');
let mainWindow;
let iconPath = path.join(__dirname, `/dist/assets/electron-app-icon.png`);
let tray;
console.log(iconPath);
let db;

async function  createWindow() {  
  
    console.log("before connection");
        // const connection = await createConnection({
        //   type: 'sqlite',
        //   synchronize: true,
        //   logging: true,
        //   logger: 'simple-console',
        //   database: 'C:/Users/Rajesh.Prajapati/Desktop/Rajesh Prajapati/SqLite/electron.sqlite',
        //   entities: [ Emp ],
        // });   
    //db = new sqlite3.Database(path.join(__dirname, `/dist/assets/myDB.db`));
    //db.run("PRAGMA cipher_compatibility = 4");  
    //db.run("PRAGMA key = 'Prabhulal'"); 
    //sqlite.connect(path.join(__dirname, `/dist/assets/myDB.db`),'myPass','aes-256-ctr');
    //db.run("CREATE TABLE IF NOT EXISTS Emp (EmpId uniqueidentifier primary key,EmpName varchar(50),EmpDepartment varchar(50),EmpPhoneNo varchar(50));")
    
    //sqlite.run("CREATE TABLE IF NOT EXISTS Emp (EmpId uniqueidentifier primary key,EmpName varchar(50),EmpDepartment varchar(50),EmpPhoneNo varchar(50));")
   // const empRepo = connection.getRepository(Emp);



    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true,
            webSecurity: false
        }
    })
   

    mainWindow.loadURL(
        url.format({
            pathname: path.join(__dirname, `/src/index.html`),
            protocol: "file:",
            slashes: true
        })

        
    );
    // Open the DevTools.
    //mainWindow.webContents.openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null
    });

    mainWindow.on('close', function (event) {
      const choice = require('electron').dialog.showMessageBoxSync(this,
        {
          type: 'question',
          buttons: ['Yes', 'No'],
          title: 'Confirm',
          message: 'Are you sure you want to quit?'
        });
      if (choice === 1) {
        event.preventDefault();
      }
    });

    ipcMain.on('restart_app', () => {
        autoUpdater.quitAndInstall();
      });

    // ipcMain.on('get-employees', async (event, _item) => {        
    //     try {          
    //       console.log("in Get employees..");
    //         db.all("select * from Emp", (err, rows) => {
    //             if (err) {
    //             return console.log(err.message);                
    //             } 
    //             console.log("Employees",rows)
    //             mainWindow.webContents.send("employeeList",rows); 
    //           });
    //     } catch (err) {
    //       throw err;
    //     }
    //   });

    // ipcMain.on('add-employee', async (event, _item) => {        
    //     try {          
    //       db.run(`INSERT INTO Emp (EmpId,EmpName,EmpDepartment,EmpPhoneNo) VALUES(?,?,?,?)`,[_item.empId,_item.empName,_item.empDepartment,_item.empPhoneNo], function(err) {
    //         if (err) {
    //           return console.log(err.message);
    //         }            
    //         console.log(`A Emp has been inserted with empid ${_item.empId}`);
    //       });           
    //     } catch (err){
    //       throw err;
    //     }
    //   });

      // ipcMain.on('update-employee', async (event, _item) => {        
      //   try {          
      //     db.run(`update Emp SET EmpName=?, EmpDepartment=?, EmpPhoneNo=? where EmpId =?`,[_item.empName,_item.empDepartment,_item.empPhoneNo,_item.empId], function(err) {
      //       if (err) {
      //         return console.log(err.message);
      //       }     
      //       console.log(`A Emp has been updated with empid ${_item.empId}`);
      //     });              

      //   } catch (err) {
      //     throw err;
      //   }
      // });

      // ipcMain.on('delete-employee', async (event, empId) => {        
      //   try {          
      //     db.run(`delete from Emp where EmpId =?`,[empId], function(err) {
      //       if (err) {
      //         return console.log(err.message);
      //       }                     
      //       console.log(`A Emp has been deleted with empid ${empId}`);
      //     });              

      //   } catch (err) {
      //     throw err;
      //   }
      // });

      
    defineShortCuts();
    defineContextMenu();
    defineTray();

    function defineShortCuts() {
        globalShortcut.register("CTRL + Up", () => {
            mainWindow.webContents.send("zoomIn", "");
        });

        globalShortcut.register("CTRL + Down", () => {
            mainWindow.webContents.send("zoomOut", "");
        });
    }

    function defineContextMenu() {
        const contextMenuOnRightCLick = new Menu();
        // Build menu one item at a time, unlike
        contextMenuOnRightCLick.append(new MenuItem({
            label: 'System info.',
            click() {              

                notifier.notify({
                    title: 'My awesome title',
                    message: `Hello ${currentPlatform} user ! You are using ${currentPlatform} system.`,
                    icon: path.join(__dirname, `/dist/assets/smily.png`),
                    sound: true,             

                }, function (err, response) {
                   
                });

            }
        }
        ));

        contextMenuOnRightCLick.append(new MenuItem({
            label: 'Context menu demo',
            click() {
                const options = {
                    type: 'question',
                    buttons: ['Ok'],
                    defaultId: 2,
                    title: 'Context menu demo',
                    message: 'Hello user !',
                    detail: 'This is an example of context Menu .',
                    //checkboxLabel: 'Remember my answer',
                    // checkboxChecked: true,
                };

                dialog.showMessageBox(null, options, (response, checkboxChecked) => {
                    console.log(response);
                    console.log(checkboxChecked);
                });
            }
        }
        ));

        mainWindow.webContents.on('context-menu', () => {
            contextMenuOnRightCLick.popup();
        });

        mainWindow.once('ready-to-show', () => {
          autoUpdater.checkForUpdatesAndNotify();
        });
    }

    function defineTray() {

        tray = new Tray(iconPath);
        tray.setToolTip("Electron demo app");

        tray.on("click", () => {
            mainWindow.show();
        });

        const contextMenu = Menu.buildFromTemplate([
            {
                label: 'Quit', click: function () {
                    app.isQuiting = true;
                    app.quit();
                    //db.close();
                }
            }
        ]);
        tray.setContextMenu(contextMenu);
    }

}

// autoUpdater.on('update-downloaded', (event, releaseNotes, releaseName) => {
//   console.log('updated-downloaded.....');
//   const dialogOpts = {
//       type: 'info',
//       buttons: ['Restart', 'Not Now. On next Restart'],
//       title: 'Update',
//       message: process.platform === 'win32' ? releaseNotes : releaseName,
//       detail: 'A New Version has been Downloaded. Restart Now to Complete the Update.'
//   }

//   dialog.showMessageBox(dialogOpts).then((returnValue) => {
//       if (returnValue.response === 0) autoUpdater.quitAndInstall()
//   })
// })

autoUpdater.on('error', message => {
  console.error('There was a problem updating the application')
  console.error(message)
})

autoUpdater.on("checking-for-update", () => {
  //your code
   console.log('updated-downloaded.....');
});

/*No updates available*/
autoUpdater.on("update-not-available", info => {
  //your code
  console.log('update-not-available.....');
});

/*New Update Available*/
// autoUpdater.on("update-available", info => {
//   //your code
//   console.log('update-available.....');
  
// });

app.on("ready", function() {
  createWindow(); 
 });

app.on('before-quit', (event) => { 
  //console.log('before exit ....');
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit();//db.close();
})

app.on('activate', function () {
    if (mainWindow === null) createWindow()
})

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update_available');
});autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update_downloaded');
});
