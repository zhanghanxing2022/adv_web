import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../User';
import { UserService } from '../user.service';

@Component({
    selector: 'app-personal-info',
    templateUrl: './personal-info.component.html',
    styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit {
    user?: User;
    ngOnInit(): void {
        this.profile();
    }

    profile(): void {
        this.userService.profile().subscribe(
            response => {
                this.user = JSON.parse(JSON.stringify(response));
            },
            response => {
                if (response.status === 0) {
                    window.alert("请登录！");
                    this.router.navigateByUrl("user/login");
                } else {
                    window.alert("服务器错误！");
                }
            })
    }

    constructor(
        private route: ActivatedRoute,
        private userService: UserService,
        private location: Location,
        private router: Router
    ) { }

    home() {
        this.router.navigateByUrl("user/personalCenter");
    }

    logout() {
        sessionStorage.clear();
        this.router.navigateByUrl("user/login");
    }
}
