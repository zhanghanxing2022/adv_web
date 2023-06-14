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

export let introductionMap = new Map([
    ["rabbit", "兔兔の原皮"],
    ["粉色妖精小兔♪", "可爱的美少女无所不能"],
    ["黑旋风", "......帅！"],
    ["jimmy", "其实他的名字是timmy，工作人员不小心打错了他的名字!"],
    ["amy", "金克斯(精神正常版)"],
    ["mouse", "Yes Sir♂"],
    ["强健体魄", "其实它只有一个皮肤，只是强行多加了一个皮肤"]
])