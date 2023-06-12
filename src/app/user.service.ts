import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    constructor(private http: HttpClient, private router: Router) { }
    private ip = "localhost"
    private url = `http://${this.ip}:8080/user/`

    httpOption() {
        let token = sessionStorage.getItem('token');
        let httpOptions;
        if (token === null || token === undefined) {
            httpOptions = new HttpHeaders({
                'Content-Type': 'application/json'
            })
        } else {
            httpOptions = new HttpHeaders({
                'Content-Type': 'application/json',
                'token': token
            });
        }
        return httpOptions;
    }

    login(email: string | null, password: string | null) {
        return this.http.post(this.url + "login", {
            email: email,
            password: password,
        });
    }

    register(username: string | null, password: string | null, email: string | null, phone: string | null) {
        let httpOptions = this.httpOption();
        return this.http.post(this.url + "register", {
            username: username,
            password: password,
            email: email,
            phone: phone,
        }, {
            headers: httpOptions,
        });
    }

    /**
     * 携带token请求获得用户信息
     */
    profile() {
        let httpOptions = this.httpOption();
        return this.http.get(this.url + "profile",
            {
                headers: httpOptions,
            }
        );
    }

    chpwd(oldPassword: string | null, newPassword: string | null) {
        let httpOptions = this.httpOption();
        return this.http.post(this.url + "chpwd",
            {
            oldPassword: oldPassword,
            newPassword: newPassword
            }, {
                headers: httpOptions
            });
    }

    figures() {
        let httpOptions = this.httpOption();
        return this.http.get(this.url + "figures", {
                headers: httpOptions
            });
    }

}
