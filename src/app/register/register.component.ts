import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent{
  constructor(public http : HttpClient, public router : Router){}
  private ip = "localhost"
  private url = `http://${this.ip}:8080/user/`
  emailFormControl = new FormControl('', [Validators.required, Validators.email]);
  nameFormControl = new FormControl('', [Validators.pattern('^[A-Za-z0-9]+$'), Validators.minLength(6)]);
  passwordFormControl = new FormControl('', [Validators.pattern('^[A-Za-z0-9]+$'), Validators.minLength(6)]);

  greeting(){
    const httpOptions = { 
      headers: new HttpHeaders({ 'Content-Type': 'text/plain' }),
      responseType : 'text' as const
    };
    this.http.get(this.url + "greeting", httpOptions).subscribe(
      (response : any) => {
        alert(response);
        
      }
    )
  }

  register(){
    if (this.emailFormControl.invalid || this.nameFormControl.invalid
      || this.passwordFormControl.invalid){
        alert("输入有误");
        return;
      }
    const httpOptions = { 
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }) 
    };
    let body = {
      id : 0,
      email : this.emailFormControl.value,
      username : this.nameFormControl.value,
      password : this.passwordFormControl.value
    }
    this.http.post(this.url + "register", body, httpOptions).subscribe(
      (response : any) => {
        window.alert("注册成功");
        this.router.navigateByUrl("user/login");
      }, response => {
        window.alert(response.error);
      }
    )
  }
}
