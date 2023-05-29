import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  constructor(public http : HttpClient, public router : Router){}
  private ip = "34.201.157.50";
  //private ip = "localhost"
  private url = `http://${this.ip}:8080/user/`;
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  passwordFormControl = new FormControl('', [Validators.pattern('^[A-Za-z0-9]+$'), Validators.minLength(6)]);

  login(){
    if (this.emailFormControl.invalid || this.passwordFormControl.invalid){
      alert("输入有误")
      return;
    }
    let body = {
      id : 0,
      email : this.emailFormControl.value,
      username : "",
      password : this.passwordFormControl.value
    }
    this.http.post(this.url + "login", body).subscribe(
      (response : any) => {
        console.log(response);
        if (response.data === null){
          alert("账号或密码错误");
          return;
        }
        alert("登录成功");
        sessionStorage.setItem("token", response.token);
        this.router.navigateByUrl("user/personalInfo/" + response.data.id)
      }
    )
  }
}
