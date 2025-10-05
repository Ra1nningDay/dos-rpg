//=============================================================================
// DoS_StatusSystem.js - Fatigue, Corruption, and Hope Status System
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Implements custom status parameters: Fatigue, Corruption, and Hope.
 * @author DoS Team
 *
 * @param FatigueVariable
 * @type number
 * @default 3
 * @desc Game variable ID to store Fatigue value (0-100)
 *
 * @param CorruptionVariable
 * @type number
 * @default 4
 * @desc Game variable ID to store Corruption value (0-100)
 *
 * @param HopeVariable
 * @type number
 * @default 5
 * @desc Game variable ID to store Hope value (0-100)
 *
 * @param ShowInStatus
 * @type boolean
 * @default true
 * @desc Show custom status parameters in the status window
 *
 * @param FatiguePenalty
 * @type number
 * @default 50
 * @desc Fatigue threshold where battle penalties begin (0-100)
 *
 * @param CorruptionThreshold
 * @type number
 * @default 80
 * @desc Corruption threshold that affects endings (0-100)
 *
 * @param HopeBonusThreshold
 * @type number
 * @default 70
 * @desc Hope threshold that provides dialogue bonuses (0-100)
 *
 * @param ShowOnMap
 * @type boolean
 * @default true
 * @desc Show status parameters on map (below Day Cycle window)
 *
 * @param MapWindowOpacity
 * @type number
 * @min 0
 * @max 255
 * @default 200
 * @desc Opacity of the map status window (0-255)
 *
 * @param MapWindowPosition
 * @type select
 * @option Top Left
 * @option Top Right
 * @option Bottom Left
 * @option Bottom Right
 * @default Top Right
 * @desc Position of the status window on the map screen
 *
 * @command ChangeFatigue
 * @text Change Fatigue
 * @desc Changes Fatigue by specified amount
 *
 * @arg amount
 * @text Amount
 * @type number
 * @min -100
 * @max 100
 * @default 10
 * @desc Amount to change (positive or negative)
 *
 * @command ChangeCorruption
 * @text Change Corruption
 * @desc Changes Corruption by specified amount
 *
 * @arg amount
 * @text Amount
 * @type number
 * @min -100
 * @max 100
 * @default 10
 * @desc Amount to change (positive or negative)
 *
 * @command ChangeHope
 * @text Change Hope
 * @desc Changes Hope by specified amount
 *
 * @arg amount
 * @text Amount
 * @type number
 * @min -100
 * @max 100
 * @default 10
 * @desc Amount to change (positive or negative)
 *
 * @command SetFatigue
 * @text Set Fatigue
 * @desc Sets Fatigue to specific value
 *
 * @arg value
 * @text Value
 * @type number
 * @min 0
 * @max 100
 * @default 50
 * @desc New value (0-100)
 *
 * @command SetCorruption
 * @text Set Corruption
 * @desc Sets Corruption to specific value
 *
 * @arg value
 * @text Value
 * @type number
 * @min 0
 * @max 100
 * @default 50
 * @desc New value (0-100)
 *
 * @command SetHope
 * @text Set Hope
 * @desc Sets Hope to specific value
 *
 * @arg value
 * @text Value
 * @type number
 * @min 0
 * @max 100
 * @default 50
 * @desc New value (0-100)
 *
 * @command ShowStatusWindow
 * @text Show Status Window
 * @desc Displays current status values in a message
 *
 * @help DoS_StatusSystem.js
 *
 * This plugin implements three custom status parameters:
 * - Fatigue: Physical exhaustion that affects battle performance
 * - Corruption: Curse progression that affects endings and dialogue
 * - Hope: Emotional strength that enables special dialogue options
 *
 * Plugin Commands (use via Event > Plugin Command):
 * - ChangeFatigue : Changes Fatigue by specified amount
 * - ChangeCorruption : Changes Corruption by specified amount
 * - ChangeHope : Changes Hope by specified amount
 * - SetFatigue : Sets Fatigue to specific value
 * - SetCorruption : Sets Corruption to specific value
 * - SetHope : Sets Hope to specific value
 * - ShowStatusWindow : Displays current status values
 *
 * Status Effects:
 * - High Fatigue (>50%): Reduced attack power and defense
 * - High Corruption (>80%): Affects ending and dialogue options
 * - High Hope (>70%): Enables special dialogue options
 */

