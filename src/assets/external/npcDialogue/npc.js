// 获取存储状态或设置初始状态
function npcINit()
{
    var currentStage = localStorage.getItem("npcDialogueStage") || dialogueData.npc1.initialStage;
    // NPC 对话内容
    var npcDialogueStage = "";
    var currentChar = 0; // 当前显示的字符索引
    
    // 获取弹窗和选项元素
    var npcPopup = document.getElementById("npc-popup");
    var npcMessage = document.getElementById("npc-message");
    var optionsPopup = document.getElementById("options-popup");
}


// 逐字显示 NPC 对话
function loadNPCDialogue(stage) {
    npcPopup.style.display = "block";

    npcDialogueStage = dialogueData.npc1.stages[stage];
    npcMessage.textContent = "";
    // 逐字显示 NPC 对话
    currentChar = 0;
    // 保存当前阶段到本地存储
    localStorage.setItem("npcDialogueStage", stage);
    npcPopup.style.height = npcMessage.offsetHeight+40 + "px";
    var timer = setInterval(function () {
        npcMessage.textContent += npcDialogueStage.dialogue[currentChar];
        currentChar++;
        if (currentChar >= npcDialogueStage.dialogue.length) {
            clearInterval(timer);
            showOptionsPopup(npcDialogueStage.options);
        }
    }, 50);

    // 调整弹窗高度
    
}

// 显示选项弹窗
function showOptionsPopup(options) {
    optionsPopup.innerHTML = "";
    // 创建选项按钮
    options.forEach(function (option) {
        var optionBtn = document.createElement("div");
        optionBtn.textContent = option.content;
        optionBtn.classList.add("child-div")
        optionBtn.addEventListener("click", function () {
            var selectedOption = options.find(function (opt) {
                return opt.id === option.id;
            });
            if (selectedOption) {
                loadNPCDialogue(selectedOption.res);
            }
        });
        optionsPopup.appendChild(optionBtn);
    });
    optionsPopup.style.display = "flex";
}

// 清除本地存储并重置状态
function resetDialogue() {
    localStorage.removeItem("npcDialogueStage");
    currentStage = dialogueData.npc1.initialStage;
}

// // 检查是否需要重置对话状态
// window.addEventListener("beforeunload", function () {
//     resetDialogue();
// });

// // 添加一个事件监听器，当窗口大小改变时重新调整弹窗高度
// window.addEventListener("resize", function () {
//     npcPopup.style.height = npcMessage.offsetHeight + "px";
// });

// // 初始化 NPC 对话
// loadNPCDialogue(currentStage);