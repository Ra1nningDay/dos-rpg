//=============================================================================
// DoS_TimeSystem.js - Time Management & Ending Conditions
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Implements time as a resource and manages the three endings.
 * @author DoS Team
 *
 * @param TimeVariable
 * @type number
 * @default 9
 * @desc Game variable ID to store remaining time units
 *
 * @param MaxTimePerDay
 * @type number
 * @default 10
 * @desc Maximum time units available per day
 *
 * @param TrueEndingSwitch
 * @type number
 * @default 31
 * @desc Switch ID to trigger True Ending
 *
 * @param GoodEndingSwitch
 * @type number
 * @default 32
 * @desc Switch ID to trigger Good Ending
 *
 * @param BadEndingSwitch
 * @type number
 * @default 33
 * @desc Switch ID to trigger Bad Ending
 *
 * @param ShowTimeInMenu
 * @type boolean
 * @default true
 * @desc Show remaining time in the menu
 *
 * @param TimeWarningThreshold
 * @type number
 * @default 3
 * @desc Show warning when remaining time is below this value
 *
 * @help DoS_TimeSystem.js
 *
 * This plugin implements time as a resource and manages the three endings
 * based on player actions and status parameters.
 *
 * Plugin Commands:
 * - ConsumeTime [amount] : Consumes specified amount of time
 * - AddTime [amount] : Adds specified amount of time
 * - SetTime [amount] : Sets time to specific amount
 * - ResetDailyTime : Resets time to maximum for new day
 * - EvaluateEnding : Evaluates and triggers appropriate ending
 * - ShowTimeStatus : Shows current time status
 *
 * Time Costs (configured by events):
 * - Talking to sister: 1 time unit
 * - Training/Preparation: 2-3 time units
 * - Exploring tower: 4-5 time units
 * - Resting: 1 time unit (recovers fatigue)
 *
 * Ending Conditions:
 * True Ending:
 * - Complete the tower within 20 days
 * - Hope > 70
 * - Corruption < 30
 * - Sister relationship > 80
 * - At least 15 memories unlocked
 *
 * Good Ending:
 * - Complete the tower within 30 days
 * - Hope > 50
 * - Corruption < 60
 * - Sister relationship > 60
 * - At least 10 memories unlocked
 *
 * Bad Ending:
 * - Run out of days (30 days pass)
 * - Corruption > 80
 * - OR specific bad ending events trigger
 */

