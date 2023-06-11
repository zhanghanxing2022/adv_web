import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';
import {UserService} from "../user.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(public http : HttpClient, public router : Router, private userService : UserService){}
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.pattern('^[A-Za-z0-9]+$'), Validators.minLength(6)]);

  login(){
    // 校验输入
    if (this.emailFormControl.invalid || this.passwordFormControl.invalid){
      alert("输入有误")
      return;
    }
    // 请求登录
    this.userService.login(this.emailFormControl.value, this.passwordFormControl.value).subscribe(
      (response : any) => {
        console.log(response);
        alert("登录成功");
        sessionStorage.setItem("token", response.token);
        this.router.navigateByUrl("user/personalInfo");
      }, (response : any) => {
        window.alert(response.error);
      }
    )
  }
}
