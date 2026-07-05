/**
 * 🎮 Visual Novel Engine (视觉小说引擎)
 *
 * A lightweight, extensible engine for creating visual novels in the browser.
 * Reads story data from a JSON object and handles rendering, transitions,
 * choice branching, variable tracking, save/load, and more.
 *
 * @module VisualNovelEngine
 * @license MIT
 *
 * ============================================================================
 * STORY JSON FORMAT (剧情数据格式)
 * ============================================================================
 *
 * {
 *   "title": "My Visual Novel",
 *   "author": "Author Name",
 *   "start": "node1",                     // Entry point node ID
 *   "variables": {                         // Initial variable values
 *     "affection": 0,
 *     "trust": 0
 *   },
 *   "nodes": {
 *     "node1": {
 *       "speaker": "Hero",                 // Who is speaking ("" for narration)
 *       "text": "Hello, adventurer!",      // Dialogue text
 *       "background": "bg_park.jpg",        // Background image filename (optional)
 *       "sprite": {                        // Character sprite (optional)
 *         "image": "hero_smile.png",
 *         "position": "left"               // "left" | "center" | "right"
 *       },
 *       "sprites": [                       // Multiple sprites (optional, overrides sprite)
 *         { "image": "hero_smile.png", "position": "left" },
 *         { "image": "heroine_shy.png", "position": "right" }
 *       ],
 *       "next": "node2",                   // Next node for linear progression
 *       "choices": [                       // Player choices (optional)
 *         {
 *           "text": "Greet warmly",        // Choice button text
 *           "next": "node_warm",           // Target node
 *           "affection": 5                 // Delta to add to affection
 *         },
 *         {
 *           "text": "Stay silent",
 *           "next": "node_cold",
 *           "affection": -3
 *         }
 *       ]
 *     }
 *   }
 * }
 *
 * ============================================================================
 * USAGE EXAMPLE (使用示例)
 * ============================================================================
 *
 * import { VisualNovelEngine } from './engine.js';
 * import storyData from './my-story.js';
 *
 * const vn = new VisualNovelEngine(storyData, {
 *   container: document.getElementById('vn-container'),
 *   textSpeed: 35,           // ms per character for typewriter effect
 *   onEnd: () => console.log('Story ended!'),
 *   onChoiceMade: (choice, nodeId) => console.log('Chose:', choice.text),
 * });
 *
 * vn.start();
 */

// ─── Constants ───────────────────────────────────────────────────────────

const DEFAULT_OPTIONS = {
  textSpeed: 30,           // ms per character (typewriter)
  autoAdvanceDelay: 2500,  // ms to wait before auto-advancing (auto mode)
  transitionDuration: 400, // ms for background/sprite crossfade
  container: null,         // must be provided or defaults to #vn-container
};

const SPRITE_POSITIONS = {
  left:   { left: '5%',  transform: 'translateX(0)' },
  center: { left: '50%', transform: 'translateX(-50%)' },
  right:  { left: 'auto', right: '5%', transform: 'translateX(0)' },
};

// ─── Helper Functions ────────────────────────────────────────────────────

/** Simple hash for save-data integrity checks */
function hashState(state) {
  let h = 0;
  const s = JSON.stringify({ nodeId: state.currentNodeId, vars: state.variables });
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h.toString(36);
}

/** Escape HTML to prevent XSS in user-provided text */
function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ─── Engine Class ────────────────────────────────────────────────────────

export class VisualNovelEngine {
  /**
   * Create a new visual novel engine instance.
   *
   * @param {Object} storyData - The story data object (see format above).
   * @param {Object} [options] - Engine options.
   * @param {HTMLElement} [options.container] - DOM element to render into.
   * @param {number} [options.textSpeed=30] - Typewriter speed (ms/char).
   * @param {number} [options.autoAdvanceDelay=2500] - Auto-advance wait time.
   * @param {number} [options.transitionDuration=400] - Crossfade duration (ms).
   * @param {Function} [options.onNodeChange] - Called when entering a node.
   * @param {Function} [options.onChoiceMade] - Called when a choice is selected.
   * @param {Function} [options.onVariableChange] - Called when any variable changes.
   * @param {Function} [options.onTextComplete] - Called when typewriter finishes.
   * @param {Function} [options.onEnd] - Called when story reaches an end.
   */
  constructor(storyData, options = {}) {
    if (!storyData || !storyData.nodes) {
      throw new Error('[VN Engine] storyData must contain a "nodes" object.');
    }

    this.story = storyData;
    this.options = { ...DEFAULT_OPTIONS, ...options };

    // Resolve container
    this.container = this.options.container || document.getElementById('vn-container');
    if (!this.container) {
      throw new Error(
        '[VN Engine] No container element found. Pass { container: element } in options ' +
        'or ensure an element with id="vn-container" exists in the DOM.'
      );
    }

    // ── Game State ──────────────────────────────────────────────────
    this.variables = { ...(storyData.variables || {}) };
    this.currentNodeId = null;
    this.history = [];            // Array of { nodeId, speaker, text }
    this.isAnimating = false;     // True during crossfade / typewriter
    this.isWaitingForChoice = false;
    this.autoMode = false;
    this.skipMode = false;
    this._autoTimer = null;
    this._typewriterTimer = null;
    this._isDestroyed = false;

    // ── Callbacks (also exposed as event dispatches) ─────────────────
    this.onNodeChange = this.options.onNodeChange || null;
    this.onChoiceMade = this.options.onChoiceMade || null;
    this.onVariableChange = this.options.onVariableChange || null;
    this.onTextComplete = this.options.onTextComplete || null;
    this.onEnd = this.options.onEnd || null;

    // ── Build DOM ───────────────────────────────────────────────────
    this._createDOM();
    this._injectStyles();
    this._bindEvents();
  }

