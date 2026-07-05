/**
 * 「她的秘密账号」 - 架空校园 Galgame
 *
 * 之之：青城中学优等生，生物课代表，戴圆框眼镜。
 * 表面——实验室里冷静精准，pre 台上侃侃而谈。
 * 秘密——她是圈内小有名气的 BL 同人画手，账号「午夜试管」粉丝三万。
 *
 * 你知道这个秘密，但她不知道你知道。
 */

const storyData = {
  title: "午夜试管",
  start: "prologue",

  variables: {
    affection: 0,     // 好感度
    suspicion: 0,     // 她察觉你在试探的程度
    exposed: false,   // 秘密是否已被揭穿
  },

  nodes: {

    // ═══════════════════════════════════════════
    // 序章：意外发现
    // ═══════════════════════════════════════════

    prologue: {
      speaker: "",
      text: "那是开学第二周的深夜。\n\n你刷着手机，无意中点进了一个推送——\n「热门BL同人 · 午夜试管 · 更新了」\n\n画风很眼熟。构图习惯也很眼熟。\n\n你放大右下角的草稿水印，愣住了——那是生物实验室的桌面纹路。",
      background: "backgrounds/bg_classroom_board.jpg",
      next: "realization",
    },

    realization: {
      speaker: "",
      text: "你翻遍了「午夜试管」的投稿——\n\n每一张草稿的背景，都是你认识的地方。\n生物实验室。教室窗边。食堂角落。\n\n画里的人物永远在接吻。\n\n画外的人，是每天坐在你旁边的优等生——之之。",
      background: "backgrounds/bg_classroom_board.jpg",
      next: "next_day",
    },

    // ═══════════════════════════════════════════
    // 第二天：假装什么都不知道
    // ═══════════════════════════════════════════

    next_day: {
      speaker: "",
      text: "第二天，生物课。\n\n之之像往常一样在讲台上做 pre，讲细胞全能性，语气平稳，逻辑滴水不漏。\n\n你盯着她的侧脸，脑子里全是昨晚看到的那些画。",
      background: "backgrounds/bg_classroom_board.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      next: "after_class",
    },

    after_class: {
      speaker: "之之",
      text: "你刚才一直盯着我。\n\n我讲错了？",
      background: "backgrounds/bg_classroom_board.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      choices: [
        {
          text: "「没有。讲得很好。」（装作若无其事）",
          next: "neutral_start",
          affection: 0,
          suspicion: 0,
        },
        {
          text: "「你最近……是不是经常熬夜？」（试探）",
          next: "probe_start",
          affection: -1,
          suspicion: 2,
        },
        {
          text: "「没什么。只是觉得你画画应该很好看。」（危险试探）",
          next: "dangerous_start",
          affection: 2,
          suspicion: 4,
        },
      ],
    },

    neutral_start: {
      speaker: "之之",
      text: "……那就好。\n\n（她转过去收拾U盘，但你注意到她的手指顿了一下）",
      background: "backgrounds/bg_classroom_board.jpg",
      sprite: { image: "sprites/sprite_shy.png", position: "right" },
      next: "lab_invite",
    },

    probe_start: {
      speaker: "之之",
      text: "……你什么意思？\n\n（她的眼神突然警觉起来，隔了一会才说）……最近在追一个连载。",
      background: "backgrounds/bg_classroom_board.jpg",
      sprite: { image: "sprites/sprite_surprised.png", position: "right" },
      next: "lab_invite",
    },

    dangerous_start: {
      speaker: "之之",
      text: "………………\n\n（她沉默了整整三秒。然后推了推眼镜，用一种你从未见过的表情看着你）\n\n我不会画画。你认错人了。",
      background: "backgrounds/bg_classroom_board.jpg",
      sprite: { image: "sprites/sprite_surprised.png", position: "center" },
      next: "lab_invite",
    },

    // ═══════════════════════════════════════════
    // 实验室：第一层试探
    // ═══════════════════════════════════════════

    lab_invite: {
      speaker: "",
      text: "下午实验课。之之像往常一样分到了你旁边。\n\n她调显微镜的动作一如既往地稳。但你注意到——她的草稿本压在课本下面，封面朝下。",
      background: "backgrounds/bg_classroom_board.jpg",
      sprite: { image: "sprites/sprite_focus.png", position: "right" },
      next: "lab_choice",
    },

    lab_choice: {
      speaker: "之之",
      text: "今天观察的是洋葱表皮细胞。\n\n……你在看什么？",
      background: "backgrounds/bg_classroom_board.jpg",
      sprite: { image: "sprites/sprite_focus.png", position: "right" },
      choices: [
        {
          text: "「看你怎么调显微镜。你手法很厉害。」",
          next: "lab_safe",
          affection: 2,
          suspicion: 0,
        },
        {
          text: "「你的草稿本……封面挺好看的。」",
          next: "lab_risky",
          affection: 1,
          suspicion: 3,
        },
        {
          text: "「之之，你有没有在网上发过什么东西？」",
          next: "lab_direct",
          affection: -2,
          suspicion: 6,
        },
      ],
    },

    lab_safe: {
      speaker: "之之",
      text: "……（她似乎松了一口气）\n\n多练就好。你要试试吗？我帮你看着。",
      background: "backgrounds/bg_classroom_board.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      next: "cafeteria_scene",
    },

    lab_risky: {
      speaker: "之之",
      text: "……（她把草稿本往书包里塞了塞）\n\n没什么特别的。就是随便画画。",
      background: "backgrounds/bg_classroom_board.jpg",
      sprite: { image: "sprites/sprite_shy.png", position: "right" },
      next: "cafeteria_scene",
    },

    lab_direct: {
      speaker: "之之",
      text: "……我不知道你在说什么。\n\n（她的手停在显微镜微调上，好一会儿没动。然后她摘下眼镜擦了擦）\n\n……我去趟洗手间。",
      background: "backgrounds/bg_classroom_board.jpg",
      sprite: { image: "sprites/sprite_shy.png", position: "center" },
      next: "cafeteria_scene",
    },

    // ═══════════════════════════════════════════
    // 食堂：逼近真相
    // ═══════════════════════════════════════════

    cafeteria_scene: {
      speaker: "",
      text: "中午食堂。之之一个人坐在窗边，面前的红烧肉几乎没动。\n\n她戴着耳机，手指在手机屏幕上飞快地划着。\n\n你端着餐盘走过去。她抬头的时候，手机屏幕闪了一下——你瞥到了熟悉的画风。",
      background: "backgrounds/bg_restaurant_green.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      next: "cafeteria_choice",
    },

    cafeteria_choice: {
      speaker: "之之",
      text: "……你坐吧。\n\n（她很快地把手机翻了过去，屏幕朝下）",
      background: "backgrounds/bg_restaurant_green.jpg",
      sprite: { image: "sprites/sprite_shy.png", position: "right" },
      choices: [
        {
          text: "坐过去，聊实验课的事。不提别的。",
          next: "cafeteria_safe",
          affection: 2,
        },
        {
          text: "「你在看什么？我也看看。」",
          next: "cafeteria_push",
          affection: -1,
          suspicion: 4,
        },
        {
          text: "「之之。我知道「午夜试管」是你。」（摊牌）",
          next: "confrontation",
          affection: -5,
          suspicion: 10,
          exposed: true,
        },
      ],
    },

    cafeteria_safe: {
      speaker: "",
      text: "她没有再提起刚才的事。但你注意到——吃完饭离开时，她的草稿本从书包里露出一角。\n\n上面画着两个男人。\n\n画得很好。",
      background: "backgrounds/bg_restaurant_green.jpg",
      next: "train_trip",
    },

    cafeteria_push: {
      speaker: "之之",
      text: "没什么。就是个……漫画。\n\n你不感兴趣的。",
      background: "backgrounds/bg_restaurant_green.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      next: "train_trip",
    },

    // ═══════════════════════════════════════════
    // 摊牌
    // ═══════════════════════════════════════════

    confrontation: {
      speaker: "之之",
      text: "…………\n\n（她的筷子停在半空中。然后慢慢放下。）\n\n……你什么时候知道的。",
      background: "backgrounds/bg_restaurant_green.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "center" },
      next: "confrontation_2",
    },

    confrontation_2: {
      speaker: "之之",
      text: "算了。无所谓。\n\n（她摘下眼镜，第一次直视你。你从没见她摘过眼镜。）\n\n你觉得恶心吗？觉得变态吗？想说就说。",
      background: "backgrounds/bg_restaurant_green.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "center" },
      choices: [
        {
          text: "「画得很好。我说真的。」",
          next: "confrontation_good",
          affection: 8,
        },
        {
          text: "「我只是好奇。没有别的意思。」",
          next: "confrontation_neutral",
          affection: 3,
        },
        {
          text: "「为什么不告诉我？」",
          next: "confrontation_why",
          affection: -1,
        },
      ],
    },

    confrontation_good: {
      speaker: "之之",
      text: "…………\n\n（她愣了一下。然后极快地低下头，把眼镜戴回去。）\n\n……你知道我画的是什么吗就说好。",
      background: "backgrounds/bg_restaurant_green.jpg",
      sprite: { image: "sprites/sprite_shy.png", position: "center" },
      next: "train_trip",
    },

    confrontation_neutral: {
      speaker: "之之",
      text: "……嗯。\n\n（她没有再说什么，但你看到她的肩膀微微松了下来。）",
      background: "backgrounds/bg_restaurant_green.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      next: "train_trip",
    },

    confrontation_why: {
      speaker: "之之",
      text: "告诉你？\n\n你怎么不去问我为什么要在草稿本上画两个男人接吻？\n\n……算了我自己也不知道。",
      background: "backgrounds/bg_restaurant_green.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "center" },
      next: "train_trip",
    },

    // ═══════════════════════════════════════════
    // 研学旅行：转折点
    // ═══════════════════════════════════════════

    train_trip: {
      speaker: "",
      text: "几天后，学校研学旅行。\n\n之之在火车上坐在你斜对面，靠着颈枕睡着了。\n\n她的草稿本从书包里滑出来，摊开在那一页——两个男人在九龙壁前接吻。\n\n你帮她合上，放在她手边。",
      background: "backgrounds/bg_station.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      next: "yunzhou_scene",
    },

    yunzhou_scene: {
      speaker: "",
      text: "云州。苍龙壁前。\n\n之之站在琉璃龙壁下，难得地露出了真实的笑容。\n\n她没戴口罩。没戴帽子。只是在阳光下眯着眼睛看那些金色的龙纹。",
      background: "backgrounds/bg_jiulongbi.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "center" },
      next: "yunzhou_talk",
    },

    yunzhou_talk: {
      speaker: "之之",
      text: "你知道为什么我画的东西里，背景总出现这些吗？\n\n（她指着龙壁上的琉璃龙纹）\n\n因为美的东西就该和美的在一起。不管别人怎么说。",
      background: "backgrounds/bg_jiulongbi.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      choices: [
        {
          text: "「你说的对。」",
          next: "yunzhou_moment",
          affection: 3,
        },
        {
          text: "「那你觉得你画的东西美吗？」",
          next: "yunzhou_deep",
          affection: 4,
        },
      ],
    },

    yunzhou_moment: {
      speaker: "",
      text: "她看了你一眼。\n\n那一眼里没有警惕，没有防备。\n\n只有一点你以前从没看到过的东西。",
      background: "backgrounds/bg_jiulongbi.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "center" },
      next: "return_scene",
    },

    yunzhou_deep: {
      speaker: "之之",
      text: "……我自己也不知道。\n\n但至少画的时候，我是开心的。\n\n（她转过去看龙壁，但你听到她笑了——很轻，很短，却真实。）",
      background: "backgrounds/bg_jiulongbi.jpg",
      sprite: { image: "sprites/sprite_smile.png", position: "right" },
      next: "return_scene",
    },

    return_scene: {
      speaker: "",
      text: "回程的火车上，天色渐暗。\n\n之之靠着窗睡着了。她的草稿本没有再掉出来。\n\n但你看到本子的边角上，多了一行很小的字——\n\n「今天有人看懂了我的画。」",
      background: "backgrounds/bg_station.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "center" },
      next: "night_date",
    },

    // ═══════════════════════════════════════════
    // 摩天轮之夜
    // ═══════════════════════════════════════════

    night_date: {
      speaker: "",
      text: "回到锦城后，之之约你出来。\n\n春熙坊的店铺一家家亮起来。她戴着狗耳朵帽子，在人群里显得格外安静。",
      background: "backgrounds/bg_xintiandi.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      next: "ferriswheel_scene",
    },

    ferriswheel_scene: {
      speaker: "",
      text: "傍晚的摩天轮亮起来，像一枚悬在城市上空的戒指。\n\n之之站在你旁边，忽然开口——",
      background: "backgrounds/bg_ferriswheel.jpg",
      next: "ferriswheel_talk",
    },

    ferriswheel_talk: {
      speaker: "之之",
      text: "我有个问题想问你。\n\n……你知道我最大的秘密了。\n\n那你的秘密是什么？",
      background: "backgrounds/bg_ferriswheel.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      choices: [
        {
          text: "「我的秘密是——我关注「午夜试管」两个月了。每期都看。」",
          next: "reveal_fan",
          affection: 8,
        },
        {
          text: "「我的秘密是——我害怕你知道我知道。」",
          next: "reveal_scared",
          affection: 5,
        },
        {
          text: "「我没有秘密。我只是想了解你。」",
          next: "reveal_simple",
          affection: 4,
        },
      ],
    },

    reveal_fan: {
      speaker: "之之",
      text: "………………什么？\n\n（她瞪大眼睛，然后忽然捧腹大笑——你从没见她这么笑过）\n\n你他妈是认真的？？那你怎么不早说！！\n\n你知道我那两个月画了多少张吗！因为总觉得有人在看！",
      background: "backgrounds/bg_ferriswheel.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "center" },
      next: "reveal_aftermath",
    },

    reveal_scared: {
      speaker: "之之",
      text: "……笨蛋。\n\n（她垂下眼睛，过了一会儿，很小声地说）\n\n我也怕。怕你觉得我奇怪。怕你以后不理我。",
      background: "backgrounds/bg_ferriswheel.jpg",
      sprite: { image: "sprites/sprite_shy.png", position: "center" },
      next: "reveal_aftermath",
    },

    reveal_simple: {
      speaker: "之之",
      text: "……（她沉默了一会儿）\n\n那你现在了解了。然后呢？",
      background: "backgrounds/bg_ferriswheel.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      next: "reveal_aftermath",
    },

    reveal_aftermath: {
      speaker: "",
      text: "摩天轮缓缓转到了最高点。\n\n整座城市的灯光在脚下铺开。\n\n之之往你这边挪了半步。",
      background: "backgrounds/bg_ferriswheel.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "right" },
      next: "final_choice",
    },

    // ═══════════════════════════════════════════
    // 最终选择
    // ═══════════════════════════════════════════

    final_choice: {
      speaker: "之之",
      text: "喂。\n\n如果我说——\n\n我下一期的漫画，想画一个我和你的故事。\n\n……你会怎么想？",
      background: "backgrounds/bg_ferriswheel.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "center" },
      choices: [
        {
          text: "「那我帮你画背景。我生物实验报告画得还不错。」",
          next: "true_ending",
          affection: 10,
        },
        {
          text: "「……你想画什么剧情？」",
          next: "normal_ending",
          affection: 3,
        },
        {
          text: "沉默。只是握住了她的手。",
          next: "silent_ending",
          affection: 8,
        },
      ],
    },

    // ═══════════════════════════════════════════
    // 结局
    // ═══════════════════════════════════════════

    true_ending: {
      speaker: "之之",
      text: "……噗。生物实验报告画背景。\n\n亏你想得出来。\n\n（她摘下眼镜擦了擦眼角，但这次是因为笑。）\n\n行。那从明天开始——\n\n你就是「午夜试管」的官方背景师了。\n\n工资嘛……每天帮你调显微镜，够不够？",
      background: "backgrounds/bg_ferriswheel.jpg",
      sprite: { image: "sprites/sprite_shy.png", position: "center" },
      next: "true_ending_text",
    },

    true_ending_text: {
      speaker: "",
      text: "那天晚上，「午夜试管」更新了一条动态。\n\n——\n「找到了一个人。\n他看我的画的时候，眼睛里没有奇怪。\n只有喜欢。」\n\n配图是摩天轮最高处的夜景。\n右下角有一只握笔的手，和另一只握在上面的手。\n\n—— 真结局：她的秘密账号 ——",
      background: "backgrounds/bg_ferriswheel.jpg",
    },

    normal_ending: {
      speaker: "之之",
      text: "……剧情啊。\n\n那当然是从一个傻逼在生物课上盯着我看开始。\n\n（她笑了笑，但眼睛没有真结局那么亮）\n\n……下次告诉你。等我画完。",
      background: "backgrounds/bg_ferriswheel.jpg",
      sprite: { image: "sprites/sprite_smile.png", position: "right" },
      next: "normal_ending_text",
    },

    normal_ending_text: {
      speaker: "",
      text: "她到底没有告诉你画了什么。\n\n但「午夜试管」的下一期更新里，\n多了一个戴眼镜的女主角，和一个在实验室里偷偷看她的男生。\n\n—— 普通结局：未完的漫画 ——",
      background: "backgrounds/bg_ferriswheel.jpg",
    },

    silent_ending: {
      speaker: "之之",
      text: "…………\n\n（她没有说话。也没有抽回手。）\n\n（摩天轮开始缓缓下降。你们的影子映在车窗上，叠在一起。）\n\n6。\n\n……这是她说过的最温柔的一个「6」。",
      background: "backgrounds/bg_ferriswheel.jpg",
      sprite: { image: "sprites/sprite_serious.png", position: "center" },
      next: "silent_ending_text",
    },

    silent_ending_text: {
      speaker: "",
      text: "后来「午夜试管」断更了两个月。\n\n粉丝在评论区哀嚎遍野。\n\n只有你知道——\n\n她不是不想画。\n她只是在过自己的故事。\n\n—— 隐藏结局：断更的理由 ——",
      background: "backgrounds/bg_ferriswheel.jpg",
    },
  },
};

export default storyData;
