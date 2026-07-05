/**
 * 「夏夜轨迹」 - Galgame 剧本
 *
 * 女主角「小夜」性格蒸馏自真人聊天记录：
 *   毒舌直率 · 二次元深度用户 · BL本子爱好者 · 游戏宅
 *   口癖: "6"、"sb"、"操啊"、短句轰炸、表情包达人
 *   内在: 外表大大咧咧，偶尔流露脆弱一面
 */

const storyData = {
  title: "夏夜轨迹",
  start: "prologue",

  variables: {
    affection: 0,
  },

  nodes: {

    // ═══════════════════════════════════════════
    // 序章：搬来的邻居
    // ═══════════════════════════════════════════

    prologue: {
      speaker: "",
      text: "暑假的第一天，你被一阵暴躁的敲门声吵醒。\n\n打开门，一个拎着游戏机、头发乱糟糟的女孩站在走廊里。\n「你们家WiFi信号太强了，连到我房间了。密码多少？」",
      background: "bg_apartment_hall.jpg",
      next: "scene_first_meet",
    },

    scene_first_meet: {
      speaker: "？？？",
      text: "发什么呆。密码。",
      background: "bg_apartment_hall.jpg",
      sprite: { image: "ya_casual.png", position: "right" },
      choices: [
        {
          text: "「……你是新搬来的？」",
          next: "scene_intro",
          affection: 0,
        },
        {
          text: "「密码是iloveBL888。别问我为什么是这个。」",
          next: "scene_intro_pw",
          affection: 3,
        },
        {
          text: "「敲门的方式能不能温柔一点？」",
          next: "scene_intro_knock",
          affection: -1,
        },
      ],
    },

    scene_intro: {
      speaker: "小夜",
      text: "对门。昨天搬的。你WiFi密码。",
      background: "bg_apartment_hall.jpg",
      sprite: { image: "ya_casual.png", position: "right" },
      next: "scene_intro_common",
    },

    scene_intro_pw: {
      speaker: "小夜",
      text: "……6。你这什么品味。不过我喜欢。",
      background: "bg_apartment_hall.jpg",
      sprite: { image: "ya_smirk.png", position: "right" },
      next: "scene_intro_common",
    },

    scene_intro_knock: {
      speaker: "小夜",
      text: "我已经很温柔了。平时我踹门。",
      background: "bg_apartment_hall.jpg",
      sprite: { image: "ya_eyeroll.png", position: "right" },
      next: "scene_intro_common",
    },

    scene_intro_common: {
      speaker: "小夜",
      text: "反正，谢了。我叫小夜。以后WiFi断了我会来敲门的。",
      background: "bg_apartment_hall.jpg",
      sprite: { image: "ya_casual.png", position: "right" },
      next: "scene_next_day",
    },

    // ═══════════════════════════════════════════
    // 第二天
    // ═══════════════════════════════════════════

    scene_next_day: {
      speaker: "",
      text: "第二天傍晚，你又听到了敲门声——这次温柔了一点。\n\n开门，小夜靠着门框，手里晃着一个手柄。",
      background: "bg_apartment_hall.jpg",
      sprite: { image: "ya_casual.png", position: "right" },
      next: "scene_invite",
    },

    scene_invite: {
      speaker: "小夜",
      text: "打游戏吗。我刚发现一个双人合作本，缺个炮灰。",
      background: "bg_apartment_hall.jpg",
      sprite: { image: "ya_interested.png", position: "right" },
      choices: [
        {
          text: "「炮灰？？你就这么邀请人的？」",
          next: "scene_accept_game",
          affection: 1,
        },
        {
          text: "「什么游戏？先说好我不玩恐怖游戏。」",
          next: "scene_accept_game",
          affection: 2,
        },
        {
          text: "「行啊，输了请奶茶。」",
          next: "scene_accept_game",
          affection: 3,
        },
      ],
    },

    scene_accept_game: {
      speaker: "小夜",
      text: "那就这么定了。我家客厅，十分钟后。不准鸽。",
      background: "bg_apartment_hall.jpg",
      sprite: { image: "ya_smirk.png", position: "right" },
      next: "scene_gaming",
    },

    // ═══════════════════════════════════════════
    // 游戏之夜
    // ═══════════════════════════════════════════

    scene_gaming: {
      speaker: "",
      text: "小夜的房间出乎意料地整洁——除了床头那堆漫画和靠墙的等身抱枕。\n\n屏幕上加载着游戏，她已经盘腿坐在地毯上，手指飞快地调着设置。",
      background: "bg_room_gaming.jpg",
      sprite: { image: "ya_focused.png", position: "center" },
      next: "scene_gaming_2",
    },

    scene_gaming_2: {
      speaker: "小夜",
      text: "手柄给你。灵敏度我帮你调好了。Boss战不准拖后腿。",
      background: "bg_room_gaming.jpg",
      sprite: { image: "ya_focused.png", position: "right" },
      next: "scene_gaming_3",
    },

    scene_gaming_3: {
      speaker: "",
      text: "一小时后——你第N次被Boss拍死。\n小夜放下手柄，转过头看着你，表情一言难尽。",
      background: "bg_room_gaming.jpg",
      sprite: { image: "ya_eyeroll.png", position: "right" },
      next: "scene_gaming_4",
    },

    scene_gaming_4: {
      speaker: "小夜",
      text: "……你是不是从来没玩过动作游戏。你闪避按的是反方向你知道吗。",
      background: "bg_room_gaming.jpg",
      sprite: { image: "ya_eyeroll.png", position: "right" },
      choices: [
        {
          text: "「那你教我不就行了。」",
          next: "scene_gaming_teach",
          affection: 2,
        },
        {
          text: "「我平时只玩手游好不好。」",
          next: "scene_gaming_teach",
          affection: 0,
        },
        {
          text: "「再来一把。这把必过。」",
          next: "scene_gaming_teach",
          affection: 3,
        },
      ],
    },

    scene_gaming_teach: {
      speaker: "小夜",
      text: "行吧。看好了，我只示范一次。\n\n她接过去，手指翻飞，Boss的血条肉眼可见地往下掉。你凑近看着屏幕，不小心肩膀碰到了她的。她没有躲开。",
      background: "bg_room_gaming.jpg",
      sprite: { image: "ya_focused.png", position: "center" },
      next: "scene_gaming_win",
    },

    scene_gaming_win: {
      speaker: "小夜",
      text: "看到没？这才叫操作。",
      background: "bg_room_gaming.jpg",
      sprite: { image: "ya_smug.png", position: "right" },
      choices: [
        {
          text: "「有点帅。」",
          next: "scene_gaming_flirt",
          affection: 5,
        },
        {
          text: "「还行吧。Boss正好残血而已。」",
          next: "scene_gaming_flirt",
          affection: 0,
        },
      ],
    },

    scene_gaming_flirt: {
      speaker: "小夜",
      text: "……「有点」是多余的。",
      background: "bg_room_gaming.jpg",
      sprite: { image: "ya_shy.png", position: "right" },
      next: "scene_balcony",
    },

    // ═══════════════════════════════════════════
    // 阳台 & 深夜对话
    // ═══════════════════════════════════════════

    scene_balcony: {
      speaker: "",
      text: "打完游戏，你们靠在阳台栏杆上。夏夜的风吹过来，带着远处烧烤摊的味道。\n\n小夜忽然安静下来，不像平时那样叽叽喳喳。",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_quiet.png", position: "right" },
      next: "scene_balcony_2",
    },

    scene_balcony_2: {
      speaker: "小夜",
      text: "我追的漫画又断更了。作者说要去考研。考研？？？",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_angry.png", position: "right" },
      choices: [
        {
          text: "「什么漫画？」",
          next: "scene_bl_reveal",
          affection: 2,
        },
        {
          text: "「人家考研是正经事好吧。」",
          next: "scene_bl_reveal",
          affection: 0,
        },
        {
          text: "「你追漫画居然追连载？太有毅力了。」",
          next: "scene_bl_reveal",
          affection: 1,
        },
      ],
    },

    scene_bl_reveal: {
      speaker: "小夜",
      text: "你不懂。好的BL本就像命。作者断更等于谋杀。",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_serious.png", position: "right" },
      choices: [
        {
          text: "「BL……本？」",
          next: "scene_bl_defend",
          affection: 2,
        },
        {
          text: "「懂了。那确实不能接受断更。」",
          next: "scene_bl_defend",
          affection: 3,
        },
      ],
    },

    scene_bl_defend: {
      speaker: "小夜",
      text: "怎么了。腐女吃你家大米了？你看我像会道歉的样子吗。",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_eyeroll.png", position: "right" },
      next: "scene_deep",
    },

    // ═══════════════════════════════════════════
    // 真心话
    // ═══════════════════════════════════════════

    scene_deep: {
      speaker: "",
      text: "安静了一会儿。远处有人在放烟花，细碎的光映在她的侧脸上。\n\n你突然觉得，这个满嘴「sb」「6」的人，认真看的时候有种说不出的好看。",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_quiet.png", position: "right" },
      next: "scene_deep_2",
    },

    scene_deep_2: {
      speaker: "小夜",
      text: "……其实我有时候挺羡慕你的。\n\n什么都无所谓的样子。我就做不到。",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_quiet.png", position: "center" },
      choices: [
        {
          text: "「你也挺厉害的。游戏打得这么好。」",
          next: "scene_deep_3",
          affection: 3,
        },
        {
          text: "「我只是装的。」",
          next: "scene_deep_3",
          affection: 2,
        },
        {
          text: "「你什么都不用改。现在就很好。」",
          next: "scene_deep_3",
          affection: 5,
        },
      ],
    },

    scene_deep_3: {
      speaker: "小夜",
      text: "……6。你什么时候学会说人话了。",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_smile.png", position: "right" },
      next: "scene_climax",
    },

    // ═══════════════════════════════════════════
    // 关键时刻
    // ═══════════════════════════════════════════

    scene_climax: {
      speaker: "",
      text: "烟花停了。夜空中只剩几颗星星。\n\n她转过头看你，嘴角还挂着刚才那一点点笑意。你忽然意识到，不知道从什么时候开始，来她家打游戏已经成了你每天最期待的事。",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_smile.png", position: "center" },
      choices: [
        {
          text: "「明天……还一起打游戏吗？」",
          next: "scene_safe_end",
          affection: 2,
        },
        {
          text: "「小夜。我喜欢你。」",
          next: "scene_confession",
          affection: 10,
        },
      ],
    },

    // ═══════════════════════════════════════════
    // 告白
    // ═══════════════════════════════════════════

    scene_confession: {
      speaker: "小夜",
      text: "…………",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_shocked.png", position: "center" },
      next: "scene_confession_2",
    },

    scene_confession_2: {
      speaker: "小夜",
      text: "……6。\n\n你认真的？",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_shy.png", position: "center" },
      choices: [
        {
          text: "「你觉得我像开玩笑？」",
          next: "scene_confession_yes",
          affection: 5,
        },
        {
          text: "「……算了当我没说。」",
          next: "scene_confession_no",
          affection: -5,
        },
      ],
    },

    scene_confession_yes: {
      speaker: "小夜",
      text: "……你知道我等这句话等了多久吗。\n\n从搬来第一天你用那个弱智密码开始。我还以为你永远看不出来。",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_teary.png", position: "center" },
      next: "true_ending",
    },

    scene_confession_no: {
      speaker: "小夜",
      text: "…………\n\n……嗯。不早了，回去吧。",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_quiet.png", position: "right" },
      next: "scene_safe_end",
    },

    // ═══════════════════════════════════════════
    // 安全结局
    // ═══════════════════════════════════════════

    scene_safe_end: {
      speaker: "小夜",
      text: "行。明天七点，不准迟到。迟到的话我踹你门。",
      background: "bg_balcony_night.jpg",
      sprite: { image: "ya_smirk.png", position: "right" },
      next: "normal_ending",
    },

    // ═══════════════════════════════════════════
    // 结局
    // ═══════════════════════════════════════════

    normal_ending: {
      speaker: "",
      text: "她朝你摆了摆手，转身回了房间。\n\n但关门之前，你好像看到她笑了——不是平时那种嘲讽的笑，是有点不一样的。\n\n夏天还很长。明天还会来的。\n\n—— 普通结局：明日また ——",
      background: "bg_apartment_night.jpg",
    },

    true_ending: {
      speaker: "",
      text: "她的手指扣上了你的。力气大得像在打Boss。\n\n「以后打游戏不准选别人当队友。」她说。\n\n「只有你。」\n\n夜空中好像有流星划过。也可能是你看错了。\n\n但你知道这个夏天，跟以前所有的夏天都不一样了。\n\n—— 真结局：夏夜轨迹 ——",
      background: "bg_starry_night.jpg",
      sprites: [
        { image: "ya_smile.png", position: "left" },
      ],
    },
  },
};

export default storyData;