  // ─── Public API ──────────────────────────────────────────────────────

  /**
   * Start (or restart) the visual novel from the story's entry point.
   * @param {string} [nodeId] - Override the start node. Defaults to story.start.
   */
  start(nodeId) {
    this._assertAlive();
    const startId = nodeId || this.story.start || Object.keys(this.story.nodes)[0];
    if (!this.story.nodes[startId]) {
      throw new Error(`[VN Engine] Start node "${startId}" not found in story.nodes.`);
    }
    this.variables = { ...(this.story.variables || {}) };
    this.history = [];
    this.autoMode = false;
    this.skipMode = false;
    this._updateHUDButtons();
    this._goToNode(startId);
  }

  /**
   * Jump to a specific node programmatically.
   * @param {string} nodeId
   */
  goToNode(nodeId) {
    this._assertAlive();
    if (!this.story.nodes[nodeId]) {
      console.warn(`[VN Engine] Node "${nodeId}" not found. Treating as ending.`);
      this._handleEnd();
      return;
    }
    this._goToNode(nodeId);
  }

  /** Get the value of a tracked variable. */
  getVariable(name) {
    return this.variables[name];
  }

  /** Set a tracked variable and fire the onVariableChange callback. */
  setVariable(name, value) {
    const old = this.variables[name];
    this.variables[name] = value;
    if (this.onVariableChange && old !== value) {
      this.onVariableChange(name, value, old);
    }
  }

  /**
   * Returns a serializable snapshot of the current game state.
   * @returns {{ currentNodeId: string, variables: object, history: object[], checksum: string }}
   */
  getState() {
    const state = {
      storyTitle: this.story.title || 'Untitled',
      currentNodeId: this.currentNodeId,
      variables: { ...this.variables },
      history: this.history.map(h => ({ nodeId: h.nodeId, speaker: h.speaker, text: h.text })),
    };
    state.checksum = hashState(state);
    return state;
  }

  /**
   * Restore game state from a previously saved snapshot.
   * @param {Object} state - A state object returned by getState().
   * @returns {boolean} True if restore succeeded.
   */
  loadState(state) {
    this._assertAlive();
    if (!state || !state.currentNodeId || !state.variables) {
      console.warn('[VN Engine] Invalid save state.');
      return false;
    }
    const expectedChecksum = hashState(state);
    if (state.checksum && state.checksum !== expectedChecksum) {
      console.warn('[VN Engine] Save state checksum mismatch — data may be corrupted.');
    }
    if (!this.story.nodes[state.currentNodeId]) {
      console.warn('[VN Engine] Save state references unknown node. Falling back to start.');
      this.start();
      return false;
    }
    this.variables = { ...state.variables };
    this.history = state.history || [];
    this._goToNode(state.currentNodeId);
    return true;
  }

  /** Toggle auto-advance mode. */
  toggleAutoMode() {
    this.autoMode = !this.autoMode;
    this.skipMode = false;
    this._updateHUDButtons();
    if (!this.autoMode) {
      this._clearAutoTimer();
    } else if (!this.isAnimating && !this.isWaitingForChoice) {
      this._scheduleAutoAdvance();
    }
    return this.autoMode;
  }

  /** Toggle skip (fast-forward) mode. */
  toggleSkipMode() {
    this.skipMode = !this.skipMode;
    this.autoMode = false;
    this._updateHUDButtons();
    this._clearAutoTimer();
    if (this.skipMode && !this.isAnimating && !this.isWaitingForChoice) {
      this._advanceOrEnd();
    }
    return this.skipMode;
  }

  /** Show the text backlog overlay. */
  showBacklog() {
    this._renderBacklog();
    this.els.backlog.classList.add('vn-backlog--visible');
  }

  /** Hide the text backlog overlay. */
  hideBacklog() {
    this.els.backlog.classList.remove('vn-backlog--visible');
  }

  /** Toggle backlog visibility. */
  toggleBacklog() {
    if (this.els.backlog.classList.contains('vn-backlog--visible')) {
      this.hideBacklog();
    } else {
      this.showBacklog();
    }
  }

  /**
   * Save game state to localStorage.
   * @param {string} [slot='auto'] - Save slot name.
   */
  saveToSlot(slot = 'auto') {
    const state = this.getState();
    try {
      localStorage.setItem(`vn_save_${slot}`, JSON.stringify(state));
      this._flashMessage(`💾 Saved to "${slot}"`);
    } catch (e) {
      console.warn('[VN Engine] Failed to save to localStorage:', e);
      this._flashMessage('⚠️ Save failed (storage full?)');
    }
  }

