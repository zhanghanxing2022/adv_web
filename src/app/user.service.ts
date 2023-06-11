import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http : HttpClient, private router : Router) { }
  private ip = "localhost"
  private url = `http://${this.ip}:8080/user/`

  getUser() : Observable<any>{
    let token = sessionStorage.getItem('token');
    let httpOptions = null;
    if (token === null || token === undefined) {
      httpOptions = new HttpHeaders({});
    } else {
      httpOptions = new HttpHeaders({
        'token': token
      });
    }
    return this.http.get(this.url + "profile",
    {
      headers : httpOptions,
    }
      );
  }



}
