import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IpcRenderer, WebFrame } from 'electron';
import { Emp } from 'src/models/emp.model';
import { AppService } from 'src/services/app.service';
import { v4 as uuidv4 } from 'uuid';
declare var $: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'SqLiteCrudWithAngularElectron';

  private ipc: IpcRenderer | undefined;
  private webFrame: WebFrame | undefined;
  empList: Emp[] = [];
  isEdit: boolean = false;
  tmpEmpId: string = '';
  empForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    department: new FormControl('', [Validators.required]),
    phoneNo: new FormControl('', [Validators.required])
  });
  tmpEmployee:Emp;
  
  @ViewChild('myDiv') myInput: ElementRef;

  constructor(private appService: AppService) {
    if ((<any>window).require) {
      try {
        this.ipc = (<any>window).require('electron').ipcRenderer;
        this.webFrame = (<any>window).require('electron').webFrame;
      } catch (e) {
        throw e;
      }
    } else {
      console.warn('App not running inside Electron!');
    }
    
    this.ipc?.on('test', (event,msg) => {      
      console.log(msg);     
    });

    this.ipc?.on('update_available', () => {
      console.log('update_available');      
      const message = document.getElementById('message');
      const notification = document.getElementById('notification');

      this.ipc?.removeAllListeners('update_available');        
      message.innerText = 'A new update is available. Downloading now...';
      notification.classList.remove('hidden');

    });
    this.ipc?.on('update_downloaded', () => {
      console.log('update_downloaded');     
      const message = document.getElementById('message');
      const notification = document.getElementById('notification');    
      const restartButton = document.getElementById('restart-button');

      this.ipc?.removeAllListeners('update_downloaded');     ;
      message.innerText = 'Update Downloaded. It will be installed on restart. Restart now?';
      restartButton.classList.remove('hidden');
      notification.classList.remove('hidden');
    });

    this.ipc?.on('zoomIn', (event, data) => {
      this.webFrame?.setZoomFactor(this.webFrame?.getZoomFactor() + 0.5);
    });

    this.ipc?.on('zoomOut', (event, data) => {
      this.webFrame?.setZoomFactor(this.webFrame?.getZoomFactor() - 0.5);
    });

 
    
  }

  closeNotification() {
    const notification = document.getElementById('notification');
    notification.classList.add('hidden');
  }

  restartApp() {
    this.ipc?.send('restart_app');
  }

  ngOnInit()
  {
    this.ipc?.on('employeeList', (event, data) => {
      console.log("res =>", data);
      this.empList =[];
        data.map((d) => {
        let emp = new Emp();
        emp.empId = d.EmpId;
        emp.empDepartment = d.EmpDepartment;
        emp.empName = d.EmpName;
        emp.empPhoneNo = Math.floor(d.EmpPhoneNo).toString();
        this.empList.push(emp);
      });
      console.log("empList =>", this.empList);
      
    });

    this.appService.getEmployees().subscribe((items) => {

    });
  }

  ngAfterViewInit()
  {
    setTimeout(() => {
      this.myInput.nativeElement.click();  
    }, 1000);
     
  }

  addUpdateEmp() {
    if (this.isEdit) {
      let emp = this.empList.find(e => e.empId === this.tmpEmpId);
      emp.empDepartment = this.empForm.value.department;
      emp.empName = this.empForm.value.name;
      emp.empPhoneNo = this.empForm.value.phoneNo;
      this.appService.updateEmployee(emp).subscribe((items) => {
        this.resetForm();
      });
      //this.resetForm();
    }
    else {
      let emp = new Emp();
      emp.empId = uuidv4();
      emp.empDepartment = this.empForm.value.department;
      emp.empName = this.empForm.value.name;
      emp.empPhoneNo = this.empForm.value.phoneNo;
      this.empList.push(emp);
      this.appService.addEmployee(emp).subscribe((items) => {
        this.resetForm();
      });
     // this.resetForm();
    }


  }

  resetForm() {
    this.tmpEmpId = '';
    this.isEdit = false;
    this.empForm.reset();
  }

  editEmp(empId: string) {
    this.isEdit = true;
    this.tmpEmpId = empId;
    const emp = this.empList.find(e => e.empId === empId);
    this.empForm.controls.department.patchValue(emp.empDepartment);
    this.empForm.controls.name.patchValue(emp.empName);
    this.empForm.controls.phoneNo.patchValue(emp.empPhoneNo);
  }

  tmpRemove(empId: string)
  {
    this.tmpEmployee = this.empList.find(e => e.empId === empId);
    if(confirm(`Are you sure , want to delete employee ${this.tmpEmployee .empName} ?`))
    {
      this.removeEmp(this.tmpEmployee.empId);
    }
  }
  removeEmp(empId: string) {
    this.empList.splice(this.empList.indexOf(this.empList.find(e => e.empId === empId)), 1);
    this.appService.deleteEmployee(empId).subscribe((res) => {
      this.tmpEmployee = undefined;
    });
  }

}
