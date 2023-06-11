import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import {UserService} from "../user.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent{
  constructor(public http : HttpClient, public router : Router, private userService: UserService){}

  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  nameFormControl = new FormControl('', [Validators.pattern('^[A-Za-z0-9]+$'), Validators.minLength(6)]);
  passwordFormControl = new FormControl('', [Validators.pattern('^[A-Za-z0-9]+$'), Validators.minLength(6)]);
  phoneFormControl = new FormControl('', [Validators.required, Validators.pattern('^[A-Za-z0-9]+$')]);

  register(){
    // 注册信息
    if (this.emailFormControl.invalid || this.nameFormControl.invalid
      || this.passwordFormControl.invalid){
        alert("输入有误");
        return;
      }
    const httpOptions = { 
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }) 
    };
    this.userService.register(
        this.nameFormControl.value,
        this.passwordFormControl.value,
        this.emailFormControl.value,
        this.phoneFormControl.value
    ).subscribe(
      (response : any) => {
        window.alert("注册成功");
        this.router.navigateByUrl("user/login");
      },
        response => {
        window.alert(response.error);
      }
    )
  }
}
