/**
 * Sample Story Data for Visual Novel Engine
 *
 * A short demo story showcasing:
 * - Linear dialogue with backgrounds and sprites
 * - Player choices that branch the narrative
 * - Affection variable tracking
 * - Multiple endings based on choices
 */

const storyData = {
  title: '星光下的约定',
  author: 'VN Engine Demo',

  start: 'scene_01',

  variables: {
    affection: 0,   // 好感度 — tracks the heroine's feelings toward the protagonist
  },

  nodes: {

    // ──────────────────────────────────────────────────────
    // Scene 1 — Opening
    // ──────────────────────────────────────────────────────
    scene_01: {
      speaker: '',
      text: '夏夜的校园，星光洒落在安静的操场上。微风吹过，带来青草的香气。',
      background: 'bg_school_night.jpg',
      next: 'scene_02',
    },

    scene_02: {
      speaker: '',
      text: '你独自坐在长椅上，回想着今天发生的一切。突然，一个熟悉的声音打破了宁静。',
      background: 'bg_school_night.jpg',
      next: 'scene_03',
    },

    scene_03: {
      speaker: '小夜',
      text: '这么晚了，你怎么还在这里？',
      background: 'bg_school_night.jpg',
      sprite: {
        image: 'sayo_smile.png',
        position: 'right',
      },
      choices: [
        {
          text: '「睡不着，出来走走。你呢？」',
          next: 'scene_04_warm',
          affection: 3,
        },
        {
          text: '「不关你的事吧。」',
          next: 'scene_04_cold',
          affection: -5,
        },
        {
          text: '「……（沉默）」',
          next: 'scene_04_silent',
          affection: 1,
        },
      ],
    },

    // ──────────────────────────────────────────────────────
    // Branch A — Warm response
    // ──────────────────────────────────────────────────────
    scene_04_warm: {
      speaker: '小夜',
      text: '我也是。每次心情不好的时候，我就会来这里看星星。',
      background: 'bg_school_night.jpg',
      sprite: {
        image: 'sayo_smile.png',
        position: 'right',
      },
      next: 'scene_05_stars',
    },

    // ──────────────────────────────────────────────────────
    // Branch B — Cold response
    // ──────────────────────────────────────────────────────
    scene_04_cold: {
      speaker: '小夜',
      text: '……对不起，打扰你了。',
      background: 'bg_school_night.jpg',
      sprite: {
        image: 'sayo_sad.png',
        position: 'right',
      },
      next: 'scene_05_stars',
    },

    // ──────────────────────────────────────────────────────
    // Branch C — Silent response
    // ──────────────────────────────────────────────────────
    scene_04_silent: {
      speaker: '小夜',
      text: '……我也是来看星星的。如果不介意的话，一起坐一会儿？',
      background: 'bg_school_night.jpg',
      sprite: {
        image: 'sayo_shy.png',
        position: 'right',
      },
      next: 'scene_05_stars',
    },

    // ──────────────────────────────────────────────────────
    // Scene 5 — Stargazing (convergence point)
    // ──────────────────────────────────────────────────────
    scene_05_stars: {
      speaker: '',
      text: '你们并肩坐着，头顶的星空璀璨无比。一颗流星划过天际。',
      background: 'bg_school_night.jpg',
      sprites: [
        { image: 'sayo_smile.png', position: 'right' },
      ],
      next: 'scene_06_meteor',
    },

    scene_06_meteor: {
      speaker: '小夜',
      text: '啊！流星！你看到了吗？',
      background: 'bg_school_night.jpg',
      sprite: {
        image: 'sayo_excited.png',
        position: 'right',
      },
      choices: [
        {
          text: '「看到了。听说流星消失之前许愿三次，愿望就会实现。」',
          next: 'scene_07_wish',
          affection: 2,
        },
        {
          text: '「嗯。」',
          next: 'scene_07_wish',
          affection: 0,
        },
        {
          text: '「流星什么的，不过是陨石在大气层燃烧而已。」',
          next: 'scene_07_wish',
          affection: -2,
        },
      ],
    },

    scene_07_wish: {
      speaker: '小夜',
      text: '……我已经许好愿了。',
      background: 'bg_school_night.jpg',
      sprite: {
        image: 'sayo_shy.png',
        position: 'right',
      },
      next: 'scene_08_confession',
    },

    // ──────────────────────────────────────────────────────
    // Scene 8 — The confession
    // ──────────────────────────────────────────────────────
    scene_08_confession: {
      speaker: '小夜',
      text: '我想告诉你一件事……其实，我已经注意你很久了。从开学第一天起。',
      background: 'bg_school_night.jpg',
      sprite: {
        image: 'sayo_shy.png',
        position: 'right',
      },
      choices: [
        {
          text: '「其实……我也是。」',
          next: 'scene_09_mutual',
          affection: 10,
        },
        {
          text: '「抱歉，我现在还没有想这些。」',
          next: 'scene_09_reject',
          affection: -10,
        },
        {
          text: '「……你是说真的吗？」',
          next: 'scene_09_surprised',
          affection: 3,
        },
      ],
    },

    // ──────────────────────────────────────────────────────
    // Endings
    // ──────────────────────────────────────────────────────

    scene_09_mutual: {
      speaker: '小夜',
      text: '真的吗？太好了！我还以为只有我一个人……',
      background: 'bg_school_night.jpg',
      sprite: {
        image: 'sayo_excited.png',
        position: 'center',
      },
      next: 'ending_true',
    },

    scene_09_reject: {
      speaker: '小夜',
      text: '……这样啊。没关系，我理解的。谢谢你今晚愿意陪我。',
      background: 'bg_school_night.jpg',
      sprite: {
        image: 'sayo_sad.png',
        position: 'right',
      },
      next: 'ending_sad',
    },

    scene_09_surprised: {
      speaker: '小夜',
      text: '当然是真的！从第一次见到你，我就觉得你和其他人不一样……',
      background: 'bg_school_night.jpg',
      sprite: {
        image: 'sayo_smile.png',
        position: 'center',
      },
      next: 'ending_true',
    },

    // ──────────────────────────────────────────────────────
    // True Ending
    // ──────────────────────────────────────────────────────
    ending_true: {
      speaker: '',
      text: '两颗心在星光下终于靠近。从那天起，你们的校园生活变得不再孤单。\n\n—— 真结局：星光下的约定 ——',
      background: 'bg_starry_sky.jpg',
      sprites: [
        { image: 'sayo_smile.png', position: 'left' },
      ],
    },

    // ──────────────────────────────────────────────────────
    // Sad Ending
    // ──────────────────────────────────────────────────────
    ending_sad: {
      speaker: '',
      text: '小夜转身离开了操场。她的背影渐渐消失在夜色中。\n\n你望着星空，心中有种说不出的惆怅。\n\n—— 普通结局：错过的流星 ——',
      background: 'bg_school_night.jpg',
    },
  },
};

export default storyData;
