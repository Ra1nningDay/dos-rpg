//=============================================================================
// DoS_EchoMemory.js - Visual Novel Memory System
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Implements visual novel-style memory sequences with character portraits and backgrounds.
 * @author DoS Team
 *
 * @param MemorySwitchBase
 * @type number
 * @default 10
 * @desc Base switch ID for memory tracking (switches 10-30 for memories 1-20)
 *
 * @param ShowMemoryLogInMenu
 * @type boolean
 * @default true
 * @desc Add memory log option to the menu
 *
 * @param PortraitFolder
 * @type string
 * @default img/pictures/
 * @desc Folder path for character portraits
 *
 * @param BackgroundFolder
 * @type string
 * @default img/pictures/
 * @desc Folder path for memory backgrounds
 *
 * @param MemoryTextSpeed
 * @type number
 * @default 2
 * @desc Text display speed for memories (1=slow, 2=normal, 3=fast)
 *
 * @help DoS_EchoMemory.js
 *
 * This plugin implements visual novel-style memory sequences that reveal
 * the protagonist's backstory during tower events.
 *
 * Plugin Commands:
 * - StartMemory [memoryId] : Starts a memory sequence with specified ID
 * - UnlockMemory [memoryId] : Unlocks a memory for viewing in the log
 * - ShowMemoryLog : Opens the memory log window
 * - SetMemoryPortrait [filename] : Sets character portrait for current memory
 * - SetMemoryBackground [filename] : Sets background for current memory
 * - AddMemoryText [text] : Adds text to current memory sequence
 *
 * Memory Structure:
 * Each memory consists of:
 * - Character portrait (left/right/center position)
 * - Background image
 * - Text sequence with typewriter effect
 * - Sound effects (optional)
 *
 * Memory Events:
 * Use plugin commands in event pages to create memory sequences:
 * 1. SetMemoryPortrait [filename]
 * 2. SetMemoryBackground [filename]
 * 3. AddMemoryText [text]
 * 4. Repeat step 3 for additional text
 * 5. UnlockMemory [memoryId] to make it viewable in log
 */

