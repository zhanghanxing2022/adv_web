import { Component } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Router} from "@angular/router";
import {UserService} from "../user.service";
import {FormControl, Validators} from "@angular/forms";

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent {
  constructor(public http: HttpClient, public router: Router, private userService: UserService) {
  }

  passwordFormControl = new FormControl('', [Validators.pattern('^[A-Za-z0-9]+$'), Validators.minLength(6)]);
  oldPasswordFormControl = new FormControl('', [Validators.pattern('^[A-Za-z0-9]+$'), Validators.minLength(6)]);

  chpwd() {
    // 校验输入
    if (this.oldPasswordFormControl.invalid || this.passwordFormControl.invalid) {
      alert("输入有误")
      return;
    }

    // 修改密码请求
    this.userService.chpwd(this.oldPasswordFormControl.value, this.passwordFormControl.value).subscribe(
        response => {
          alert("修改密码成功，请重新登陆");
          // 重新登录
          sessionStorage.clear();
          this.router.navigateByUrl("user/login");
        },
        response => {
          window.alert(response.error);
        }
    )


  }
}