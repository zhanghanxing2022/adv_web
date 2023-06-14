// 获取存储状态或设置初始状态

function npcINit() {
    // NPC 对话内容
    var npcDialogueStage = "";
    var currentChar = 0; // 当前显示的字符索引

    // 获取弹窗和选项元素
    var npcPopup = document.getElementById("npc-popup");
    var npcMessage = document.getElementById("npc-message");
    var optionsPopup = document.getElementById("options-popup");
}


var listeners;
function loadNPCDialogue(npc) {
    loadNPCDialogueStep(npc, dialogueData[npc].initialStage)
}
var callbackList=[];
// 关闭对话
function closeDialogue() {
    optionsPopup.style.display = "none";
    npcPopup.style.display = "none";
    console.log("remove");
    callbackList.flat(2).forEach(f=>f());
    callbackList = [];
    communicate = false;
}
// 逐字显示 NPC 对话
function loadNPCDialogueStep(npc, stage) {
    npcINit();
    npcPopup.style.display = "block";

    npcDialogueStage = dialogueData[npc].stages[stage];
    npcMessage.textContent = "";
    // 逐字显示 NPC 对话
    currentChar = 0;
    document.getElementById("npc-name").textContent = npc;
    // 保存当前阶段到本地存储
    // npcPopup.style.height = npcMessage.offsetHeight+40 + "px";
    var timer = setInterval(function () {
        npcMessage.textContent += npcDialogueStage.dialogue[currentChar];
        currentChar++;
        if (currentChar >= npcDialogueStage.dialogue.length) {
            clearInterval(timer);
            if (npcDialogueStage.end) {
                setTimeout(() => {
                    closeDialogue();
                }, 1000);
            } else {
                showOptionsPopup(npc, npcDialogueStage.options);
            }
        }
    }, 50);

    // 调整弹窗高度

}

// 显示选项弹窗
function showOptionsPopup(npc, options) {
    optionsPopup.innerHTML = "";
    // 创建选项按钮

    options.forEach(function (option) {
        var optionBtn = document.createElement("div");
        optionBtn.textContent = option.content;
        optionBtn.classList.add("child-div")
        optionBtn.addEventListener("click", function () {
            optionsPopup.innerHTML = "";

            var selectedOption = options.find(function (opt) {
                return opt.id === option.id;
            });
            if (selectedOption) {

                callbackList.push(selectedOption.callback);
                console.log(selectedOption)
                loadNPCDialogueStep(npc, selectedOption.res);
            }
        });
        optionsPopup.appendChild(optionBtn);
    });
    optionsPopup.style.display = "flex";
}



// 添加一个事件监听器，当窗口大小改变时重新调整弹窗高度
window.addEventListener("resize", function () {
    npcPopup.style.height = npcMessage.offsetHeight + "px";
});

// // 初始化 NPC 对话
// loadNPCDialogue(currentStage);
