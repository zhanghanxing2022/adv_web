// 获取元素上的所有事件监听器
function getAllEventListeners() {
    const eventListeners = {};

    
    // 遍历所有事件类型
    console.log(document.getEventListeners())
    for (const eventType of eventTypes) {
        // 获取该事件类型的事件监听器数组
        const listeners = document.getEventListeners(eventType);

        // 将事件监听器数组存储到结果对象中
        eventListeners[eventType] = listeners.map(listener => listener.listener);
    }

    return eventListeners;
}

//   // 示例代码
//   // 假设你的事件目标元素是 document.body
//   const targetElement = document.body;

// 阻塞键盘事件的函数
function blockKeyboardEvents(targetElement) {
    const eventListeners = getAllEventListeners(targetElement);

    // 遍历所有事件类型
    for (const eventType in eventListeners) {
        // 获取该事件类型的事件监听器数组
        const listeners = eventListeners[eventType];

        // 遍历该事件类型的事件监听器数组
        for (const listener of listeners) {
            // 移除事件监听器
            targetElement.removeEventListener(eventType, listener);
        }
    }
    return eventListeners;
}

// 恢复键盘事件的函数
function unblockKeyboardEvents(eventListeners) {
    // 遍历所有事件类型
    for (const eventType in eventListeners) {
        // 获取该事件类型的事件监听器数组
        const listeners = eventListeners[eventType];

        // 遍历该事件类型的事件监听器数组
        for (const listener of listeners) {
            // 重新绑定事件监听器
            document.addEventListener(eventType, listener);
        }
    }
}
