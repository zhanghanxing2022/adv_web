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

const text1 = "这是冒泡排序"
const text2 = ""
const text3 = ""
const text4 = ""
config.readMe = [text1, text2, text3, text4];
