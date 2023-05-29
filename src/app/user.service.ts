import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http : HttpClient, private router : Router) { }
  private ip = "34.201.157.50"
  private url = `http://${this.ip}:8080/user/`

  getUserById(id : number) : Observable<any>{
    let token = sessionStorage.getItem('token');
    if (token === null || token === undefined)
      token = "null";
    const httpOptions = new HttpHeaders({
      'token' : token,
    })
    return this.http.get(this.url + "getUserById", 
    {
      headers : httpOptions,
      params : {'id' : id}
    }
      );
  }



}
