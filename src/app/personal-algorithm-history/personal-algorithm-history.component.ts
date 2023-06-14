import { Component } from '@angular/core';
import {UserService} from "../user.service";
import {Router} from "@angular/router";
import * as echarts from "echarts";

@Component({
  selector: 'app-personal-algorithm-history',
  templateUrl: './personal-algorithm-history.component.html',
  styleUrls: ['./personal-algorithm-history.component.css']
})
export class PersonalAlgorithmHistoryComponent {
  algorithms ? : any
  algorithm2index: Map<string, number> = new Map<string, number>();
  index2algorithm: Map<number, string> = new Map<number, string>();

  constructor(
      private userService : UserService,
      private router : Router
  ) {
    this.algorithm2index.set("冒泡排序", 1);
    this.algorithm2index.set("选择排序", 2);
    this.algorithm2index.set("二叉树遍历", 3);
    this.algorithm2index.set("BST", 4);
    this.algorithm2index.set("HeapSort", 5);
    this.algorithm2index.set("MergeSort", 6);
    this.algorithm2index.set("QuickSort", 7);
    this.index2algorithm.set(1, "冒泡排序");
    this.index2algorithm.set(2, "选择排序");
    this.index2algorithm.set(3, "二叉树遍历");
    this.index2algorithm.set(4, "BST");
    this.index2algorithm.set(5, "HeapSort");
    this.index2algorithm.set(6, "MergeSort");
    this.index2algorithm.set(7, "QuickSort");
  }

  ngAfterViewInit() {
    this.data();
  }

  data() {
    this.userService.algorithms().subscribe(
        (response : any) => {
          let xAxisData = new Array<number>();
          let yAxisData = new Array<number>();
          let tip = new Map<number, string>();
          this.algorithms = JSON.parse(JSON.stringify(response)).userAlgorithmList;
          console.log(this.algorithms);
          // 开始下标
          let start = Math.max(this.algorithms.length - 10, 0);
          let end = Math.min(start + 10, this.algorithms.length);
          for (var i = start; i < end; i++) {
            xAxisData.push(i - start + 1);
            yAxisData.push(this.algorithm2index.get(this.algorithms[i].algorithm) as number);
            // 设置index和类型间的关系
            tip.set(i - start + 1, "类型：" + this.algorithms[i].type + "<br>" + "时间：" + this.algorithms[i].time);
          }
          this.initLine(xAxisData, yAxisData, tip);
          // 设置map统计次数
          let counting = new Map<string, number>();
          for (var i = 0; i < this.algorithms.length; i++) {
            let key = this.algorithms[i].algorithm + "-" + this.algorithms[i].type;
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
          window.alert("请登录!");
          this.router.navigateByUrl("user/login");
    }
    );
  }

  initLine(xAxisData: Array<number>, yAxisData: Array<number>, tip: Map<number, string>) {
    let component = this;
    // 设置图表
    var myChart = echarts.init(document.getElementById("algorithm-history-echarts-line") as HTMLElement);;
    myChart.setOption({
      title: {
        text: '算法学习记录'
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (param : any) {
          return tip.get(Number(param[0].name));
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
            return component.index2algorithm.get(index);
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
    var myChart = echarts.init(document.getElementById("algorithm-history-echarts-pie") as HTMLElement);;
    myChart.setOption({
      title: {
        text: '算法学习历史',
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


