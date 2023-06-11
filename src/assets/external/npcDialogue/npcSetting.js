var dialogueData = {
    Mouse: {
        initialStage: "stage1",
        fbx:"fbx/character/mouse/Idle.fbx",
        position:[3122,0,-175],
        scale:[2,2,2],
        rotation:[0,Math.PI,0],
        stages: {
            stage1: {
                dialogue: "欢迎来到碧蓝航线！你想和我聊些什么？",
                options: [
                    { id: "option1", content: "问候", res: "stage2" },
                    { id: "option2", content: "询问任务", res: "stage3" },
                    { id: "option3", content: "道别", res: "stage4" }
                ],
                end:false
            },
            stage2: {
                dialogue: "你好！有什么可以帮助你的吗？",
                options: [
                    { id: "option4", content: "继续问候", res: "stage2" },
                    { id: "option5", content: "结束对话", res: "stage4" }
                ],
                end:false
            },
            stage3: {
                dialogue: "现在没有新的任务，你可以先去探索一下世界。",
                options: [
                    { id: "option6", content: "继续询问任务", res: "stage3" },
                    { id: "option7", content: "结束对话", res: "stage4" }
                ],
                end:false
            },
            stage4: {
                dialogue: "再见！祝你好运！",
                options: [],
                end:true
            }
        }
    }
};
var communicate = false;