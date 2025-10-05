//=============================================================================
// DoS_CoreIntegration.js - System Connector and Integration
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Connects all DoS systems and provides centralized management.
 * @author DoS Team
 *
 * @param EnableDebugMode
 * @type boolean
 * @default false
 * @desc Enable debug mode with additional information display
 *
 * @param AutoSaveOnPhaseChange
 * @type boolean
 * @default true
 * @desc Automatically save game when day phase changes
 *
 * @param ShowSystemNotifications
 * @type boolean
 * @default true
 * @desc Show system notifications for status changes
 *
 * @param EnablePerformanceOptimization
 * @type boolean
 * @default true
 * @desc Enable performance optimizations for all systems
 *
 * @help DoS_CoreIntegration.js
 *
 * This plugin connects all DoS systems and provides centralized management
 * for the core gameplay systems.
 *
 * Features:
 * - Centralized event system for cross-plugin communication
 * - Shared data management and synchronization
 * - Conflict resolution between systems
 * - Performance optimization
 * - Debug mode for development
 *
 * Plugin Commands:
 * - DoSDebug : Toggle debug mode display
 * - DoSSync : Synchronize all system data
 * - DoSStatus : Show comprehensive status report
 * - DoSReset : Reset all systems (for testing only)
 *
 * System Integration:
 * - Day cycle affects time and fatigue
 * - Status parameters affect dialogue options
 * - Time consumption affects day progression
 * - Memories unlock based on exploration and dialogue
 * - Ending evaluation considers all systems
 */