(() => {
  const pluginName = "DoS_TimeSystem";
  const parameters = PluginManager.parameters(pluginName);
  const timeVariable = Number(parameters["TimeVariable"] || 9);
  const maxTimePerDay = Number(parameters["MaxTimePerDay"] || 10);
  const trueEndingSwitch = Number(parameters["TrueEndingSwitch"] || 31);
  const goodEndingSwitch = Number(parameters["GoodEndingSwitch"] || 32);
  const badEndingSwitch = Number(parameters["BadEndingSwitch"] || 33);
  const showTimeInMenu = parameters["ShowTimeInMenu"] === "true";
  const timeWarningThreshold = Number(parameters["TimeWarningThreshold"] || 3);

  // Plugin Commands
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "ConsumeTime") {
      const amount = Number(args[0]);
      $gameSystem.consumeTime(amount);
    } else if (command === "AddTime") {
      const amount = Number(args[0]);
      $gameSystem.addTime(amount);
    } else if (command === "SetTime") {
      const amount = Number(args[0]);
      $gameSystem.setTime(amount);
    } else if (command === "ResetDailyTime") {
      $gameSystem.resetDailyTime();
    } else if (command === "EvaluateEnding") {
      $gameSystem.evaluateEnding();
    } else if (command === "ShowTimeStatus") {
      $gameSystem.showTimeStatus();
    }
  };

  // Extend Game_System to handle time management
  Game_System.prototype.consumeTime = function (amount) {
    const currentTime = $gameVariables.value(timeVariable);
    const newTime = Math.max(0, currentTime - amount);
    $gameVariables.setValue(timeVariable, newTime);

    this.onTimeChange(newTime);

    // Check if time ran out
    if (newTime === 0) {
      this.onTimeDepleted();
    }
  };

  Game_System.prototype.addTime = function (amount) {
    const currentTime = $gameVariables.value(timeVariable);
    const newTime = Math.min(maxTimePerDay, currentTime + amount);
    $gameVariables.setValue(timeVariable, newTime);
    this.onTimeChange(newTime);
  };

  Game_System.prototype.setTime = function (amount) {
    const newTime = Math.max(0, Math.min(maxTimePerDay, amount));
    $gameVariables.setValue(timeVariable, newTime);
    this.onTimeChange(newTime);
  };

  Game_System.prototype.resetDailyTime = function () {
    $gameVariables.setValue(timeVariable, maxTimePerDay);
    this.onTimeChange(maxTimePerDay);
  };

  Game_System.prototype.getRemainingTime = function () {
    return $gameVariables.value(timeVariable);
  };

  Game_System.prototype.getMaxTime = function () {
    return maxTimePerDay;
  };

  Game_System.prototype.getTimePercentage = function () {
    return this.getRemainingTime() / this.getMaxTime();
  };

  Game_System.prototype.onTimeChange = function (newTime) {
    // Handle time change effects
    if (newTime <= timeWarningThreshold && newTime > 0) {
      $gameMessage.add("Time is running short for today...");
    }

    // Update time display if visible
    if (SceneManager._scene && SceneManager._scene._timeWindow) {
      SceneManager._scene._timeWindow.refresh();
    }
  };

  Game_System.prototype.onTimeDepleted = function () {
    $gameMessage.add("You've run out of time for today...");
    // Advance to next phase or day
    const currentPhase = $gameSystem.getCurrentPhase();
    if (currentPhase === 0) {
      // Morning
      $gameSystem.setDayPhase(1); // Move to Day phase
      this.resetDailyTime();
    } else if (currentPhase === 1) {
      // Day
      $gameSystem.setDayPhase(2); // Move to Evening phase
      this.resetDailyTime();
    } else {
      // Evening
      $gameSystem.advanceDay();
    }
  };

  Game_System.prototype.showTimeStatus = function () {
    const current = this.getRemainingTime();
    const max = this.getMaxTime();
    $gameMessage.add("Time: " + current + "/" + max + " units");
  };

  // Ending evaluation system
  Game_System.prototype.evaluateEnding = function () {
    const currentDay = $gameSystem.getCurrentDay();
    const hope = $gameSystem.getHope();
    const corruption = $gameSystem.getCorruption();
    const sisterRelation = $gameSystem.getRelationship(0);
    const unlockedMemories = $gameSystem.getAllUnlockedMemories().length;

    // Check True Ending conditions
    if (
      currentDay <= 20 &&
      hope > 70 &&
      corruption < 30 &&
      sisterRelation > 80 &&
      unlockedMemories >= 15
    ) {
      this.triggerEnding(trueEndingSwitch, "True Ending");
      return;
    }

    // Check Good Ending conditions
    if (
      currentDay <= 30 &&
      hope > 50 &&
      corruption < 60 &&
      sisterRelation > 60 &&
      unlockedMemories >= 10
    ) {
      this.triggerEnding(goodEndingSwitch, "Good Ending");
      return;
    }

    // Default to Bad Ending
    this.triggerEnding(badEndingSwitch, "Bad Ending");
  };

  Game_System.prototype.triggerEnding = function (switchId, endingName) {
    // Turn on the appropriate ending switch
    $gameSwitches.setValue(switchId, true);

    // Trigger ending common event
    $gameTemp.reserveCommonEvent(switchId);

    $gameMessage.add(endingName + " achieved!");
  };

  // Extend Scene_Map to show time display
  const _Scene_Map_createDisplayObjects =
    Scene_Map.prototype.createDisplayObjects;
  Scene_Map.prototype.createDisplayObjects = function () {
    _Scene_Map_createDisplayObjects.call(this);
    if (showTimeInMenu) {
      this.createTimeWindow();
    }
  };

  Scene_Map.prototype.createTimeWindow = function () {
    const rect = this.timeWindowRect();
    this._timeWindow = new Window_TimeDisplay(rect);
    this.addWindow(this._timeWindow);
  };

  Scene_Map.prototype.timeWindowRect = function () {
    const ww = 200;
    const wh = 60;
    const wx = Graphics.boxWidth - ww;
    const wy = 0;
    return new Rectangle(wx, wy, ww, wh);
  };

  // Window_TimeDisplay - Shows remaining time on map
  function Window_TimeDisplay() {
    this.initialize(...arguments);
  }

  Window_TimeDisplay.prototype = Object.create(Window_Base.prototype);
  Window_TimeDisplay.prototype.constructor = Window_TimeDisplay;

  Window_TimeDisplay.prototype.initialize = function (rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.refresh();
  };

  Window_TimeDisplay.prototype.refresh = function () {
    const current = $gameSystem.getRemainingTime();
    const max = $gameSystem.getMaxTime();
    const percentage = $gameSystem.getTimePercentage();

    this.contents.clear();
    this.changeTextColor(this.systemColor());
    this.drawText("Time", 0, 0, this.innerWidth, "center");
    this.resetTextColor();

    // Draw time gauge
    this.drawGauge(
      0,
      this.lineHeight(),
      this.innerWidth - 40,
      percentage,
      this.getTimeGaugeColor()
    );
    this.drawText(
      current + "/" + max,
      this.innerWidth - 40,
      this.lineHeight(),
      40,
      "right"
    );

    // Warning text if time is low
    if (current <= timeWarningThreshold && current > 0) {
      this.changeTextColor(ColorManager.crisisColor());
      this.drawText(
        "Low Time!",
        0,
        this.lineHeight() * 2,
        this.innerWidth,
        "center"
      );
    }
  };

  Window_TimeDisplay.prototype.getTimeGaugeColor = function () {
    const percentage = $gameSystem.getTimePercentage();
    if (percentage <= 0.3) {
      return ColorManager.crisisColor();
    } else if (percentage <= 0.6) {
      return ColorManager.powerDownColor();
    } else {
      return ColorManager.normalColor();
    }
  };

  // Update time window when time changes
  const _Scene_Map_update = Scene_Map.prototype.update;
  Scene_Map.prototype.update = function () {
    _Scene_Map_update.call(this);
    if (this._timeWindow) {
      // Update time window every second
      if (Graphics.frameCount % 60 === 0) {
        this._timeWindow.refresh();
      }
    }
  };

  // Extend Scene_Menu to show time status
  if (showTimeInMenu) {
    const _Scene_Menu_createStatusWindow =
      Scene_Menu.prototype.createStatusWindow;
    Scene_Menu.prototype.createStatusWindow = function () {
      _Scene_Menu_createStatusWindow.call(this);
      this.createTimeStatusWindow();
    };

    Scene_Menu.prototype.createTimeStatusWindow = function () {
      const rect = this.timeStatusWindowRect();
      this._timeStatusWindow = new Window_TimeStatus(rect);
      this.addWindow(this._timeStatusWindow);
    };

    Scene_Menu.prototype.timeStatusWindowRect = function () {
      const ww = 200;
      const wh = 90;
      const wx = Graphics.boxWidth - ww;
      const wy = this.mainAreaTop();
      return new Rectangle(wx, wy, ww, wh);
    };
  }

  // Window_TimeStatus - Time status in menu
  function Window_TimeStatus() {
    this.initialize(...arguments);
  }

  Window_TimeStatus.prototype = Object.create(Window_Base.prototype);
  Window_TimeStatus.prototype.constructor = Window_TimeStatus;

  Window_TimeStatus.prototype.initialize = function (rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.refresh();
  };

  Window_TimeStatus.prototype.refresh = function () {
    const current = $gameSystem.getRemainingTime();
    const max = $gameSystem.getMaxTime();
    const percentage = $gameSystem.getTimePercentage();

    this.contents.clear();
    this.changeTextColor(this.systemColor());
    this.drawText("Time Status", 0, 0, this.innerWidth, "center");
    this.resetTextColor();

    this.drawText("Remaining:", 0, this.lineHeight(), this.innerWidth, "left");
    this.drawText(
      current + "/" + max,
      0,
      this.lineHeight() * 2,
      this.innerWidth,
      "center"
    );

    this.drawGauge(
      0,
      this.lineHeight() * 3,
      this.innerWidth - 4,
      percentage,
      this.getTimeGaugeColor()
    );
  };

  Window_TimeStatus.prototype.getTimeGaugeColor = function () {
    const percentage = $gameSystem.getTimePercentage();
    if (percentage <= 0.3) {
      return ColorManager.crisisColor();
    } else if (percentage <= 0.6) {
      return ColorManager.powerDownColor();
    } else {
      return ColorManager.normalColor();
    }
  };

  // Initialize time values on new game
  const _DataManager_setupNewGame = DataManager.setupNewGame;
  DataManager.setupNewGame = function () {
    _DataManager_setupNewGame.call(this);
    $gameVariables.setValue(timeVariable, maxTimePerDay);
  };

  // Auto-evaluate ending conditions
  const _Game_System_advanceDay = Game_System.prototype.advanceDay;
  Game_System.prototype.advanceDay = function () {
    _Game_System_advanceDay.call(this);

    // Check if this should be the final evaluation
    const currentDay = this.getCurrentDay();
    if (currentDay >= 30) {
      this.evaluateEnding();
    }
  };
})();
