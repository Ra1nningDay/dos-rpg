//=============================================================================
// DoS_DayCycle.js - A Day, A Life Loop System
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Implements the daily cycle system for preparation → tower exploration → return to sister.
 * @author DoS Team
 *
 * @param MaxDays
 * @type number
 * @default 30
 * @desc Maximum number of days before bad ending
 *
 * @param DayVariable
 * @type number
 * @default 1
 * @desc Game variable ID to store current day
 *
 * @param PhaseVariable
 * @type number
 * @default 2
 * @desc Game variable ID to store current phase (0=Morning, 1=Day, 2=Evening)
 *
 * @param ShowDayInMenu
 * @type boolean
 * @default true
 * @desc Show current day in the menu screen
 *
 * @param ShowDayOnMap
 * @type boolean
 * @default true
 * @desc Show current day on the map screen
 *
 * @param MapWindowPosition
 * @type select
 * @option Top Left
 * @option Top Right
 * @option Bottom Left
 * @option Bottom Right
 * @default Top Right
 * @desc Position of the day window on the map screen
 *
 * @help DoS_DayCycle.js
 *
 * This plugin implements the daily cycle system where each in-game day
 * consists of three phases:
 * 0 - Morning: Preparation phase
 * 1 - Day: Tower exploration phase
 * 2 - Evening: Return to sister phase
 *
 * Plugin Commands:
 * - AdvanceDay : Advances to the next day
 * - SetPhase [phase] : Sets the current phase (0=Morning, 1=Day, 2=Evening)
 * - ShowDayStatus : Shows current day and phase status
 *
 * The game will trigger a bad ending when the day count reaches MaxDays.
 */