  /**
   * Load game state from localStorage.
   * @param {string} [slot='auto'] - Save slot name.
   * @returns {boolean} True if a save was found and loaded.
   */
  loadFromSlot(slot = 'auto') {
    try {
      const raw = localStorage.getItem(`vn_save_${slot}`);
      if (!raw) {
        this._flashMessage(`📭 No save found in "${slot}"`);
        return false;
      }
      const state = JSON.parse(raw);
      const ok = this.loadState(state);
      if (ok) this._flashMessage(`📖 Loaded from "${slot}"`);
      return ok;
    } catch (e) {
      console.warn('[VN Engine] Failed to load from localStorage:', e);
      return false;
    }
  }

  /**
   * List available save slots in localStorage.
   * @returns {string[]}
   */
  listSaveSlots() {
    const slots = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('vn_save_')) {
        slots.push(key.replace('vn_save_', ''));
      }
    }
    return slots;
  }

  /**
   * Delete a save slot.
   * @param {string} [slot='auto']
   */
  deleteSaveSlot(slot = 'auto') {
    localStorage.removeItem(`vn_save_${slot}`);
  }

  /**
   * Destroy the engine instance — removes DOM elements and clears timers.
   */
  destroy() {
    this._isDestroyed = true;
    this._clearAutoTimer();
    this._clearTypewriterTimer();
    if (this.els.root && this.els.root.parentNode) {
      this.els.root.parentNode.removeChild(this.els.root);
    }
    if (this._styleEl && this._styleEl.parentNode) {
      this._styleEl.parentNode.removeChild(this._styleEl);
    }
  }

  // ─── Private: DOM Construction ────────────────────────────────────────

  /** @private Create the full DOM structure inside the container. */
  _createDOM() {
    this.container.innerHTML = '';
    this.container.classList.add('vn-container');

    const root = document.createElement('div');
    root.className = 'vn-root';

    root.innerHTML = `
      <!-- Background layer -->
      <div class="vn-bg-layer">
        <img class="vn-bg-image vn-bg-image--active" src="" alt="" style="display:none" />
        <img class="vn-bg-image vn-bg-image--next" src="" alt="" style="display:none" />
      </div>

      <!-- Sprite layer -->
      <div class="vn-sprite-layer"></div>

      <!-- Click-to-advance overlay -->
      <div class="vn-click-area"></div>

      <!-- Text box -->
      <div class="vn-textbox">
        <div class="vn-speaker-tag"></div>
        <div class="vn-dialogue-text"></div>
        <div class="vn-choices"></div>
        <div class="vn-next-indicator">▼</div>
      </div>

      <!-- HUD buttons -->
      <div class="vn-hud">
        <button class="vn-hud-btn vn-btn-auto" title="Auto mode">AUTO</button>
        <button class="vn-hud-btn vn-btn-skip" title="Skip mode">SKIP</button>
        <button class="vn-hud-btn vn-btn-backlog" title="Backlog">LOG</button>
        <button class="vn-hud-btn vn-btn-save" title="Save">💾</button>
        <button class="vn-hud-btn vn-btn-load" title="Load">📂</button>
      </div>

      <!-- Toast / flash message -->
      <div class="vn-toast"></div>

      <!-- Backlog overlay -->
      <div class="vn-backlog">
        <div class="vn-backlog-inner">
          <div class="vn-backlog-header">
            <span>📜 Backlog</span>
            <button class="vn-backlog-close">✕</button>
          </div>
          <div class="vn-backlog-content"></div>
        </div>
      </div>
    `;

    this.container.appendChild(root);

    // Cache element references
    this.els = {
      root:               root,
      bgLayer:            root.querySelector('.vn-bg-layer'),
      bgActive:           root.querySelector('.vn-bg-image--active'),
      bgNext:             root.querySelector('.vn-bg-image--next'),
      spriteLayer:        root.querySelector('.vn-sprite-layer'),
      clickArea:          root.querySelector('.vn-click-area'),
      textbox:            root.querySelector('.vn-textbox'),
      speakerTag:         root.querySelector('.vn-speaker-tag'),
      dialogueText:       root.querySelector('.vn-dialogue-text'),
      choices:            root.querySelector('.vn-choices'),
      nextIndicator:      root.querySelector('.vn-next-indicator'),
      btnAuto:            root.querySelector('.vn-btn-auto'),
      btnSkip:            root.querySelector('.vn-btn-skip'),
      btnBacklog:         root.querySelector('.vn-btn-backlog'),
      btnSave:            root.querySelector('.vn-btn-save'),
      btnLoad:            root.querySelector('.vn-btn-load'),
      toast:              root.querySelector('.vn-toast'),
      backlog:            root.querySelector('.vn-backlog'),
      backlogContent:     root.querySelector('.vn-backlog-content'),
      backlogClose:       root.querySelector('.vn-backlog-close'),
    };

    // Crossfade timing
    this._transitionDuration = this.options.transitionDuration;
    this.els.bgActive.style.transition = `opacity ${this._transitionDuration}ms ease`;
    this.els.bgNext.style.transition = `opacity ${this._transitionDuration}ms ease`;
  }

  /** @private Inject default CSS styles into the document head. */
  _injectStyles() {
    if (document.getElementById('vn-engine-styles')) return;

    const css = `
      .vn-container {
        position: relative;
        width: 100%;
        max-width: 960px;
        height: 640px;
        margin: 0 auto;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
        font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
      }

      .vn-root {
        position: relative;
        width: 100%;
        height: 100%;
        background: #000;
      }

      /* ── Background Layer ───────────────────────────── */

      .vn-bg-layer {
        position: absolute;
        inset: 0;
        z-index: 0;
      }

      .vn-bg-layer .vn-bg-image {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: opacity 0.4s ease;
      }

      /* ── Sprite Layer ───────────────────────────────── */

      .vn-sprite-layer {
        position: absolute;
        inset: 0;
        z-index: 1;
        pointer-events: none;
      }

      .vn-sprite {
        position: absolute;
        bottom: 0;
        max-height: 85%;
        width: auto;
        transition: opacity 0.4s ease, transform 0.4s ease;
      }

      .vn-sprite--left {
        left: 2%;
        transform: translateX(0);
      }

      .vn-sprite--center {
        left: 50%;
        transform: translateX(-50%);
      }

      .vn-sprite--right {
        right: 2%;
        transform: translateX(0);
      }

      .vn-sprite--entering {
        opacity: 0;
        transform: translateY(20px);
      }

      .vn-sprite--left.vn-sprite--entering {
        transform: translate(-20px, 20px);
      }

      .vn-sprite--right.vn-sprite--entering {
        transform: translate(20px, 20px);
      }

      /* ── Click Area ─────────────────────────────────── */

      .vn-click-area {
        position: absolute;
        inset: 0;
        z-index: 2;
        cursor: pointer;
      }

      /* ── Text Box ───────────────────────────────────── */

      .vn-textbox {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        z-index: 3;
        min-height: 140px;
        padding: 20px 28px 24px;
        background: linear-gradient(0deg,
          rgba(0,0,0,0.85) 0%,
          rgba(0,0,0,0.70) 70%,
          transparent 100%);
        color: #fff;
        pointer-events: none;
      }

      .vn-speaker-tag {
        display: inline-block;
        padding: 4px 16px;
        margin-bottom: 8px;
        background: rgba(255,255,255,0.12);
        border-left: 3px solid #f0c060;
        border-radius: 0 4px 4px 0;
        font-size: 0.95rem;
        font-weight: 600;
        color: #f0c060;
        letter-spacing: 0.5px;
        min-width: 60px;
        text-align: center;
        transition: opacity 0.3s;
      }

      .vn-speaker-tag:empty {
        display: none;
      }

      .vn-dialogue-text {
        font-size: 1.1rem;
        line-height: 1.8;
        letter-spacing: 0.3px;
        min-height: 3.6em;
        color: #e8e8e8;
        text-shadow: 0 1px 3px rgba(0,0,0,0.6);
      }

      .vn-next-indicator {
        position: absolute;
        right: 28px;
        bottom: 20px;
        font-size: 1.2rem;
        color: rgba(255,255,255,0.5);
        animation: vn-bounce 1.2s ease-in-out infinite;
        pointer-events: auto;
        transition: opacity 0.3s;
      }

      @keyframes vn-bounce {
        0%, 100% { transform: translateY(0); opacity: 0.4; }
        50%      { transform: translateY(6px); opacity: 0.9; }
      }

      /* ── Choice Buttons ─────────────────────────────── */

      .vn-choices {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-top: 12px;
        pointer-events: auto;
      }

      .vn-choices:empty {
        display: none;
      }

      .vn-choice-btn {
        display: block;
        width: 100%;
        max-width: 520px;
        padding: 10px 18px;
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.18);
        border-radius: 6px;
        color: #ddd;
        font-size: 1rem;
        font-family: inherit;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
      }

      .vn-choice-btn:hover,
      .vn-choice-btn:focus-visible {
        background: rgba(240,192,96,0.15);
        border-color: rgba(240,192,96,0.5);
        color: #fff;
        outline: none;
        padding-left: 26px;
      }

      .vn-choice-btn:active {
        background: rgba(240,192,96,0.25);
      }

      /* ── HUD Buttons ────────────────────────────────── */

      .vn-hud {
        position: absolute;
        top: 10px;
        right: 12px;
        z-index: 10;
        display: flex;
        gap: 6px;
      }

      .vn-hud-btn {
        width: 38px;
        height: 28px;
        padding: 0;
        background: rgba(0,0,0,0.45);
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 4px;
        color: #ccc;
        font-size: 0.7rem;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.15s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .vn-hud-btn:hover {
        background: rgba(255,255,255,0.12);
        color: #fff;
      }

      .vn-hud-btn--active {
        background: rgba(240,192,96,0.35);
        border-color: rgba(240,192,96,0.7);
        color: #f0c060;
      }

      /* ── Toast ──────────────────────────────────────── */

      .vn-toast {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 20;
        padding: 10px 24px;
        background: rgba(0,0,0,0.82);
        border-radius: 8px;
        color: #fff;
        font-size: 1rem;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .vn-toast--visible {
        opacity: 1;
      }

      /* ── Backlog Overlay ────────────────────────────── */

      .vn-backlog {
        position: absolute;
        inset: 0;
        z-index: 15;
        background: rgba(0,0,0,0.88);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s ease;
      }

      .vn-backlog--visible {
        opacity: 1;
        pointer-events: auto;
      }

      .vn-backlog-inner {
        width: 85%;
        max-height: 80%;
        display: flex;
        flex-direction: column;
        background: #1a1a1a;
        border: 1px solid rgba(255,255,255,0.15);
        border-radius: 10px;
        overflow: hidden;
      }

      .vn-backlog-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 18px;
        background: #222;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        color: #f0c060;
        font-weight: 600;
      }

      .vn-backlog-close {
        width: 28px;
        height: 28px;
        padding: 0;
        background: none;
        border: 1px solid rgba(255,255,255,0.2);
        border-radius: 50%;
        color: #aaa;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.15s;
      }

      .vn-backlog-close:hover {
        background: rgba(255,255,255,0.1);
        color: #fff;
      }

      .vn-backlog-content {
        overflow-y: auto;
        padding: 12px 18px;
        color: #ccc;
        font-size: 0.95rem;
        line-height: 1.7;
      }

      .vn-backlog-entry {
        margin-bottom: 14px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }

      .vn-backlog-speaker {
        color: #f0c060;
        font-weight: 600;
        font-size: 0.85rem;
        margin-bottom: 2px;
      }

      .vn-backlog-speaker:empty {
        display: none;
      }

      /* ── Responsive ─────────────────────────────────── */

      @media (max-width: 600px) {
        .vn-container {
          height: 100vh;
          max-width: 100%;
        }

        .vn-textbox {
          padding: 14px 16px 18px;
          min-height: 120px;
        }

        .vn-dialogue-text {
          font-size: 1rem;
          line-height: 1.6;
        }

        .vn-speaker-tag {
          font-size: 0.85rem;
          padding: 3px 12px;
        }

        .vn-hud {
          top: 6px;
          right: 8px;
          gap: 4px;
        }

        .vn-hud-btn {
          width: 32px;
          height: 24px;
          font-size: 0.65rem;
        }
      }
    `;

    const styleEl = document.createElement('style');
    styleEl.id = 'vn-engine-styles';
    styleEl.textContent = css;
    document.head.appendChild(styleEl);
    this._styleEl = styleEl;
  }

  // ─── Private: Event Binding ──────────────────────────────────────────

  /** @private */
  _bindEvents() {
    // Click/tap to advance
    this.els.clickArea.addEventListener('click', (e) => {
      if (this.isWaitingForChoice) return; // choices handle themselves
      if (this.isAnimating) {
        // If typewriter is running, skip to full text
        this._skipTypewriter();
        return;
      }
      this._advanceOrEnd();
    });

    // Keyboard support
    this._onKeyDown = (e) => {
      if (this.isWaitingForChoice) return; // choices handled separately
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        if (this.isAnimating) {
          this._skipTypewriter();
        } else {
          this._advanceOrEnd();
        }
      }
    };
    document.addEventListener('keydown', this._onKeyDown);

    // HUD buttons
    this.els.btnAuto.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleAutoMode();
    });
    this.els.btnSkip.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleSkipMode();
    });
    this.els.btnBacklog.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleBacklog();
    });
    this.els.btnSave.addEventListener('click', (e) => {
      e.stopPropagation();
      this.saveToSlot('auto');
    });
    this.els.btnLoad.addEventListener('click', (e) => {
      e.stopPropagation();
      this.loadFromSlot('auto');
    });
    this.els.backlogClose.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideBacklog();
    });
    this.els.backlog.addEventListener('click', (e) => {
      if (e.target === this.els.backlog) this.hideBacklog();
    });

    // Keyboard shortcut for backlog
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.els.backlog.classList.contains('vn-backlog--visible')) {
          this.hideBacklog();
        }
      }
    });
  }

  // ─── Private: Core Navigation ────────────────────────────────────────

  /**
   * @private Navigate to a node: update state, render scene, handle flow.
   */
  _goToNode(nodeId) {
    const node = this.story.nodes[nodeId];
    if (!node) {
      this._handleEnd();
      return;
    }

    this.isAnimating = true;
    this.isWaitingForChoice = false;
    this._clearAutoTimer();
    this._clearTypewriterTimer();
    this.els.choices.innerHTML = '';
    this.els.nextIndicator.style.display = 'none';

    this.currentNodeId = nodeId;

    // Push to history
    this.history.push({
      nodeId,
      speaker: node.speaker || '',
      text: node.text || '',
    });

    // Update background (with crossfade if different)
    this._updateBackground(node.background || null);

    // Update sprites
    this._updateSprites(node);

    // Update speaker
    this.els.speakerTag.textContent = node.speaker || '';

    // Fire callback
    if (this.onNodeChange) {
      this.onNodeChange(node, nodeId);
    }

    // Skip mode: skip typewriter, advance immediately after transition
    if (this.skipMode) {
      this.els.dialogueText.textContent = node.text || '';
      this.isAnimating = false;
      // Short delay so the player can perceive the skip
      setTimeout(() => {
        if (this.skipMode && !this._isDestroyed) {
          this._advanceOrEnd();
        }
      }, 80);
      return;
    }

    // Reset dialogue and start typewriter
    this.els.dialogueText.textContent = '';
    this._runTypewriter(node.text || '');
  }

  /**
   * @private Advance to the next node, or show choices, or end.
   */
  _advanceOrEnd() {
    if (this.isAnimating || this.isWaitingForChoice) return;

    const node = this.story.nodes[this.currentNodeId];
    if (!node) {
      this._handleEnd();
      return;
    }

    // If the node has choices, show them
    if (node.choices && node.choices.length > 0) {
      this._showChoices(node.choices);
      return;
    }

    // If the node has a next target, go there
    if (node.next) {
      this._goToNode(node.next);
      return;
    }

    // No choices, no next — this is an ending
    this._handleEnd();
  }

  /** @private Called when the story reaches an end node. */
  _handleEnd() {
    this._clearAutoTimer();
    this._clearTypewriterTimer();
    this.isAnimating = false;
    this.isWaitingForChoice = false;
    this.els.nextIndicator.style.display = 'none';
    this.els.choices.innerHTML = '';

    // Show ending text if there's dialogue
    const node = this.story.nodes[this.currentNodeId];
    if (node && node.text) {
      this.els.dialogueText.textContent = node.text;
    }

    // Dim the click area
    this.els.clickArea.style.pointerEvents = 'none';

    // Show "The End" indicator
    this.els.nextIndicator.textContent = '— FIN —';
    this.els.nextIndicator.style.display = 'block';
    this.els.nextIndicator.style.animation = 'none';
    this.els.nextIndicator.style.opacity = '0.8';

    if (this.onEnd) {
      this.onEnd(this.currentNodeId, this.variables);
    }
  }

  // ─── Private: Background ─────────────────────────────────────────────

  /** @private */
  _updateBackground(bgImage) {
    const currentSrc = this.els.bgActive.src || '';
    const newSrc = bgImage || '';

    if (currentSrc === newSrc) return;

    if (!newSrc) {
      // No background — hide
      this.els.bgActive.style.opacity = '0';
      this.els.bgNext.style.opacity = '0';
      return;
    }

    // Crossfade: load new image on the "next" layer, then swap
    this.els.bgNext.src = newSrc;
    this.els.bgNext.style.display = 'block';
    this.els.bgNext.style.opacity = '0';

    // Force reflow
    void this.els.bgNext.offsetWidth;

    this.els.bgNext.style.opacity = '1';
    this.els.bgActive.style.opacity = '0';

    // After transition, swap layers
    setTimeout(() => {
      if (this._isDestroyed) return;
      this.els.bgActive.src = newSrc;
      this.els.bgActive.style.display = 'block';
      this.els.bgActive.style.opacity = '1';
      this.els.bgNext.style.opacity = '0';
      this.els.bgNext.style.display = 'none';
    }, this._transitionDuration);
  }

  // ─── Private: Sprites ────────────────────────────────────────────────

  /** @private */
  _updateSprites(node) {
    const spriteLayer = this.els.spriteLayer;

    // Normalize: support both `sprite` (single) and `sprites` (array)
    let spriteList = [];
    if (node.sprites && Array.isArray(node.sprites)) {
      spriteList = node.sprites;
    } else if (node.sprite) {
      spriteList = [node.sprite];
    }

    if (spriteList.length === 0) {
      // No sprites — fade out all existing
      const existing = spriteLayer.querySelectorAll('.vn-sprite');
      existing.forEach(el => {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), this._transitionDuration);
      });
      return;
    }

    // Build a map of desired sprites by position
    const desired = new Map(); // position → image
    for (const s of spriteList) {
      const pos = s.position || 'center';
      desired.set(pos, s.image);
    }

    // Remove sprites that are no longer wanted
    const existing = spriteLayer.querySelectorAll('.vn-sprite');
    existing.forEach(el => {
      const pos = el.dataset.position;
      if (!desired.has(pos)) {
        el.style.opacity = '0';
        setTimeout(() => el.remove(), this._transitionDuration);
      }
    });

    // Add or update sprites
    for (const [position, image] of desired) {
      let el = spriteLayer.querySelector(`.vn-sprite[data-position="${position}"]`);
      if (el) {
        // Update existing
        if (el.dataset.image !== image) {
          el.src = image;
          el.dataset.image = image;
        }
        el.style.opacity = '1';
      } else {
        // Create new
        el = document.createElement('img');
        el.className = `vn-sprite vn-sprite--${position} vn-sprite--entering`;
        el.src = image;
        el.alt = '';
        el.dataset.position = position;
        el.dataset.image = image;
        spriteLayer.appendChild(el);

        // Trigger entrance animation
        requestAnimationFrame(() => {
          el.classList.remove('vn-sprite--entering');
        });
      }
    }
  }

  // ─── Private: Typewriter ─────────────────────────────────────────────

  /** @private */
  _runTypewriter(text) {
    let index = 0;
    const total = text.length;
    const speed = this.skipMode ? 1 : (this.autoMode ? Math.max(3, this.options.textSpeed / 2) : this.options.textSpeed);

    this.isAnimating = true;

    const tick = () => {
      if (this._isDestroyed) return;

      if (index >= total) {
        // Typewriter complete
        this.isAnimating = false;
        this._onTypewriterComplete();
        return;
      }

      // Reveal one character at a time
      index++;
      this.els.dialogueText.textContent = text.slice(0, index);

      this._typewriterTimer = setTimeout(tick, speed);
    };

    tick();
  }

  /** @private Jump to the end of the current typewriter. */
  _skipTypewriter() {
    this._clearTypewriterTimer();
    if (this.isAnimating) {
      const node = this.story.nodes[this.currentNodeId];
      if (node && node.text) {
        this.els.dialogueText.textContent = node.text;
      }
      this.isAnimating = false;
      this._onTypewriterComplete();
    }
  }

  /** @private Called when typewriter finishes displaying text. */
  _onTypewriterComplete() {
    const node = this.story.nodes[this.currentNodeId];

    // Fire callback
    if (this.onTextComplete && node) {
      this.onTextComplete(node, this.currentNodeId);
    }

    // If node has choices, show them
    if (node && node.choices && node.choices.length > 0) {
      this._showChoices(node.choices);
      return;
    }

    // Show next indicator
    this.els.nextIndicator.style.display = 'block';
    this.els.nextIndicator.textContent = '▼';
    this.els.nextIndicator.style.animation = '';
    this.els.nextIndicator.style.opacity = '';

    // Auto mode: schedule advance
    if (this.autoMode && !this.isWaitingForChoice) {
      this._scheduleAutoAdvance();
    }
  }

  /** @private */
  _clearTypewriterTimer() {
    if (this._typewriterTimer) {
      clearTimeout(this._typewriterTimer);
      this._typewriterTimer = null;
    }
  }

  // ─── Private: Choices ────────────────────────────────────────────────

  /** @private */
  _showChoices(choices) {
    this.isWaitingForChoice = true;
    this.els.nextIndicator.style.display = 'none';
    this._clearAutoTimer();

    const container = this.els.choices;
    container.innerHTML = '';

    choices.forEach((choice, index) => {
      const btn = document.createElement('button');
      btn.className = 'vn-choice-btn';
      btn.textContent = choice.text;
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this._handleChoice(choice, index);
      });

      // Keyboard: number keys 1-9 to select choices
      const keyHandler = (e) => {
        if (e.key === String(index + 1)) {
          e.preventDefault();
          this._handleChoice(choice, index);
          document.removeEventListener('keydown', keyHandler);
        }
      };

      // We need to manage this carefully — only listen while choices are shown
      const wrappedHandler = (e) => {
        if (!this.isWaitingForChoice) {
          document.removeEventListener('keydown', wrappedHandler);
          return;
        }
        if (e.key === String(index + 1)) {
          e.preventDefault();
          this._handleChoice(choice, index);
        }
      };
      document.addEventListener('keydown', wrappedHandler);

      // Store cleanup reference
      btn._keyHandler = wrappedHandler;

      container.appendChild(btn);
    });

    // Focus first choice for accessibility
    const firstBtn = container.querySelector('.vn-choice-btn');
    if (firstBtn) firstBtn.focus();
  }

  /** @private */
  _handleChoice(choice, index) {
    if (!this.isWaitingForChoice) return;

    this.isWaitingForChoice = false;
    this.els.choices.innerHTML = '';

    // Remove all choice key listeners
    document.querySelectorAll('.vn-choice-btn').forEach(b => {
      if (b._keyHandler) {
        document.removeEventListener('keydown', b._keyHandler);
      }
    });

    // Apply affection delta
    if (choice.affection !== undefined) {
      const newVal = (this.variables.affection || 0) + choice.affection;
      this.setVariable('affection', newVal);
    }

    // Apply arbitrary variable changes via `set`
    if (choice.set && typeof choice.set === 'object') {
      for (const [key, val] of Object.entries(choice.set)) {
        this.setVariable(key, val);
      }
    }

    // Fire callback
    if (this.onChoiceMade) {
      this.onChoiceMade(choice, this.currentNodeId, index);
    }

    // Navigate to target node
    if (choice.next && this.story.nodes[choice.next]) {
      this._goToNode(choice.next);
    } else {
      this._handleEnd();
    }
  }

  // ─── Private: Auto Advance ───────────────────────────────────────────

  /** @private */
  _scheduleAutoAdvance() {
    this._clearAutoTimer();
    this._autoTimer = setTimeout(() => {
      if (this.autoMode && !this.isAnimating && !this.isWaitingForChoice && !this._isDestroyed) {
        this._advanceOrEnd();
      }
    }, this.options.autoAdvanceDelay);
  }

  /** @private */
  _clearAutoTimer() {
    if (this._autoTimer) {
      clearTimeout(this._autoTimer);
      this._autoTimer = null;
    }
  }

  // ─── Private: Backlog ────────────────────────────────────────────────

  /** @private */
  _renderBacklog() {
    if (this.history.length === 0) {
      this.els.backlogContent.innerHTML =
        '<p style="color:#888;text-align:center;padding:40px">No dialogue yet.</p>';
      return;
    }

    const html = this.history.map(entry => `
      <div class="vn-backlog-entry">
        ${entry.speaker ? `<div class="vn-backlog-speaker">${escapeHTML(entry.speaker)}</div>` : ''}
        <div>${escapeHTML(entry.text)}</div>
      </div>
    `).join('');

    this.els.backlogContent.innerHTML = html;
    this.els.backlogContent.scrollTop = this.els.backlogContent.scrollHeight;
  }

  // ─── Private: HUD ────────────────────────────────────────────────────

  /** @private */
  _updateHUDButtons() {
    this.els.btnAuto.classList.toggle('vn-hud-btn--active', this.autoMode);
    this.els.btnSkip.classList.toggle('vn-hud-btn--active', this.skipMode);
  }

  // ─── Private: Toast ──────────────────────────────────────────────────

  /** @private Show a brief message in the center of the screen. */
  _flashMessage(msg) {
    const toast = this.els.toast;
    toast.textContent = msg;
    toast.classList.add('vn-toast--visible');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('vn-toast--visible');
    }, 1500);
  }

  // ─── Private: Helpers ────────────────────────────────────────────────

  /** @private */
  _assertAlive() {
    if (this._isDestroyed) {
      throw new Error('[VN Engine] This engine instance has been destroyed.');
    }
  }
}

