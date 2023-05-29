import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { User } from '../User'
import { Location } from '@angular/common';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.css']
})
export class PersonalInfoComponent implements OnInit{
  user? : User;
  ngOnInit(): void {
      this.getUser();
  }

  getUser(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.userService.getUserById(id)
      .subscribe(response => {
        console.log(response.message);
        if (response.message === "token"){
          alert("请登录!");
          this.router.navigateByUrl("user/login");
        }
        this.user = response.data;
      })
  }

  constructor(
    private route : ActivatedRoute,
    private userService : UserService,
    private location : Location,
    private router : Router
  ) { }
}
