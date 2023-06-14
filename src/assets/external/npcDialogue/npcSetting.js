var dialogueData = {
    Mouse: {
        initialStage: "stage1",
        fbx: "fbx/character/mouse/Idle.fbx",
        position: [3122, 0, -175],
        scale: [2, 2, 2],
        rotation: [0, Math.PI, 0],
        stages: {
            stage1: {
                dialogue: "欢迎来到这个3D世界！我是这里的向导，你有什么想要了解的么？",
                options: [
                    { id: "option1", content: "这里存在的意义是什么", res: "stage2", callback: [] },
                    { id: "option2", content: "请介绍一下这里吧", res: "stage3", callback: [] },
                    { id: "option3", content: "道别", res: "stage4", callback: [] },
                    { id: "option4", content: "我要前往其他世界", res: "stage5", callback: [] },
                ],
                end: false
            },
            stage2: {
                dialogue: "这里存在的意义是用于演示一下一些排序算法和数据结构。",
                options: [
                    { id: "option5", content: "继续询问", res: "stage1", callback: [] },
                    { id: "option6", content: "结束对话", res: "stage4", callback: [] }
                ],
                end: false
            },
            stage3: {
                dialogue: "这是一个多人在线web3d平台，在这个世界里，人们可以选择自己的3d人物形象，各个用户在世界内可以相互看见，相互聊天，并且可以一同观察算法的演示。",
                options: [
                    { id: "option7", content: "继续询问", res: "stage1", callback: [] },
                    { id: "option8", content: "结束对话", res: "stage4", callback: [] }
                ],
                end: false
            },
            stage4: {
                dialogue: "再见！祝你好运！",
                options: [],
                end: true
            },
            stage5: {
                dialogue: "1\ 排序算法演示\n2: 二叉树遍历演示\n3: 推箱子小游戏\n4: 五子棋小游戏\n",
                options: [
                    { id: "option5_1", content: "1", res: "stage4", callback: [] },
                    { id: "option5_2", content: "2", res: "stage4", callback: [] },
                    { id: "option5_3", content: "3", res: "stage4", callback: [] },
                    { id: "option5_4", content: "4", res: "stage4", callback: [] },
                    {id:"option5_5",content:"放弃",res:"stage4",callback:[]}
                ],
                end: false
            }
        }
    }
};
var NPCcommunicate = false;