// ─── Named Exports ─────────────────────────────────────────────────────

/**
 * Validate a story data object and return an array of issues (empty = valid).
 * Useful for authoring tools or debugging.
 *
 * @param {Object} storyData
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateStory(storyData) {
  const errors = [];
  const warnings = [];

  if (!storyData || typeof storyData !== 'object') {
    errors.push('Story data must be a non-null object.');
    return { valid: false, errors, warnings };
  }

  if (!storyData.nodes || typeof storyData.nodes !== 'object' || Object.keys(storyData.nodes).length === 0) {
    errors.push('storyData.nodes must be a non-empty object of node definitions.');
    return { valid: false, errors, warnings };
  }

  if (storyData.start && !storyData.nodes[storyData.start]) {
    errors.push(`storyData.start ("${storyData.start}") does not match any node key.`);
  }

  const nodeIds = new Set(Object.keys(storyData.nodes));
  const referenced = new Set();

  for (const [id, node] of Object.entries(storyData.nodes)) {
    if (!node || typeof node !== 'object') {
      errors.push(`Node "${id}" is not an object.`);
      continue;
    }

    if (!node.text && node.text !== '') {
      warnings.push(`Node "${id}" has no "text" field.`);
    }

    // Check next
    if (node.next) {
      referenced.add(node.next);
      if (!nodeIds.has(node.next)) {
        errors.push(`Node "${id}" references unknown "next" target: "${node.next}".`);
      }
    }

    // Check choices
    if (node.choices) {
      if (!Array.isArray(node.choices)) {
        errors.push(`Node "${id}" "choices" must be an array.`);
      } else {
        for (let i = 0; i < node.choices.length; i++) {
          const c = node.choices[i];
          if (!c.text) {
            errors.push(`Node "${id}" choice[${i}] is missing "text".`);
          }
          if (c.next) {
            referenced.add(c.next);
            if (!nodeIds.has(c.next)) {
              errors.push(`Node "${id}" choice[${i}] references unknown "next": "${c.next}".`);
            }
          } else {
            warnings.push(`Node "${id}" choice[${i}] has no "next" — will trigger ending.`);
          }
        }
      }
    }

    // If no next and no choices, it's a terminal (ending) node — that's fine
  }

  // Warn about orphan nodes (never referenced)
  for (const id of nodeIds) {
    if (id !== storyData.start && !referenced.has(id)) {
      warnings.push(`Node "${id}" is never referenced by any "next" or choice target.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create a minimal HTML page scaffold for the visual novel engine.
 * Returns an HTML string that can be written to a file.
 *
 * @param {Object} [options]
 * @param {string} [options.title='Visual Novel'] - Page title.
 * @param {string} [options.containerId='vn-container'] - Container element ID.
 * @param {number} [options.width=960] - Max width in px.
 * @param {number} [options.height=640] - Height in px.
 * @returns {string}
 */
export function createHTMLScaffold(options = {}) {
  const {
    title = 'Visual Novel',
    containerId = 'vn-container',
    width = 960,
    height = 640,
  } = options;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHTML(title)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: #111;
    }
    #${containerId} {
      width: 100%;
      max-width: ${width}px;
      height: ${height}px;
    }
  </style>
</head>
<body>
  <div id="${containerId}"></div>
  <script type="module">
    import { VisualNovelEngine } from './engine.js';
    import storyData from './sample-story.js';

    const vn = new VisualNovelEngine(storyData, {
      textSpeed: 35,
      onEnd: (nodeId, vars) => {
        console.log('Story ended at', nodeId, 'Final variables:', vars);
      },
      onChoiceMade: (choice) => {
        console.log('Player chose:', choice.text);
      },
    });

    vn.start();
  </script>
</body>
</html>`;
}

// ─── Default Export ────────────────────────────────────────────────────

export default VisualNovelEngine;