(() => {
  const pluginName = "DoS_DayCycle";
  const parameters = PluginManager.parameters(pluginName);
  const maxDays = Number(parameters["MaxDays"] || 30);
  const dayVariable = Number(parameters["DayVariable"] || 1);
  const phaseVariable = Number(parameters["PhaseVariable"] || 2);
  const showDayInMenu = parameters["ShowDayInMenu"] === "true";
  const showDayOnMap = parameters["ShowDayOnMap"] === "true";
  const mapWindowPosition = String(
    parameters["MapWindowPosition"] || "Top Right"
  );

  // Day phases constants
  const PHASE_MORNING = 0; // Preparation
  const PHASE_DAY = 1; // Tower Exploration
  const PHASE_EVENING = 2; // Return to Sister

  // Initialize game variables
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "AdvanceDay") {
      $gameSystem.advanceDay();
    } else if (command === "SetPhase") {
      const phase = Number(args[0]);
      $gameSystem.setDayPhase(phase);
    } else if (command === "ShowDayStatus") {
      $gameSystem.showDayStatus();
    }
  };

  // Extend Game_System to handle day cycle
  Game_System.prototype.advanceDay = function () {
    if (!$gameVariables) return;
    const currentDay = $gameVariables.value(dayVariable);
    $gameVariables.setValue(dayVariable, currentDay + 1);

    // Reset to morning phase
    this.setDayPhase(PHASE_MORNING);

    // Check for bad ending
    if (currentDay + 1 > maxDays) {
      this.triggerBadEnding();
    }
  };

  Game_System.prototype.setDayPhase = function (phase) {
    if (!$gameVariables) return;
    $gameVariables.setValue(phaseVariable, phase);
    this.onPhaseChange(phase);
  };

  Game_System.prototype.getCurrentDay = function () {
    if (!$gameVariables) return 1;
    return $gameVariables.value(dayVariable);
  };

  Game_System.prototype.getCurrentPhase = function () {
    if (!$gameVariables) return 0;
    return $gameVariables.value(phaseVariable);
  };

  Game_System.prototype.getPhaseName = function (phase) {
    switch (phase) {
      case PHASE_MORNING:
        return "Morning";
      case PHASE_DAY:
        return "Day";
      case PHASE_EVENING:
        return "Evening";
      default:
        return "Unknown";
    }
  };

  Game_System.prototype.onPhaseChange = function (phase) {
    // Handle phase-specific logic
    switch (phase) {
      case PHASE_MORNING:
        // Preparation phase logic
        break;
      case PHASE_DAY:
        // Tower exploration phase logic
        break;
      case PHASE_EVENING:
        // Return to sister phase logic
        break;
    }
  };

  Game_System.prototype.showDayStatus = function () {
    if (!$gameMessage) return;
    const day = this.getCurrentDay();
    const phase = this.getCurrentPhase();
    const phaseName = this.getPhaseName(phase);
    $gameMessage.add("Day " + day + " of " + maxDays + " - " + phaseName);
  };

  Game_System.prototype.triggerBadEnding = function () {
    // Trigger bad ending common event
    if ($gameTemp) {
      $gameTemp.reserveCommonEvent(1); // Assuming Common Event 1 is the bad ending
    }
  };

  // Extend Scene_Menu to show day status
  // if (showDayInMenu) {
  //   const _Scene_Menu_create = Scene_Menu.prototype.create;
  //   Scene_Menu.prototype.create = function () {
  //     _Scene_Menu_create.call(this);
  //     this.createDayWindow();
  //   };

  //   const _Scene_Menu_createStatusWindow =
  //     Scene_Menu.prototype.createStatusWindow;
  //   Scene_Menu.prototype.createStatusWindow = function () {
  //     _Scene_Menu_createStatusWindow.call(this);
  //     if (this._dayWindow) {
  //       this._statusWindow.y += this._dayWindow.height;
  //     }
  //   };

  //   Scene_Menu.prototype.createDayWindow = function () {
  //     const rect = this.dayWindowRect();
  //     this._dayWindow = new Window_DayStatus(rect);
  //     this.addWindow(this._dayWindow);
  //   };

  //   Scene_Menu.prototype.dayWindowRect = function () {
  //     const ww = Graphics.boxWidth;
  //     const wh = this.calcWindowHeight(1, false); // Changed to false for compact display
  //     const wx = 0;
  //     const wy = this.mainAreaTop();
  //     return new Rectangle(wx, wy, ww, wh);
  //   };
  // }

  // Create Day Status Window
  function Window_DayStatus() {
    this.initialize(...arguments);
  }

  Window_DayStatus.prototype = Object.create(Window_Base.prototype);
  Window_DayStatus.prototype.constructor = Window_DayStatus;

  Window_DayStatus.prototype.initialize = function (rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.refresh();
  };

  Window_DayStatus.prototype.refresh = function () {
    if (!$gameSystem) return;

    const day = $gameSystem.getCurrentDay();
    const phase = $gameSystem.getCurrentPhase();
    const phaseName = $gameSystem.getPhaseName(phase);

    this.contents.clear();

    const padding = 8;
    let x = padding;

    // Draw Day Status label and value in one line
    this.changeTextColor(this.systemColor());
    this.drawText("Day:", x, 0, 60, "left");
    this.resetTextColor();

    const dayText = day + " / " + maxDays;
    this.drawText(dayText, x + 60, 0, 100, "left");

    // Draw Phase label and value
    // this.changeTextColor(this.systemColor());
    // this.drawText("Phase:", x + 200, 0, 80, "left");
    // this.resetTextColor();
    this.drawText(phaseName, x + 280, 0, 120, "left");

    // Add warning text if running out of time
    if (day >= maxDays - 5) {
      this.changeTextColor(ColorManager.crisisColor());
      this.drawText("⚠ Time is running out!", x + 450, 0, 200, "left");
      this.resetTextColor();
    }
  };

  // Update day window when menu is opened
  const _Scene_Menu_start = Scene_Menu.prototype.start;
  Scene_Menu.prototype.start = function () {
    _Scene_Menu_start.call(this);
    if (this._dayWindow) {
      this._dayWindow.refresh();
    }
  };

  // Extend Scene_Map to show day window on map
  if (showDayOnMap) {
    const _Scene_Map_createDisplayObjects =
      Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function () {
      _Scene_Map_createDisplayObjects.call(this);
      this.createMapDayWindow();
    };

    Scene_Map.prototype.createMapDayWindow = function () {
      const rect = this.mapDayWindowRect();
      this._mapDayWindow = new Window_MapDayStatus(rect);
      this.addWindow(this._mapDayWindow);
    };

    Scene_Map.prototype.mapDayWindowRect = function () {
      const ww = 260;
      const wh = 60;
      let wx, wy;

      switch (mapWindowPosition) {
        case "Top Left":
          wx = 0;
          wy = 0;
          break;
        case "Top Right":
          wx = Graphics.boxWidth - ww;
          wy = 0;
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
          wy = 0;
      }

      return new Rectangle(wx, wy, ww, wh);
    };

    // Update map day window
    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function () {
      _Scene_Map_update.call(this);
      if (this._mapDayWindow) {
        // Update every 60 frames (1 second)
        if (Graphics.frameCount % 60 === 0) {
          this._mapDayWindow.refresh();
        }
      }
    };
  }

  // Create Map Day Status Window
  function Window_MapDayStatus() {
    this.initialize(...arguments);
  }

  Window_MapDayStatus.prototype = Object.create(Window_Base.prototype);
  Window_MapDayStatus.prototype.constructor = Window_MapDayStatus;

  Window_MapDayStatus.prototype.initialize = function (rect) {
    Window_Base.prototype.initialize.call(this, rect);
    this.opacity = 200; // Semi-transparent
    this.refresh();
  };

  Window_MapDayStatus.prototype.refresh = function () {
    if (!$gameSystem) return;

    const day = $gameSystem.getCurrentDay();
    const phase = $gameSystem.getCurrentPhase();
    const phaseName = $gameSystem.getPhaseName(phase);

    this.contents.clear();

    const padding = 8;
    let x = padding;

    // Draw Day Status
    this.changeTextColor(this.systemColor());
    this.drawText("Day:", x, 0, 40, "left");
    this.resetTextColor();

    const dayText = day + "/" + maxDays;
    this.drawText(dayText, x + 40, 0, 50, "left");

    // Draw Phase
    // this.changeTextColor(this.systemColor());
    this.drawText("☀️", x + 100, 0, 50, "left");
    this.resetTextColor();
    this.drawText(phaseName, x + 140, 0, 80, "left");

    // Add warning if running out of time
    if (day >= maxDays - 5) {
      this.changeTextColor(ColorManager.crisisColor());
      this.drawText("⚠", x + 230, 0, 20, "left");
      this.resetTextColor();
    }
  };
})();
