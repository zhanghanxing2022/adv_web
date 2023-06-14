var dialogueData = {
    Mouse: {
        initialStage: "stage1",
        fbx: "fbx/character/mouse/Idle.fbx",
        position: [3122, 0, -175],
        scale: [2, 2, 2],
        rotation: [0, Math.PI, 0],
        stages: {
            stage1: {
                dialogue: "欢迎来到四盒院！你想和我聊些什么？",
                options: [
                    { id: "option1", content: "问候", res: "stage2", callback: [] },
                    { id: "option2", content: "询问任务", res: "stage3", callback: [] },
                    { id: "option3", content: "道别", res: "stage4", callback: [] },
                    { id: "option4", content: "我要前往其他世界", res: "stage5", callback: [] },
                ],
                end: false
            },
            stage2: {
                dialogue: "你好！有什么可以帮助你的吗？",
                options: [
                    { id: "option5", content: "继续问候", res: "stage2", callback: [] },
                    { id: "option6", content: "结束对话", res: "stage4", callback: [] }
                ],
                end: false
            },
            stage3: {
                dialogue: "现在没有新的任务，你可以先去探索一下世界。",
                options: [
                    { id: "option7", content: "继续询问任务", res: "stage3", callback: [] },
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
                ],
                end: false
            }
        }
    }
};
var NPCcommunicate = false;