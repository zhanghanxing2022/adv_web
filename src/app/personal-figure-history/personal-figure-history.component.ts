import { Component } from '@angular/core';
import {UserService} from "../user.service";
import {Router} from "@angular/router";
import * as echarts from "echarts"

@Component({
  selector: 'app-personal-figure-history',
  templateUrl: './personal-figure-history.component.html',
  styleUrls: ['./personal-figure-history.component.css']
})
export class PersonalFigureHistoryComponent {
    figures ? : any
    figure2index: Map<string, number> = new Map<string, number>();
    index2figure: Map<number, string> = new Map<number, string>();
    constructor(
        private userService : UserService,
        private router: Router,) {
        this.figure2index.set("amy", 1);
        this.figure2index.set("jimmy", 2);
        this.figure2index.set("mouse", 3);
        this.figure2index.set("rabbit", 4);
        this.index2figure.set(1, "amy");
        this.index2figure.set(2, "jimmy");
        this.index2figure.set(3, "mouse");
        this.index2figure.set(4, "rabbit");
    }

    data() {
        let component = this;
        this.userService.figures().subscribe(
            (response : any) => {
                let xAxisData = [];
                let yAxisData = [];
                let skin = new Map<number, string>();
                this.figures = JSON.parse(JSON.stringify(response)).figures;
                console.log(this.figures);
                for (var i = 0; i < 10 && i < this.figures.length; i++) {
                    xAxisData.push(i + 1);
                    yAxisData.push(this.figure2index.get(this.figures[i].figure));
                    // 设置index和皮肤间的关系
                    skin.set(i + 1, this.figures[i].skin);
                }
                console.log(xAxisData);
                // 设置图表
                var myChart = echarts.init(document.getElementById("figure-history-echarts") as HTMLElement);;
                myChart.setOption({
                    title: {
                        text: '形象选择记录'
                    },
                    tooltip: {
                        trigger: 'axis',
                        formatter: function (param : any) {
                            // for (let key of skin.keys()) {
                            //     console.log(key);
                            //     console.log(skin.get(key));
                            // }
                            return "皮肤：" + skin.get(Number(param[0].name));
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: xAxisData
                    },
                    yAxis: {
                        name: "形象",
                        type: 'value',
                        interval: 1, // 步长
                        axisLabel: {
                            formatter: function (value: any, index: number) {
                                return component.index2figure.get(index);
                            }
                        }
                    },
                    series: [
                        {
                            type: 'line',
                            data: yAxisData,
                        }
                    ]
                });
            },
            (response : any) => {
                window.alert("请登陆！");
                this.router.navigateByUrl("user/login");
            }
        );

    }

    ngAfterViewInit() {
        this.data();

    }

}
