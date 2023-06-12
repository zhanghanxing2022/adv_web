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
        this.userService.figures().subscribe(
            (response : any) => {
                let xAxisData = new Array<number>();
                let yAxisData = new Array<number>();
                let skin = new Map<number, string>();
                this.figures = JSON.parse(JSON.stringify(response)).figures;
                console.log(this.figures);
                // 开始下标
                let start = Math.max(this.figures.length - 10, 0);
                let end = Math.min(start + 10, this.figures.length);
                for (var i = start; i < end; i++) {
                    xAxisData.push(i - start + 1);
                    yAxisData.push(this.figure2index.get(this.figures[i].figure) as number);
                    // 设置index和皮肤间的关系
                    skin.set(i - start + 1, this.figures[i].skin);
                }
                this.initLine(xAxisData, yAxisData, skin);
                // 设置map统计次数
                let counting = new Map<string, number>();
                for (var i = 0; i < this.figures.length; i++) {
                    let key = this.figures[i].figure + "-" + this.figures[i].skin;
                    if (counting.has(key)) {
                        counting.set(key, counting.get(key) as number + 1);
                    } else {
                        counting.set(key, 1);
                    }
                }
                // 转成对象生成饼状图
                let count = new Array<any>();
                for (let key of counting.keys()) {
                    count.push({
                        value: counting.get(key),
                        name: key
                    });
                }
                this.initPie(count);
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

    initLine(xAxisData: Array<number>, yAxisData: Array<number>, skin: Map<number, string>) {
        let component = this;
        // 设置图表
        var myChart = echarts.init(document.getElementById("figure-history-echarts-line") as HTMLElement);;
        myChart.setOption({
            title: {
                text: '形象选择记录'
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (param : any) {
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
    }

    initPie(count : Array<any>) {
        // 设置图表
        var myChart = echarts.init(document.getElementById("figure-history-echarts-pie") as HTMLElement);;
        myChart.setOption({
            title: {
                text: '形象选择历史',
                subtext: '统计信息',
                left: 'center'
            },
            tooltip: {
                trigger: 'item'
            },
            legend: {
                orient: 'vertical',
                left: 'left'
            },
            series: [
                {
                    name: 'Access From',
                    type: 'pie',
                    radius: '50%',
                    data: count,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        });
    }

}
