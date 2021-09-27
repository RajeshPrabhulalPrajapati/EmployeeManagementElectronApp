import { Injectable } from '@angular/core';
import { IpcRenderer } from 'electron';
// import { ElectronService } from 'ngx-electron';
import { Observable, of } from 'rxjs';
import { Emp } from 'src/models/emp.model';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  private ipc: IpcRenderer | undefined;
  constructor() {
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
  };

  addEmployee(emp: Emp): Observable<any> {
    return of(
      this.ipc?.send('add-employee', emp));
  }
  updateEmployee(emp: Emp): Observable<any> {
    return of(
      this.ipc?.send('update-employee', emp));
  }
  deleteEmployee(empId: string): Observable<any> {
    return of(
      this.ipc?.send('delete-employee', empId));
  }
  getEmployees(): Observable<any> {
    return of(
      this.ipc?.send('get-employees',""));
  }
  
  catchError(arg0: (error: any) => Observable<never>): any {
    throw new Error('Function not implemented.');
  }
}


