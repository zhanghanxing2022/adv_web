const config = {};
config.characters = ["rabbit", "amy", "jimmy", "mouse"];

config.skinMap = new Map([
    ["rabbit", ["rabbit","粉色妖精小兔♪", "黑旋风"]],
    ["mouse", ["mouse","强健体魄"]],
    ["jimmy", ["jimmy"]],
    ["amy", ["amy"]]
])

config.transformMap = new Map([
    ["rabbit", {"scale" : 15, "y" : 50}],
    ["mouse", {"scale" : 1.95, "y" : 50}],
    ["jimmy", {"scale" : 1.95, "y" : 50}],
    ["amy", {"scale" : 1.95, "y" : 50}],
])

// rabit 的material
// 0对应衣服, 2对应皮肤, 3对应耳朵内侧

config.optionsMap = new Map([
    ["粉色妖精小兔♪", [
        {"material" : 0, "color" : 0xFF6969},
        {"material" : 2, "color" : 0xFDF4F5}
    ]],
    ["黑旋风", [
        {"material" : 0, "color" : 0xEEEEEE},
        {"material" : 2, "color" : 0x9D9D9D},
        {"material" : 3, "color" : 0xC8C2BC}
    ]]
])

const text1 = "这是冒泡排序的示例，你可以在这里观察冒泡排序。点击右侧三个黄色按钮可进行交互:点按按钮next以执行下一步，点按按钮restart可重置当前序列到初试状态，点按按钮shuffle可随机生成一个新的序列。点击屏幕以关闭提示";
const text2 = "这是二叉树遍历的示例，你可以在这里观察二叉树的前、中、后序遍历过程。点击前方五个黄色按钮可进行交互:点按midOrder/preOrder/postOrder按钮可切换到对应序遍历模式的初始状态，点按next按钮可以按照当前序进行下一步遍历，点按按钮shuffle可随机生成一颗新的二叉树。点击屏幕以关闭提示。";
const text3 = "这是选择排序的示例，你可以在这里观察选择排序。点击右侧三个黄色按钮可进行交互:点按按钮next以执行下一步，点按按钮restart可重置当前序列到初试状态，点按按钮shuffle可随机生成一个新的序列。点击屏幕以关闭提示。";
config.readMe = [text1, text2, text3];