(() => {
  const pluginName = "DoS_EchoMemory";
  const parameters = PluginManager.parameters(pluginName);
  const memorySwitchBase = Number(parameters["MemorySwitchBase"] || 10);
  const showMemoryLogInMenu = parameters["ShowMemoryLogInMenu"] === "true";
  const portraitFolder = String(
    parameters["PortraitFolder"] || "img/pictures/"
  );
  const backgroundFolder = String(
    parameters["BackgroundFolder"] || "img/pictures/"
  );
  const memoryTextSpeed = Number(parameters["MemoryTextSpeed"] || 2);

  // Memory data storage
  const memoryData = new Map();

  // Plugin Commands
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "StartMemory") {
      const memoryId = Number(args[0]);
      $gameSystem.startMemory(memoryId);
    } else if (command === "UnlockMemory") {
      const memoryId = Number(args[0]);
      $gameSystem.unlockMemory(memoryId);
    } else if (command === "ShowMemoryLog") {
      SceneManager.push(Scene_MemoryLog);
    } else if (command === "SetMemoryPortrait") {
      const filename = String(args[0]);
      $gameSystem.setMemoryPortrait(filename);
    } else if (command === "SetMemoryBackground") {
      const filename = String(args[0]);
      $gameSystem.setMemoryBackground(filename);
    } else if (command === "AddMemoryText") {
      const text = String(args[0]);
      $gameSystem.addMemoryText(text);
    }
  };

  // Extend Game_System to handle memories
  Game_System.prototype.startMemory = function (memoryId) {
    // Initialize memory data if not exists
    if (!memoryData.has(memoryId)) {
      memoryData.set(memoryId, {
        id: memoryId,
        title: "Memory " + memoryId,
        portrait: "",
        background: "",
        textLines: [],
        unlocked: false,
      });
    }

    $gameTemp._currentMemoryId = memoryId;
    $gameTemp._memorySequence = [];
    SceneManager.push(Scene_EchoMemory);
  };

  Game_System.prototype.unlockMemory = function (memoryId) {
    const switchId = memorySwitchBase + memoryId - 1;
    $gameSwitches.setValue(switchId, true);

    // Update memory data
    if (memoryData.has(memoryId)) {
      const memory = memoryData.get(memoryId);
      memory.unlocked = true;
    }
  };

  Game_System.prototype.isMemoryUnlocked = function (memoryId) {
    const switchId = memorySwitchBase + memoryId - 1;
    return $gameSwitches.value(switchId);
  };

  Game_System.prototype.setMemoryPortrait = function (filename) {
    if (!$gameTemp._currentMemoryId) return;

    const memory = memoryData.get($gameTemp._currentMemoryId);
    if (memory) {
      memory.portrait = filename;
    }
  };

  Game_System.prototype.setMemoryBackground = function (filename) {
    if (!$gameTemp._currentMemoryId) return;

    const memory = memoryData.get($gameTemp._currentMemoryId);
    if (memory) {
      memory.background = filename;
    }
  };

  Game_System.prototype.addMemoryText = function (text) {
    if (!$gameTemp._currentMemoryId) return;

    const memory = memoryData.get($gameTemp._currentMemoryId);
    if (memory) {
      memory.textLines.push(text);
    }
  };

  Game_System.prototype.getMemoryData = function (memoryId) {
    return memoryData.get(memoryId);
  };

  Game_System.prototype.getAllUnlockedMemories = function () {
    const unlocked = [];
    for (let i = 1; i <= 20; i++) {
      if (this.isMemoryUnlocked(i)) {
        unlocked.push(i);
      }
    }
    return unlocked;
  };

  // Scene_EchoMemory - Visual novel style memory scene
  function Scene_EchoMemory() {
    this.initialize(...arguments);
  }

  Scene_EchoMemory.prototype = Object.create(Scene_Base.prototype);
  Scene_EchoMemory.prototype.constructor = Scene_EchoMemory;

  Scene_EchoMemory.prototype.initialize = function () {
    Scene_Base.prototype.initialize.call(this);
    this._memoryId = $gameTemp._currentMemoryId;
    this._memoryData = memoryData.get(this._memoryId);
    this._currentTextIndex = 0;
    this._textDisplayTimer = 0;
    this._isTextComplete = false;
  };

  Scene_EchoMemory.prototype.create = function () {
    Scene_Base.prototype.create.call(this);
    this.createBackground();
    this.createPortrait();
    this.createTextWindow();
    this.createSkipButton();
  };

  Scene_EchoMemory.prototype.createBackground = function () {
    this._backgroundSprite = new Sprite();
    this._backgroundSprite.x = 0;
    this._backgroundSprite.y = 0;
    this.addChild(this._backgroundSprite);

    if (this._memoryData && this._memoryData.background) {
      const bitmap = ImageManager.loadPicture(this._memoryData.background);
      this._backgroundSprite.bitmap = bitmap;
    } else {
      // Default dark background
      this._backgroundSprite.bitmap = new Bitmap(
        Graphics.boxWidth,
        Graphics.boxHeight
      );
      this._backgroundSprite.bitmap.fillAll("#000000");
    }
  };

  Scene_EchoMemory.prototype.createPortrait = function () {
    this._portraitSprite = new Sprite();
    this._portraitSprite.x = Graphics.boxWidth / 2;
    this._portraitSprite.y = Graphics.boxHeight / 2;
    this._portraitSprite.anchor.x = 0.5;
    this._portraitSprite.anchor.y = 0.5;
    this.addChild(this._portraitSprite);

    if (this._memoryData && this._memoryData.portrait) {
      const bitmap = ImageManager.loadPicture(this._memoryData.portrait);
      this._portraitSprite.bitmap = bitmap;
      this._portraitSprite.x = Graphics.boxWidth * 0.75; // Right side
    }
  };

  Scene_EchoMemory.prototype.createTextWindow = function () {
    const windowWidth = Graphics.boxWidth * 0.8;
    const windowHeight = 150;
    const windowX = (Graphics.boxWidth - windowWidth) / 2;
    const windowY = Graphics.boxHeight - windowHeight - 50;

    this._textWindow = new Window_EchoMemory(
      new Rectangle(windowX, windowY, windowWidth, windowHeight)
    );
    this.addChild(this._textWindow);
  };

  Scene_EchoMemory.prototype.createSkipButton = function () {
    this._skipButton = new Sprite_Button();
    this._skipButton.bitmap = ImageManager.loadSystem("IconSet");
    const iconIndex = 16; // Skip icon
    const pw = ImageManager.iconWidth;
    const ph = ImageManager.iconHeight;
    const sx = (iconIndex % 16) * pw;
    const sy = Math.floor(iconIndex / 16) * ph;
    this._skipButton.setFrame(sx, sy, pw, ph);
    this._skipButton.x = Graphics.boxWidth - pw - 10;
    this._skipButton.y = 10;
    this._skipButton.setClickHandler(this.skipMemory.bind(this));
    this.addChild(this._skipButton);
  };

  Scene_EchoMemory.prototype.start = function () {
    Scene_Base.prototype.start.call(this);
    this.startTextDisplay();
  };

  Scene_EchoMemory.prototype.startTextDisplay = function () {
    if (this._currentTextIndex < this._memoryData.textLines.length) {
      const text = this._memoryData.textLines[this._currentTextIndex];
      this._textWindow.startText(text, memoryTextSpeed);
      this._isTextComplete = false;
    } else {
      this.endMemory();
    }
  };

  Scene_EchoMemory.prototype.update = function () {
    Scene_Base.prototype.update.call(this);

    if (this._textWindow.isTextComplete() && !this._isTextComplete) {
      this._isTextComplete = true;
    }

    // Check for input to advance text
    if (this._isTextComplete && Input.isTriggered("ok")) {
      this._currentTextIndex++;
      this.startTextDisplay();
    }
  };

  Scene_EchoMemory.prototype.skipMemory = function () {
    this.endMemory();
  };

  Scene_EchoMemory.prototype.endMemory = function () {
    // Unlock the memory
    this.unlockMemory();

    // Return to previous scene
    SceneManager.pop();
  };

  Scene_EchoMemory.prototype.unlockMemory = function () {
    $gameSystem.unlockMemory(this._memoryId);
  };

  // Window_EchoMemory - Text display window for memories
  function Window_EchoMemory() {
    this.initialize(...arguments);
  }

  Window_EchoMemory.prototype = Object.create(Window_Base.prototype);
  Window_EchoMemory.prototype.constructor = Window_EchoMemory;

  Window_EchoMemory.prototype.initialize = function (rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this._text = "";
    this._displayedText = "";
    this._textSpeed = 2;
    this._textTimer = 0;
    this._isComplete = false;
    this._opacity = 0;
  };

  Window_EchoMemory.prototype.startText = function (text, speed) {
    this._text = text;
    this._displayedText = "";
    this._textSpeed = speed || 2;
    this._textTimer = 0;
    this._isComplete = false;
    this._opacity = 255;
    this.refresh();
  };

  Window_EchoMemory.prototype.update = function () {
    Window_Base.prototype.update.call(this);

    if (!this._isComplete && this._text) {
      this._textTimer += this._textSpeed;
      if (this._textTimer >= 1) {
        this._textTimer = 0;
        if (this._displayedText.length < this._text.length) {
          this._displayedText += this._text[this._displayedText.length];
          this.refresh();
        } else {
          this._isComplete = true;
        }
      }
    }
  };

  Window_EchoMemory.prototype.refresh = function () {
    this.contents.clear();
    this.drawTextEx(this._displayedText, 0, 0);
  };

  Window_EchoMemory.prototype.isTextComplete = function () {
    return this._isComplete;
  };

  // Scene_MemoryLog - Memory log accessible from menu
  function Scene_MemoryLog() {
    this.initialize(...arguments);
  }

  Scene_MemoryLog.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_MemoryLog.prototype.constructor = Scene_MemoryLog;

  Scene_MemoryLog.prototype.initialize = function () {
    Scene_MenuBase.prototype.initialize.call(this);
  };

  Scene_MemoryLog.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);
    this.createMemoryListWindow();
    this.createMemoryPreviewWindow();
  };

  Scene_MemoryLog.prototype.createMemoryListWindow = function () {
    const rect = this.memoryListWindowRect();
    this._memoryListWindow = new Window_MemoryList(rect);
    this._memoryListWindow.setHandler("ok", this.onMemoryOk.bind(this));
    this._memoryListWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._memoryListWindow);
  };

  Scene_MemoryLog.prototype.createMemoryPreviewWindow = function () {
    const rect = this.memoryPreviewWindowRect();
    this._memoryPreviewWindow = new Window_MemoryPreview(rect);
    this.addWindow(this._memoryPreviewWindow);
  };

  Scene_MemoryLog.prototype.memoryListWindowRect = function () {
    const wx = 0;
    const wy = this.mainAreaTop();
    const ww = 300;
    const wh = this.mainAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
  };

  Scene_MemoryLog.prototype.memoryPreviewWindowRect = function () {
    const wx = 300;
    const wy = this.mainAreaTop();
    const ww = Graphics.boxWidth - 300;
    const wh = this.mainAreaHeight();
    return new Rectangle(wx, wy, ww, wh);
  };

  Scene_MemoryLog.prototype.onMemoryOk = function () {
    const memoryId = this._memoryListWindow.memoryId();
    if (memoryId > 0) {
      $gameSystem.startMemory(memoryId);
    }
  };

  // Window_MemoryList - List of unlocked memories
  function Window_MemoryList() {
    this.initialize(...arguments);
  }

  Window_MemoryList.prototype = Object.create(Window_Selectable.prototype);
  Window_MemoryList.prototype.constructor = Window_MemoryList;

  Window_MemoryList.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.refresh();
    this.activate();
    this.select(0);
  };

  Window_MemoryList.prototype.maxItems = function () {
    return $gameSystem.getAllUnlockedMemories().length;
  };

  Window_MemoryList.prototype.drawItem = function (index) {
    const rect = this.itemRect(index);
    const memoryId = $gameSystem.getAllUnlockedMemories()[index];
    const memoryData = $gameSystem.getMemoryData(memoryId);

    if (memoryData) {
      this.drawText(memoryData.title, rect.x, rect.y, rect.width, "left");
    }
  };

  Window_MemoryList.prototype.memoryId = function () {
    const index = this.index();
    const memories = $gameSystem.getAllUnlockedMemories();
    return index >= 0 ? memories[index] : 0;
  };

  // Window_MemoryPreview - Preview of selected memory
  function Window_MemoryPreview() {
    this.initialize(...arguments);
  }

  Window_MemoryPreview.prototype = Object.create(Window_Base.prototype);
  Window_MemoryPreview.prototype.constructor = Window_MemoryPreview;

  Window_MemoryPreview.prototype.initialize = function (rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.refresh();
  };

  Window_MemoryPreview.prototype.refresh = function () {
    this.contents.clear();
    this.changeTextColor(this.systemColor());
    this.drawText("Memory Preview", 0, 0, this.innerWidth, "center");
    this.resetTextColor();
    this.drawText(
      "Select a memory to view",
      0,
      this.lineHeight() * 2,
      this.innerWidth,
      "center"
    );
  };

  // Add memory log to menu
  if (showMemoryLogInMenu) {
    const _Scene_Menu_createCommandWindow =
      Scene_Menu.prototype.createCommandWindow;
    Scene_Menu.prototype.createCommandWindow = function () {
      _Scene_Menu_createCommandWindow.call(this);
      this._commandWindow.setHandler(
        "memoryLog",
        this.commandMemoryLog.bind(this)
      );
    };

    const _Window_MenuCommand_addOriginalCommands =
      Window_MenuCommand.prototype.addOriginalCommands;
    Window_MenuCommand.prototype.addOriginalCommands = function () {
      _Window_MenuCommand_addOriginalCommands.call(this);
      this.addCommand("Memory Log", "memoryLog", true);
    };
  }

  Scene_Menu.prototype.commandMemoryLog = function () {
    SceneManager.push(Scene_MemoryLog);
  };
})();