(() => {
  const pluginName = "DoS_CoreIntegration";
  const parameters = PluginManager.parameters(pluginName);
  const enableDebugMode = parameters["EnableDebugMode"] === "true";
  const autoSaveOnPhaseChange = parameters["AutoSaveOnPhaseChange"] === "true";
  const showSystemNotifications =
    parameters["ShowSystemNotifications"] === "true";
  const enablePerformanceOptimization =
    parameters["EnablePerformanceOptimization"] === "true";

  // Global DoS system manager
  const DoS = {
    initialized: false,
    debugMode: enableDebugMode,
    eventListeners: new Map(),
    systemData: new Map(),

    // Initialize all systems
    initialize: function () {
      if (this.initialized) return;

      this.setupEventListeners();
      this.setupSystemData();
      this.setupPerformanceOptimizations();
      this.initialized = true;

      if (this.debugMode) {
        console.log("DoS Core Systems Initialized");
      }
    },

    // Setup event listeners for cross-system communication
    setupEventListeners: function () {
      // Day cycle events
      this.addEventListener("dayAdvanced", this.onDayAdvanced.bind(this));
      this.addEventListener("phaseChanged", this.onPhaseChanged.bind(this));

      // Status change events
      this.addEventListener("statusChanged", this.onStatusChanged.bind(this));

      // Time events
      this.addEventListener("timeConsumed", this.onTimeConsumed.bind(this));
      this.addEventListener("timeDepleted", this.onTimeDepleted.bind(this));

      // Dialogue events
      this.addEventListener("dialogueChoice", this.onDialogueChoice.bind(this));

      // Memory events
      this.addEventListener("memoryUnlocked", this.onMemoryUnlocked.bind(this));
    },

    // Setup shared system data
    setupSystemData: function () {
      this.systemData.set("lastSaveTime", Date.now());
      this.systemData.set("totalActions", 0);
      this.systemData.set("totalDialogues", 0);
      this.systemData.set("totalMemories", 0);
      this.systemData.set("systemVersion", "1.0.0");
    },

    // Setup performance optimizations
    setupPerformanceOptimizations: function () {
      if (!enablePerformanceOptimization) return;

      // Optimize update cycles
      const _Scene_Base_update = Scene_Base.prototype.update;
      Scene_Base.prototype.update = function () {
        // Only update every other frame for less critical elements
        if (Graphics.frameCount % 2 === 0) {
          _Scene_Base_update.call(this);
        }
      };
    },

    // Event system
    addEventListener: function (event, callback) {
      if (!this.eventListeners.has(event)) {
        this.eventListeners.set(event, []);
      }
      this.eventListeners.get(event).push(callback);
    },

    removeEventListener: function (event, callback) {
      if (this.eventListeners.has(event)) {
        const listeners = this.eventListeners.get(event);
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    },

    dispatchEvent: function (event, data) {
      if (this.eventListeners.has(event)) {
        const listeners = this.eventListeners.get(event);
        for (const listener of listeners) {
          listener(data);
        }
      }

      if (this.debugMode) {
        console.log("DoS Event:", event, data);
      }
    },

    // Event handlers
    onDayAdvanced: function (data) {
      // Reset daily time
      $gameSystem.resetDailyTime();

      // Apply daily fatigue recovery
      const fatigueRecovery = 20;
      $gameSystem.changeFatigue(-fatigueRecovery);

      // Apply daily corruption increase
      const corruptionIncrease = 2;
      $gameSystem.changeCorruption(corruptionIncrease);

      // Update statistics
      this.systemData.set(
        "totalActions",
        this.systemData.get("totalActions") + 1
      );

      if (showSystemNotifications) {
        $gameMessage.add("A new day begins...");
      }

      // Auto-save if enabled
      if (autoSaveOnPhaseChange) {
        $gameSystem.save();
      }
    },

    onPhaseChanged: function (data) {
      const phase = data.phase;

      // Phase-specific effects
      switch (phase) {
        case 0: // Morning
          $gameSystem.changeHope(5); // Morning hope boost
          break;
        case 1: // Day
          // Tower exploration phase
          break;
        case 2: // Evening
          $gameSystem.changeFatigue(10); // Evening fatigue
          break;
      }

      // Auto-save if enabled
      if (autoSaveOnPhaseChange) {
        $gameSystem.save();
      }
    },

    onStatusChanged: function (data) {
      const type = data.type;
      const value = data.value;

      // Status-based effects
      if (type === "fatigue" && value > 80) {
        // High fatigue effects
        this.dispatchEvent("highFatigue", { level: value });
      }

      if (type === "corruption" && value > 70) {
        // High corruption effects
        this.dispatchEvent("highCorruption", { level: value });
      }

      if (type === "hope" && value < 20) {
        // Low hope effects
        this.dispatchEvent("lowHope", { level: value });
      }
    },

    onTimeConsumed: function (data) {
      const amount = data.amount;

      // Time consumption effects
      $gameSystem.changeFatigue(amount * 2); // Time consumption increases fatigue

      // Update statistics
      this.systemData.set(
        "totalActions",
        this.systemData.get("totalActions") + 1
      );
    },

    onTimeDepleted: function (data) {
      // Time depleted effects
      $gameSystem.changeFatigue(15);
      $gameSystem.changeHope(-5);

      if (showSystemNotifications) {
        $gameMessage.add("You're exhausted from the day's activities...");
      }
    },

    onDialogueChoice: function (data) {
      // Dialogue choice effects
      this.systemData.set(
        "totalDialogues",
        this.systemData.get("totalDialogues") + 1
      );

      // Check for memory triggers
      if (data.effects && data.effects.hope > 0) {
        this.checkMemoryTrigger("hope", data.effects.hope);
      }
    },

    onMemoryUnlocked: function (data) {
      // Memory unlock effects
      this.systemData.set(
        "totalMemories",
        this.systemData.get("totalMemories") + 1
      );

      // Memory-based status effects
      $gameSystem.changeHope(10);
      $gameSystem.changeCorruption(-5);

      if (showSystemNotifications) {
        $gameMessage.add("A memory surfaces from the depths of your mind...");
      }
    },

    // Check for memory triggers
    checkMemoryTrigger: function (type, value) {
      // Simple memory trigger logic
      const totalMemories = this.systemData.get("totalMemories");
      const threshold = Math.floor(totalMemories / 5) + 1;

      if (value >= threshold) {
        // Trigger memory chance
        if (Math.random() < 0.3) {
          // 30% chance
          const memoryId = totalMemories + 1;
          if (memoryId <= 20) {
            $gameSystem.startMemory(memoryId);
          }
        }
      }
    },

    // System synchronization
    synchronize: function () {
      // Synchronize all system data
      this.systemData.set("lastSyncTime", Date.now());

      // Validate system consistency
      this.validateSystemConsistency();

      if (this.debugMode) {
        console.log("DoS Systems Synchronized");
      }
    },

    // Validate system consistency
    validateSystemConsistency: function () {
      // Check for invalid values
      const fatigue = $gameSystem.getFatigue();
      const corruption = $gameSystem.getCorruption();
      const hope = $gameSystem.getHope();

      if (fatigue < 0 || fatigue > 100) {
        $gameSystem.setFatigue(Math.max(0, Math.min(100, fatigue)));
      }

      if (corruption < 0 || corruption > 100) {
        $gameSystem.setCorruption(Math.max(0, Math.min(100, corruption)));
      }

      if (hope < 0 || hope > 100) {
        $gameSystem.setHope(Math.max(0, Math.min(100, hope)));
      }
    },

    // Get comprehensive status report
    getStatusReport: function () {
      return {
        day: $gameSystem.getCurrentDay(),
        phase: $gameSystem.getCurrentPhase(),
        time: $gameSystem.getRemainingTime(),
        fatigue: $gameSystem.getFatigue(),
        corruption: $gameSystem.getCorruption(),
        hope: $gameSystem.getHope(),
        sisterRelation: $gameSystem.getRelationship(0),
        npcRelation: $gameSystem.getRelationship(1),
        towerRelation: $gameSystem.getRelationship(2),
        unlockedMemories: $gameSystem.getAllUnlockedMemories().length,
        totalActions: this.systemData.get("totalActions"),
        totalDialogues: this.systemData.get("totalDialogues"),
        totalMemories: this.systemData.get("totalMemories"),
      };
    },
  };

  // Plugin Commands
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "DoSDebug") {
      DoS.debugMode = !DoS.debugMode;
      $gameMessage.add("Debug mode: " + (DoS.debugMode ? "ON" : "OFF"));
    } else if (command === "DoSSync") {
      DoS.synchronize();
      $gameMessage.add("Systems synchronized");
    } else if (command === "DoSStatus") {
      const report = DoS.getStatusReport();
      $gameMessage.add("=== DoS Status Report ===");
      $gameMessage.add("Day: " + report.day + ", Phase: " + report.phase);
      $gameMessage.add("Time: " + report.time + "/10");
      $gameMessage.add("Fatigue: " + report.fatigue + "/100");
      $gameMessage.add("Corruption: " + report.corruption + "/100");
      $gameMessage.add("Hope: " + report.hope + "/100");
      $gameMessage.add("Memories: " + report.unlockedMemories);
    } else if (command === "DoSReset") {
      // Reset all systems (for testing only)
      $gameVariables.setValue(1, 1); // Day
      $gameVariables.setValue(2, 0); // Phase
      $gameVariables.setValue(3, 0); // Fatigue
      $gameVariables.setValue(4, 0); // Corruption
      $gameVariables.setValue(5, 50); // Hope
      $gameVariables.setValue(9, 10); // Time
      $gameMessage.add("All systems reset");
    }
  };

  // Hook into existing systems to dispatch events
  const _Game_System_advanceDay = Game_System.prototype.advanceDay;
  Game_System.prototype.advanceDay = function () {
    _Game_System_advanceDay.call(this);
    DoS.dispatchEvent("dayAdvanced", { day: this.getCurrentDay() });
  };

  const _Game_System_setDayPhase = Game_System.prototype.setDayPhase;
  Game_System.prototype.setDayPhase = function (phase) {
    const oldPhase = this.getCurrentPhase();
    _Game_System_setDayPhase.call(this, phase);
    DoS.dispatchEvent("phaseChanged", { oldPhase: oldPhase, newPhase: phase });
  };

  const _Game_System_changeFatigue = Game_System.prototype.changeFatigue;
  Game_System.prototype.changeFatigue = function (amount) {
    const oldValue = this.getFatigue();
    _Game_System_changeFatigue.call(this, amount);
    const newValue = this.getFatigue();
    DoS.dispatchEvent("statusChanged", {
      type: "fatigue",
      oldValue: oldValue,
      newValue: newValue,
    });
  };

  const _Game_System_changeCorruption = Game_System.prototype.changeCorruption;
  Game_System.prototype.changeCorruption = function (amount) {
    const oldValue = this.getCorruption();
    _Game_System_changeCorruption.call(this, amount);
    const newValue = this.getCorruption();
    DoS.dispatchEvent("statusChanged", {
      type: "corruption",
      oldValue: oldValue,
      newValue: newValue,
    });
  };

  const _Game_System_changeHope = Game_System.prototype.changeHope;
  Game_System.prototype.changeHope = function (amount) {
    const oldValue = this.getHope();
    _Game_System_changeHope.call(this, amount);
    const newValue = this.getHope();
    DoS.dispatchEvent("statusChanged", {
      type: "hope",
      oldValue: oldValue,
      newValue: newValue,
    });
  };

  const _Game_System_consumeTime = Game_System.prototype.consumeTime;
  Game_System.prototype.consumeTime = function (amount) {
    _Game_System_consumeTime.call(this, amount);
    DoS.dispatchEvent("timeConsumed", { amount: amount });
  };

  const _Game_System_unlockMemory = Game_System.prototype.unlockMemory;
  Game_System.prototype.unlockMemory = function (memoryId) {
    _Game_System_unlockMemory.call(this, memoryId);
    DoS.dispatchEvent("memoryUnlocked", { memoryId: memoryId });
  };

  // Initialize DoS systems when game starts
  const _Scene_Boot_start = Scene_Boot.prototype.start;
  Scene_Boot.prototype.start = function () {
    _Scene_Boot_start.call(this);
    DoS.initialize();
  };

  // Make DoS globally accessible
  window.DoS = DoS;
})();
