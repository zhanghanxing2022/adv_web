import {Component, Input} from '@angular/core';
import {User} from "../User";

@Component({
  selector: 'app-personal-basic-info',
  templateUrl: './personal-basic-info.component.html',
  styleUrls: ['./personal-basic-info.component.css']
})
export class PersonalBasicInfoComponent {

  @Input() user: User | undefined;

  constructor() {
  }

  ngOnInit() {

  }

}
