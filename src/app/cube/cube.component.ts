import { Component } from '@angular/core';
import { threeStart } from "./index";

@Component({
  selector: 'app-cube',
  templateUrl: './cube.component.html',
  styleUrls: ['./cube.component.css']
})
export class CubeComponent {
    constructor() {
    }

    ngOnInit() {
        threeStart();
    }
}
