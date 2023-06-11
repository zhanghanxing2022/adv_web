export const characters = ["rabbit", "amy", "jimmy", "mouse"];

export const skinMap = new Map([
    ["rabbit", ["rabbit","粉色妖精小兔♪", "黑旋风"]],
    ["mouse", ["mouse","强健体魄"]],
    ["jimmy", ["jimmy"]],
    ["amy", ["amy"]]
])

export const transformMap = new Map([
    ["rabbit", {"scale" : 5, "y" : 50}],
    ["mouse", {"scale" : 0.65, "y" : 50}],
    ["jimmy", {"scale" : 0.65, "y" : 50}],
    ["amy", {"scale" : 0.65, "y" : 50}],
])

// rabit 的material
// 0对应衣服, 2对应皮肤, 3对应耳朵内侧

export let optionsMap = new Map([
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