(() => {
  const pluginName = "DoS_StatusSystem";
  const parameters = PluginManager.parameters(pluginName);
  const fatigueVariable = Number(parameters["FatigueVariable"] || 3);
  const corruptionVariable = Number(parameters["CorruptionVariable"] || 4);
  const hopeVariable = Number(parameters["HopeVariable"] || 5);
  const showInStatus = parameters["ShowInStatus"] === "true";
  const fatiguePenalty = Number(parameters["FatiguePenalty"] || 50);
  const corruptionThreshold = Number(parameters["CorruptionThreshold"] || 80);
  const hopeBonusThreshold = Number(parameters["HopeBonusThreshold"] || 70);
  const showOnMap = parameters["ShowOnMap"] === "true";
  const mapWindowOpacity = Number(parameters["MapWindowOpacity"] || 200);
  const mapWindowPosition = String(
    parameters["MapWindowPosition"] || "Top Right"
  );

  // Register Plugin Commands for RPG Maker MZ
  PluginManager.registerCommand(pluginName, "ChangeFatigue", (args) => {
    const amount = Number(args.amount || 0);
    $gameSystem.changeFatigue(amount);
  });

  PluginManager.registerCommand(pluginName, "ChangeCorruption", (args) => {
    const amount = Number(args.amount || 0);
    $gameSystem.changeCorruption(amount);
  });

  PluginManager.registerCommand(pluginName, "ChangeHope", (args) => {
    const amount = Number(args.amount || 0);
    $gameSystem.changeHope(amount);
  });

  PluginManager.registerCommand(pluginName, "SetFatigue", (args) => {
    const value = Number(args.value || 0);
    $gameSystem.setFatigue(value);
  });

  PluginManager.registerCommand(pluginName, "SetCorruption", (args) => {
    const value = Number(args.value || 0);
    $gameSystem.setCorruption(value);
  });

  PluginManager.registerCommand(pluginName, "SetHope", (args) => {
    const value = Number(args.value || 0);
    $gameSystem.setHope(value);
  });

  PluginManager.registerCommand(pluginName, "ShowStatusWindow", (args) => {
    $gameSystem.showStatusWindow();
  });

  // Legacy Plugin Commands support (for MV compatibility)
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "ChangeFatigue") {
      const amount = Number(args[0]);
      $gameSystem.changeFatigue(amount);
    } else if (command === "ChangeCorruption") {
      const amount = Number(args[0]);
      $gameSystem.changeCorruption(amount);
    } else if (command === "ChangeHope") {
      const amount = Number(args[0]);
      $gameSystem.changeHope(amount);
    } else if (command === "SetFatigue") {
      const value = Number(args[0]);
      $gameSystem.setFatigue(value);
    } else if (command === "SetCorruption") {
      const value = Number(args[0]);
      $gameSystem.setCorruption(value);
    } else if (command === "SetHope") {
      const value = Number(args[0]);
      $gameSystem.setHope(value);
    } else if (command === "ShowStatusWindow") {
      $gameSystem.showStatusWindow();
    }
  };

  // Extend Game_System to handle status parameters
  Game_System.prototype.changeFatigue = function (amount) {
    const current = $gameVariables.value(fatigueVariable);
    const newValue = Math.max(0, Math.min(100, current + amount));
    $gameVariables.setValue(fatigueVariable, newValue);
    this.onStatusChange("fatigue", newValue);
  };

  Game_System.prototype.changeCorruption = function (amount) {
    const current = $gameVariables.value(corruptionVariable);
    const newValue = Math.max(0, Math.min(100, current + amount));
    $gameVariables.setValue(corruptionVariable, newValue);
    this.onStatusChange("corruption", newValue);
  };

  Game_System.prototype.changeHope = function (amount) {
    const current = $gameVariables.value(hopeVariable);
    const newValue = Math.max(0, Math.min(100, current + amount));
    $gameVariables.setValue(hopeVariable, newValue);
    this.onStatusChange("hope", newValue);
  };

  Game_System.prototype.setFatigue = function (value) {
    const newValue = Math.max(0, Math.min(100, value));
    $gameVariables.setValue(fatigueVariable, newValue);
    this.onStatusChange("fatigue", newValue);
  };

  Game_System.prototype.setCorruption = function (value) {
    const newValue = Math.max(0, Math.min(100, value));
    $gameVariables.setValue(corruptionVariable, newValue);
    this.onStatusChange("corruption", newValue);
  };

  Game_System.prototype.setHope = function (value) {
    const newValue = Math.max(0, Math.min(100, value));
    $gameVariables.setValue(hopeVariable, newValue);
    this.onStatusChange("hope", newValue);
  };

  Game_System.prototype.getFatigue = function () {
    return $gameVariables.value(fatigueVariable);
  };

  Game_System.prototype.getCorruption = function () {
    return $gameVariables.value(corruptionVariable);
  };

  Game_System.prototype.getHope = function () {
    return $gameVariables.value(hopeVariable);
  };

  Game_System.prototype.onStatusChange = function (type, value) {
    // Handle status change effects
    if (type === "fatigue" && value >= fatiguePenalty) {
      $gameMessage.add("You're feeling exhausted...");
    }
    if (type === "corruption" && value >= corruptionThreshold) {
      $gameMessage.add("The curse's influence grows stronger...");
    }
    if (type === "hope" && value >= hopeBonusThreshold) {
      $gameMessage.add("You feel determined to continue!");
    }
  };

  Game_System.prototype.showStatusWindow = function () {
    const fatigue = this.getFatigue();
    const corruption = this.getCorruption();
    const hope = this.getHope();

    $gameMessage.add("=== Status ===");
    $gameMessage.add("Fatigue: " + fatigue + "/100");
    $gameMessage.add("Corruption: " + corruption + "/100");
    $gameMessage.add("Hope: " + hope + "/100");
  };

  // Status effect methods
  Game_System.prototype.hasFatiguePenalty = function () {
    return this.getFatigue() >= fatiguePenalty;
  };

  Game_System.prototype.hasHighCorruption = function () {
    return this.getCorruption() >= corruptionThreshold;
  };

  Game_System.prototype.hasHopeBonus = function () {
    return this.getHope() >= hopeBonusThreshold;
  };

  Game_System.prototype.getFatiguePenaltyRate = function () {
    const fatigue = this.getFatigue();
    if (fatigue < fatiguePenalty) return 1.0;
    return 1.0 - ((fatigue - fatiguePenalty) / (100 - fatiguePenalty)) * 0.5;
  };

  // Extend Game_Actor to apply fatigue penalties
  const _Game_Actor_param = Game_Actor.prototype.param;
  Game_Actor.prototype.param = function (paramId) {
    const value = _Game_Actor_param.call(this, paramId);

    // Apply fatigue penalty to attack and defense
    if ($gameSystem.hasFatiguePenalty()) {
      const penaltyRate = $gameSystem.getFatiguePenaltyRate();
      if (paramId === 2 || paramId === 3) {
        // Attack or Defense
        return Math.floor(value * penaltyRate);
      }
    }

    return value;
  };

  // Extend Window_Status to show custom parameters
  if (showInStatus) {
    const _Window_Status_refresh = Window_Status.prototype.refresh;
    Window_Status.prototype.refresh = function () {
      _Window_Status_refresh.call(this);
      if (this._actor) {
        this.drawCustomStatus();
      }
    };

    Window_Status.prototype.drawCustomStatus = function () {
      // แสดงด้านล่างสุดของหน้าจอ
      const lineHeight = this.lineHeight();
      const baseY = Graphics.boxHeight - 280; // 280px จากล่างสุด
      const x = 20;

      this.changeTextColor(this.systemColor());
      this.drawText(
        "Status Parameters",
        x,
        baseY,
        this.innerWidth - x - this.padding,
        "left"
      );

      const fatigue = $gameSystem.getFatigue();
      const corruption = $gameSystem.getCorruption();
      const hope = $gameSystem.getHope();

      // Draw Fatigue
      this.resetTextColor();
      this.drawText("Fatigue:", x, baseY + this.lineHeight(), 120, "left");
      this.drawCustomGauge(
        x + 120,
        baseY + this.lineHeight(),
        200,
        fatigue / 100,
        ColorManager.normalColor(),
        ColorManager.normalColor()
      );
      this.drawText(
        fatigue + "/100",
        x + 325,
        baseY + this.lineHeight(),
        60,
        "right"
      );

      // Draw Corruption
      this.resetTextColor();
      this.drawText(
        "Corruption:",
        x,
        baseY + this.lineHeight() * 2,
        120,
        "left"
      );
      this.drawCustomGauge(
        x + 120,
        baseY + this.lineHeight() * 2,
        200,
        corruption / 100,
        ColorManager.textColor(2),
        ColorManager.textColor(10)
      );
      this.drawText(
        corruption + "/100",
        x + 325,
        baseY + this.lineHeight() * 2,
        60,
        "right"
      );

      // Draw Hope
      this.resetTextColor();
      this.drawText("Hope:", x, baseY + this.lineHeight() * 3, 120, "left");
      this.drawCustomGauge(
        x + 120,
        baseY + this.lineHeight() * 3,
        200,
        hope / 100,
        ColorManager.textColor(23),
        ColorManager.textColor(24)
      );
      this.drawText(
        hope + "/100",
        x + 325,
        baseY + this.lineHeight() * 3,
        60,
        "right"
      );

      // Draw status effects
      this.drawStatusEffects(x, baseY + this.lineHeight() * 4);
    };

    Window_Status.prototype.drawCustomGauge = function (
      x,
      y,
      width,
      rate,
      color1,
      color2
    ) {
      const gaugeY = y + this.lineHeight() - 8;
      const gaugeHeight = 6;
      const fillW = Math.floor(width * rate);

      // Draw gauge background
      this.contents.fillRect(x, gaugeY, width, gaugeHeight, "#000000");

      // Draw gauge fill with gradient
      const context = this.contents.context;
      const gradient = context.createLinearGradient(
        x,
        gaugeY,
        x + fillW,
        gaugeY
      );
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      context.fillStyle = gradient;
      context.fillRect(x, gaugeY, fillW, gaugeHeight);
    };

    Window_Status.prototype.drawStatusEffects = function (x, y) {
      this.resetTextColor();

      if ($gameSystem.hasFatiguePenalty()) {
        this.changeTextColor(ColorManager.deathColor());
        this.drawText(
          "• Exhausted (Battle Penalties)",
          x,
          y,
          this.innerWidth - x - this.padding,
          "left"
        );
        y += this.lineHeight();
      }

      if ($gameSystem.hasHighCorruption()) {
        this.changeTextColor(ColorManager.crisisColor());
        this.drawText(
          "• Heavily Corrupted",
          x,
          y,
          this.innerWidth - x - this.padding,
          "left"
        );
        y += this.lineHeight();
      }

      if ($gameSystem.hasHopeBonus()) {
        this.changeTextColor(ColorManager.powerUpColor());
        this.drawText(
          "• High Hope (Special Options)",
          x,
          y,
          this.innerWidth - x - this.padding,
          "left"
        );
      }
    };
  }

  // Initialize status values on new game
  const _DataManager_setupNewGame = DataManager.setupNewGame;
  DataManager.setupNewGame = function () {
    _DataManager_setupNewGame.call(this);
    $gameVariables.setValue(fatigueVariable, 0);
    $gameVariables.setValue(corruptionVariable, 0);
    $gameVariables.setValue(hopeVariable, 50); // Start with moderate hope
  };

  // Add Status Parameters option to Main Menu
  const _Window_MenuCommand_addOriginalCommands =
    Window_MenuCommand.prototype.addOriginalCommands;
  Window_MenuCommand.prototype.addOriginalCommands = function () {
    _Window_MenuCommand_addOriginalCommands.call(this);
    this.addCommand("Status Params", "statusParams", true);
  };

  const _Scene_Menu_createCommandWindow =
    Scene_Menu.prototype.createCommandWindow;
  Scene_Menu.prototype.createCommandWindow = function () {
    _Scene_Menu_createCommandWindow.call(this);
    this._commandWindow.setHandler(
      "statusParams",
      this.commandStatusParams.bind(this)
    );
  };

  Scene_Menu.prototype.commandStatusParams = function () {
    SceneManager.push(Scene_StatusParams);
  };

  // Create Scene_StatusParams
  function Scene_StatusParams() {
    this.initialize(...arguments);
  }

  Scene_StatusParams.prototype = Object.create(Scene_MenuBase.prototype);
  Scene_StatusParams.prototype.constructor = Scene_StatusParams;

  Scene_StatusParams.prototype.initialize = function () {
    Scene_MenuBase.prototype.initialize.call(this);
  };

  Scene_StatusParams.prototype.create = function () {
    Scene_MenuBase.prototype.create.call(this);
    this.createStatusParamsWindow();
  };

  Scene_StatusParams.prototype.createStatusParamsWindow = function () {
    const rect = this.statusParamsWindowRect();
    this._statusParamsWindow = new Window_StatusParams(rect);
    this._statusParamsWindow.setHandler("cancel", this.popScene.bind(this));
    this.addWindow(this._statusParamsWindow);
  };

  Scene_StatusParams.prototype.statusParamsWindowRect = function () {
    const ww = Graphics.boxWidth;
    const wh = Graphics.boxHeight;
    const wx = 0;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
  };

  // ===== UI Palette & Icons (Global scope for all windows) =====
  const DoS_UI = {
    panelBg: "rgba(201, 204, 216, 0.7)",
    panelBorder: "rgba(255,255,255,0.08)",
    sectionLine: "rgba(255,255,255,0.12)",
    textDim: ColorManager.dimColor1(),
    // สีเกจ (ซ้าย -> ขวา)
    fatigue: ["#F6D365", "#F3A953"], // เหลือง -> ส้ม
    corruption: ["#8E2DE2", "#FF0844"], // ม่วง -> แดง
    hope: ["#56CCF2", "#6FCF97"], // ฟ้า -> เขียว
    // ไอคอนจาก IconSet (ปรับ index ตามโปรเจกต์)
    icon: { fatigue: 191, corruption: 18, hope: 87 },
  };

  // Create Window_StatusParams
  function Window_StatusParams() {
    this.initialize(...arguments);
  }

  Window_StatusParams.prototype = Object.create(Window_Selectable.prototype);
  Window_StatusParams.prototype.constructor = Window_StatusParams;

  Window_StatusParams.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.activate();
    this.refresh();
  };

  Window_StatusParams.prototype.refresh = function () {
    this.contents.clear();
    this.drawStatusParameters();
  };

  // ===== helper: วาด panel โปร่งใส + กรอบบาง =====
  Window_StatusParams.prototype.drawPanel = function (x, y, w, h) {
    const c = this.contents.context;
    c.save();
    // พื้นหลัง
    c.fillStyle = DoS_UI.panelBg;
    c.fillRect(x, y, w, h);
    // กรอบ
    c.strokeStyle = DoS_UI.panelBorder;
    c.lineWidth = 1;
    c.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    c.restore();
  };

  // ===== helper: เส้นคั่นหัวข้อ =====
  Window_StatusParams.prototype.drawSectionTitle = function (text, y) {
    const pad = 40;
    this.changeTextColor(ColorManager.systemColor());
    this.contents.fontBold = true;
    this.drawText(text, pad, y, this.innerWidth - pad * 2, "left");
    this.contents.fontBold = false;
    y += this.lineHeight() - 6;
    const c = this.contents.context;
    c.save();
    c.fillStyle = DoS_UI.sectionLine;
    c.fillRect(pad, y, this.innerWidth - pad * 2, 2);
    c.restore();
    return y + 14;
  };

  // ===== helper: เกจมีกรอบ + ตัวเลข =====
  Window_StatusParams.prototype.drawGaugeFancy = function (
    x,
    y,
    w,
    rate,
    [c1, c2]
  ) {
    const h = 12;
    const fillW = Math.floor(w * Math.max(0, Math.min(1, rate)));
    // พื้นหลัง
    this.contents.fillRect(x, y, w, h, ColorManager.gaugeBackColor());
    // เติม
    const ctx = this.contents.context;
    ctx.save();
    const grad = ctx.createLinearGradient(x, y, x + fillW, y);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, fillW, h);
    // กรอบบาง
    ctx.strokeStyle = "rgba(0,0,0,0.35)";
    ctx.lineWidth = 1;
    ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1);
    ctx.restore();
  };

  // ===== helper: แสดงบรรทัดหัวข้อ + ไอคอน + ค่า =====
  Window_StatusParams.prototype.drawRow = function (
    { label, icon, value, colors, desc },
    y
  ) {
    const pad = 40;
    const innerPad = 16; // <== padding ภายใน panel
    const rowH = this.lineHeight() * 2 + 36;

    // bg panel
    this.drawPanel(pad, y, this.innerWidth - pad * 2, rowH);

    // Icon and name
    let xx = pad + innerPad + 14;
    const baseY = y + innerPad;

    if (icon != null) this.drawIcon(icon, xx, baseY);
    xx += icon != null ? 40 : 0;

    this.changeTextColor(ColorManager.systemColor());
    this.contents.fontSize = 24;
    this.contents.fontBold = true;
    this.drawText(label, xx, baseY, 240, "left");
    this.contents.fontBold = false;
    this.contents.fontSize = 20;

    // ค่าเลขและเกจ
    const numW = 120;
    const gaugeW = this.innerWidth - pad * 2 - (xx - pad) - numW - innerPad * 2;
    const gaugeX = xx;
    const gaugeY = baseY + this.lineHeight() - 2;

    this.resetTextColor();
    this.drawGaugeFancy(gaugeX, gaugeY, gaugeW, value / 100, colors);
    this.changeTextColor(ColorManager.normalColor());
    this.drawText(
      `${Math.round(value)} / 100`,
      gaugeX + gaugeW + 12,
      baseY,
      numW,
      "right"
    );

    // คำอธิบาย
    this.changeTextColor(DoS_UI.textDim);
    this.contents.fontSize = 18;
    this.drawText(
      desc,
      xx,
      gaugeY + 18,
      this.innerWidth - pad * 2 - (xx - pad) - innerPad,
      "left"
    );
    this.resetTextColor();
    this.contents.fontSize = 20;

    return y + rowH + 14;
  };

  Window_StatusParams.prototype.initialize = function (rect) {
    Window_Selectable.prototype.initialize.call(this, rect);
    this.activate();
    // ค่าแสดงผล (ไหลไปหาค่าจริง)
    this._dispFatigue = $gameSystem.getFatigue();
    this._dispCorruption = $gameSystem.getCorruption();
    this._dispHope = $gameSystem.getHope();
    this.refresh();
  };

  Window_StatusParams.prototype.maxItems = function () {
    return 1;
  };

  Window_StatusParams.prototype.update = function () {
    Window_Selectable.prototype.update.call(this);
    const lerp = (a, b) => a + (b - a) * 0.15;
    const f = $gameSystem.getFatigue();
    const c = $gameSystem.getCorruption();
    const h = $gameSystem.getHope();

    const prev = `${this._dispFatigue.toFixed(
      1
    )}|${this._dispCorruption.toFixed(1)}|${this._dispHope.toFixed(1)}`;
    this._dispFatigue = lerp(this._dispFatigue, f);
    this._dispCorruption = lerp(this._dispCorruption, c);
    this._dispHope = lerp(this._dispHope, h);
    const now = `${this._dispFatigue.toFixed(1)}|${this._dispCorruption.toFixed(
      1
    )}|${this._dispHope.toFixed(1)}`;

    if (prev !== now) this.refresh();
  };

  // ===== main renderer =====
  Window_StatusParams.prototype.refresh = function () {
    this.contents.clear();
    this.drawStatusParameters();
  };

  Window_StatusParams.prototype.drawStatusParameters = function () {
    const pad = 40;
    let y = pad;

    y = this.drawSectionTitle("Character Status Parameters", y + 2);

    // แถวสถานะทั้งสาม
    y = this.drawRow(
      {
        label: "Fatigue",
        icon: DoS_UI.icon.fatigue,
        value: this._dispFatigue,
        colors: DoS_UI.fatigue,
        desc: "Physical exhaustion affecting battle performance",
      },
      y + 8
    );

    y = this.drawRow(
      {
        label: "Corruption",
        icon: DoS_UI.icon.corruption,
        value: this._dispCorruption,
        colors: DoS_UI.corruption,
        desc: "Curse progression affecting story and dialogue",
      },
      y
    );

    y = this.drawRow(
      {
        label: "Hope",
        icon: DoS_UI.icon.hope,
        value: this._dispHope,
        colors: DoS_UI.hope,
        desc: "Emotional strength enabling special options",
      },
      y
    );

    // Effects
    y = this.drawSectionTitle("Current Effects", y + 4);
    const line = (txt, color) => {
      this.changeTextColor(color);
      this.drawText(txt, pad + 12, y, this.innerWidth - pad * 2, "left");
      this.resetTextColor();
      y += this.lineHeight();
    };

    const hasF = $gameSystem.hasFatiguePenalty();
    const hasC = $gameSystem.hasHighCorruption();
    const hasH = $gameSystem.hasHopeBonus();

    if (hasF)
      line("• Exhausted – Reduced attack & defense", ColorManager.deathColor());
    if (hasC)
      line(
        "• Heavily Corrupted – Story outcomes affected",
        ColorManager.crisisColor()
      );
    if (hasH)
      line(
        "• High Hope – Special dialogue options available",
        ColorManager.powerUpColor()
      );

    if (!hasF && !hasC && !hasH) {
      this.changeTextColor(ColorManager.normalColor());
      this.drawText(
        "No special effects active",
        pad + 12,
        y,
        this.innerWidth - pad * 2,
        "left"
      );
      this.resetTextColor();
    }
  };

  // Add Status Window on Map (below Day Cycle)
  if (showOnMap) {
    const _Scene_Map_createDisplayObjects =
      Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function () {
      _Scene_Map_createDisplayObjects.call(this);
      this.createMapStatusWindow();
    };

    Scene_Map.prototype.createMapStatusWindow = function () {
      const rect = this.mapStatusWindowRect();
      this._mapStatusWindow = new Window_MapStatus(rect);
      this.addWindow(this._mapStatusWindow);
    };

    Scene_Map.prototype.mapStatusWindowRect = function () {
      const ww = 155; // Same width as Day Window
      const wh = 145; // Height for 3 gauges
      let wx, wy;

      // Read parameter dynamically to ensure it updates when changed
      const currentPosition = String(
        PluginManager.parameters("DoS_StatusSystem")["MapWindowPosition"] ||
          "Top Right"
      );

      switch (currentPosition) {
        case "Top Left":
          wx = 0;
          wy = 65; // Below Day Cycle window
          break;
        case "Top Right":
          wx = Graphics.boxWidth - ww;
          wy = 60; // Below Day Cycle window
          break;
        case "Bottom Left":
          wx = 0;
          wy = Graphics.boxHeight - wh;
          break;
        case "Bottom Right":
          wx = Graphics.boxWidth - ww;
          wy = Graphics.boxHeight - wh;
          break;
        default:
          wx = Graphics.boxWidth - ww;
          wy = 60; // Below Day Cycle window
      }

      return new Rectangle(wx, wy, ww, wh);
    };

    // Update window position dynamically
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
      _Scene_Map_update.call(this);
      if (this._mapStatusWindow) {
        // Update position every frame in case resolution changes
        const rect = this.mapStatusWindowRect();
        if (
          this._mapStatusWindow.x !== rect.x ||
          this._mapStatusWindow.y !== rect.y
        ) {
          this._mapStatusWindow.move(rect.x, rect.y, rect.width, rect.height);
        }

        // Update every 60 frames (1 second)
        if (Graphics.frameCount % 60 === 0) {
          this._mapStatusWindow.refresh();
        }
      }
    };

    // Create Window_MapStatus
    function Window_MapStatus() {
      this.initialize(...arguments);
    }

    Window_MapStatus.prototype = Object.create(Window_Base.prototype);
    Window_MapStatus.prototype.constructor = Window_MapStatus;

    Window_MapStatus.prototype.initialize = function (rect) {
      Window_Base.prototype.initialize.call(this, rect);
      // Read opacity dynamically
      const currentOpacity = Number(
        PluginManager.parameters("DoS_StatusSystem")["MapWindowOpacity"] || 200
      );
      this.opacity = currentOpacity;
      this.refresh();
    };

    Window_MapStatus.prototype.refresh = function () {
      if (!$gameSystem) return;

      const fatigue = $gameSystem.getFatigue();
      const corruption = $gameSystem.getCorruption();
      const hope = $gameSystem.getHope();

      this.contents.clear();

      const padding = 6;
      let y = padding;
      const x = padding;
      const gaugeW = this.innerWidth - padding * 2 - 40;

      // Draw Fatigue
      this.changeTextColor(ColorManager.systemColor());
      this.drawIcon(191, x, y, 16, "left");
      this.resetTextColor();
      this.drawText(fatigue + "/100", x + 40, y, 80, "left");
      y += this.lineHeight();

      // Draw Corruption
      this.changeTextColor(ColorManager.systemColor());
      this.drawIcon(18, x, y, 16, "left");
      this.resetTextColor();
      this.drawText(corruption + "/100", x + 40, y, 80, "left");
      y += this.lineHeight();

      // Draw Hope
      this.changeTextColor(ColorManager.systemColor());
      this.drawIcon(87, x, y, 16, "left");
      this.resetTextColor();
      this.drawText(hope + "/100", x + 40, y, 80, "left");
    };

    Window_MapStatus.prototype.drawMapGauge = function (
      x,
      y,
      width,
      rate,
      color1,
      color2
    ) {
      const gaugeY = y + this.lineHeight() - 10;
      const gaugeHeight = 8;
      const fillW = Math.floor(width * rate);

      // Draw gauge background
      this.contents.fillRect(
        x,
        gaugeY,
        width,
        gaugeHeight,
        ColorManager.gaugeBackColor()
      );

      // Draw gauge fill with gradient
      const context = this.contents.context;
      context.save();
      const gradient = context.createLinearGradient(
        x,
        gaugeY,
        x + fillW,
        gaugeY
      );
      gradient.addColorStop(0, color1);
      gradient.addColorStop(1, color2);
      context.fillStyle = gradient;
      context.fillRect(x, gaugeY, fillW, gaugeHeight);

      // Border
      context.strokeStyle = "rgba(0,0,0,0.3)";
      context.lineWidth = 1;
      context.strokeRect(x + 0.5, gaugeY + 0.5, width - 1, gaugeHeight - 1);
      context.restore();
    };
  }
})();
