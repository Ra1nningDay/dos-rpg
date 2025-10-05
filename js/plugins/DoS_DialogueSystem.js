//=============================================================================
// DoS_DialogueSystem.js - Relationship & Dialogue Management System
//=============================================================================

/*:
 * @target MZ
 * @plugindesc Implements enhanced dialogue choices that affect Hope and Corruption.
 * @author DoS Team
 *
 * @param SisterRelationshipVariable
 * @type number
 * @default 6
 * @desc Game variable ID to store sister relationship value (0-100)
 *
 * @param NpcRelationshipVariable
 * @type number
 * @default 7
 * @desc Game variable ID to store NPC relationship value (0-100)
 *
 * @param TowerDwellerRelationshipVariable
 * @type number
 * @default 8
 * @desc Game variable ID to store tower dweller relationship value (0-100)
 *
 * @param ShowRelationshipEffects
 * @type boolean
 * @default true
 * @desc Show status effect previews in dialogue choices
 *
 * @param EnableConditionalDialogue
 * @type boolean
 * @default true
 * @desc Enable dialogue options based on status levels
 *
 * @help DoS_DialogueSystem.js
 *
 * This plugin implements enhanced dialogue choices that affect relationships
 * and status parameters (Hope and Corruption).
 *
 * Plugin Commands:
 * - ChangeRelationship [type] [amount] : Changes relationship value
 *   type: 0=Sister, 1=NPC, 2=Tower Dweller
 * - SetRelationship [type] [value] : Sets relationship to specific value
 * - ShowRelationshipStatus : Shows current relationship values
 * - StartEnhancedDialogue [eventId] : Starts enhanced dialogue with status effects
 *
 * Enhanced Dialogue Format:
 * Use special text codes in Show Text commands:
 * \CHOICE[option text|hope:+X,corruption:-Y|condition]
 * - option text: The choice text to display
 * - hope:+X,corruption:-Y: Status effects (optional)
 * - condition: Requirement for this choice (optional)
 *   Conditions: hope>50, corruption<30, sister>70, etc.
 *
 * Example:
 * \CHOICE[Be honest|hope:+5,corruption:-2|hope>30]
 * \CHOICE[Hide the truth|hope:-3,corruption:+5]
 */

(() => {
  const pluginName = "DoS_DialogueSystem";
  const parameters = PluginManager.parameters(pluginName);
  const sisterRelationshipVariable = Number(
    parameters["SisterRelationshipVariable"] || 6
  );
  const npcRelationshipVariable = Number(
    parameters["NpcRelationshipVariable"] || 7
  );
  const towerDwellerRelationshipVariable = Number(
    parameters["TowerDwellerRelationshipVariable"] || 8
  );
  const showRelationshipEffects =
    parameters["ShowRelationshipEffects"] === "true";
  const enableConditionalDialogue =
    parameters["EnableConditionalDialogue"] === "true";

  // Relationship types
  const RELATIONSHIP_SISTER = 0;
  const RELATIONSHIP_NPC = 1;
  const RELATIONSHIP_TOWER_DWELLER = 2;

  // Plugin Commands
  const _Game_Interpreter_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;
  Game_Interpreter.prototype.pluginCommand = function (command, args) {
    _Game_Interpreter_pluginCommand.call(this, command, args);

    if (command === "ChangeRelationship") {
      const type = Number(args[0]);
      const amount = Number(args[1]);
      $gameSystem.changeRelationship(type, amount);
    } else if (command === "SetRelationship") {
      const type = Number(args[0]);
      const value = Number(args[1]);
      $gameSystem.setRelationship(type, value);
    } else if (command === "ShowRelationshipStatus") {
      $gameSystem.showRelationshipStatus();
    } else if (command === "StartEnhancedDialogue") {
      const eventId = Number(args[0]);
      $gameSystem.startEnhancedDialogue(eventId);
    }
  };

  // Extend Game_System to handle relationships
  Game_System.prototype.changeRelationship = function (type, amount) {
    let variableId;
    let name;

    switch (type) {
      case RELATIONSHIP_SISTER:
        variableId = sisterRelationshipVariable;
        name = "Sister";
        break;
      case RELATIONSHIP_NPC:
        variableId = npcRelationshipVariable;
        name = "NPC";
        break;
      case RELATIONSHIP_TOWER_DWELLER:
        variableId = towerDwellerRelationshipVariable;
        name = "Tower Dweller";
        break;
      default:
        return;
    }

    const current = $gameVariables.value(variableId);
    const newValue = Math.max(0, Math.min(100, current + amount));
    $gameVariables.setValue(variableId, newValue);

    if (amount > 0) {
      $gameMessage.add(name + " relationship improved!");
    } else if (amount < 0) {
      $gameMessage.add(name + " relationship worsened...");
    }
  };

  Game_System.prototype.setRelationship = function (type, value) {
    let variableId;

    switch (type) {
      case RELATIONSHIP_SISTER:
        variableId = sisterRelationshipVariable;
        break;
      case RELATIONSHIP_NPC:
        variableId = npcRelationshipVariable;
        break;
      case RELATIONSHIP_TOWER_DWELLER:
        variableId = towerDwellerRelationshipVariable;
        break;
      default:
        return;
    }

    const newValue = Math.max(0, Math.min(100, value));
    $gameVariables.setValue(variableId, newValue);
  };

  Game_System.prototype.getRelationship = function (type) {
    switch (type) {
      case RELATIONSHIP_SISTER:
        return $gameVariables.value(sisterRelationshipVariable);
      case RELATIONSHIP_NPC:
        return $gameVariables.value(npcRelationshipVariable);
      case RELATIONSHIP_TOWER_DWELLER:
        return $gameVariables.value(towerDwellerRelationshipVariable);
      default:
        return 0;
    }
  };

  Game_System.prototype.showRelationshipStatus = function () {
    const sister = this.getRelationship(RELATIONSHIP_SISTER);
    const npc = this.getRelationship(RELATIONSHIP_NPC);
    const tower = this.getRelationship(RELATIONSHIP_TOWER_DWELLER);

    $gameMessage.add("=== Relationships ===");
    $gameMessage.add("Sister: " + sister + "/100");
    $gameMessage.add("NPCs: " + npc + "/100");
    $gameMessage.add("Tower Dwellers: " + tower + "/100");
  };

  Game_System.prototype.startEnhancedDialogue = function (eventId) {
    // Store the current event for enhanced dialogue processing
    $gameTemp._enhancedDialogueEventId = eventId;
  };

  // Enhanced choice processing
  const _Game_Message_add = Game_Message.prototype.add;
  Game_Message.prototype.add = function (text) {
    // Process enhanced choice syntax
    if (text.includes("\\CHOICE[")) {
      this.processEnhancedChoice(text);
      return;
    }
    _Game_Message_add.call(this, text);
  };

  Game_Message.prototype.processEnhancedChoice = function (text) {
    const choiceMatch = text.match(/\\CHOICE\[(.+?)\]/);
    if (!choiceMatch) return;

    const choiceData = choiceMatch[1];
    const parts = choiceData.split("|");

    const choiceText = parts[0] || "";
    const effects = parts[1] || "";
    const condition = parts[2] || "";

    // Check if choice meets conditions
    if (condition && !this.checkChoiceCondition(condition)) {
      return; // Skip this choice if condition not met
    }

    // Parse effects
    const effectData = this.parseChoiceEffects(effects);

    // Add choice with effects
    if (!$gameMessage._choices) {
      $gameMessage._choices = [];
      $gameMessage._choiceEffects = [];
    }

    $gameMessage._choices.push(choiceText);
    $gameMessage._choiceEffects.push(effectData);

    // Show effects in choice text if enabled
    if (showRelationshipEffects && effects) {
      const effectText = this.formatEffectText(effectData);
      $gameMessage._choices[$gameMessage._choices.length - 1] += effectText;
    }
  };

  Game_Message.prototype.checkChoiceCondition = function (condition) {
    if (!enableConditionalDialogue) return true;

    // Parse condition string (e.g., "hope>50", "corruption<30")
    const conditionMatch = condition.match(/(\w+)([><=]+)(\d+)/);
    if (!conditionMatch) return true;

    const stat = conditionMatch[1];
    const operator = conditionMatch[2];
    const value = Number(conditionMatch[3]);

    let currentValue;
    switch (stat) {
      case "hope":
        currentValue = $gameSystem.getHope();
        break;
      case "corruption":
        currentValue = $gameSystem.getCorruption();
        break;
      case "fatigue":
        currentValue = $gameSystem.getFatigue();
        break;
      case "sister":
        currentValue = $gameSystem.getRelationship(RELATIONSHIP_SISTER);
        break;
      case "npc":
        currentValue = $gameSystem.getRelationship(RELATIONSHIP_NPC);
        break;
      case "tower":
        currentValue = $gameSystem.getRelationship(RELATIONSHIP_TOWER_DWELLER);
        break;
      default:
        return true;
    }

    switch (operator) {
      case ">":
        return currentValue > value;
      case "<":
        return currentValue < value;
      case ">=":
        return currentValue >= value;
      case "<=":
        return currentValue <= value;
      case "=":
      case "==":
        return currentValue === value;
      default:
        return true;
    }
  };

  Game_Message.prototype.parseChoiceEffects = function (effects) {
    const effectData = {
      hope: 0,
      corruption: 0,
      fatigue: 0,
      sister: 0,
      npc: 0,
      tower: 0,
    };

    if (!effects) return effectData;

    // Parse effects like "hope:+5,corruption:-2"
    const effectPairs = effects.split(",");
    for (const pair of effectPairs) {
      const effectMatch = pair.match(/(\w+):([+-]\d+)/);
      if (effectMatch) {
        const stat = effectMatch[1];
        const value = Number(effectMatch[2]);

        if (effectData.hasOwnProperty(stat)) {
          effectData[stat] = value;
        }
      }
    }

    return effectData;
  };

  Game_Message.prototype.formatEffectText = function (effectData) {
    const effects = [];

    if (effectData.hope !== 0) {
      effects.push(
        "Hope " + (effectData.hope > 0 ? "+" : "") + effectData.hope
      );
    }
    if (effectData.corruption !== 0) {
      effects.push(
        "Corruption " +
          (effectData.corruption > 0 ? "+" : "") +
          effectData.corruption
      );
    }
    if (effectData.fatigue !== 0) {
      effects.push(
        "Fatigue " + (effectData.fatigue > 0 ? "+" : "") + effectData.fatigue
      );
    }

    if (effects.length > 0) {
      return " [" + effects.join(", ") + "]";
    }

    return "";
  };

  // Apply choice effects when choice is selected
  const _Game_Interpreter_command102 = Game_Interpreter.prototype.command102;
  Game_Interpreter.prototype.command102 = function (params) {
    const result = _Game_Interpreter_command102.call(this, params);

    // Apply effects if this is an enhanced choice
    if ($gameMessage._choiceEffects && this._branch[this._indent] > 0) {
      const choiceIndex = this._branch[this._indent] - 1;
      const effects = $gameMessage._choiceEffects[choiceIndex];

      if (effects) {
        $gameSystem.changeHope(effects.hope);
        $gameSystem.changeCorruption(effects.corruption);
        $gameSystem.changeFatigue(effects.fatigue);
        $gameSystem.changeRelationship(RELATIONSHIP_SISTER, effects.sister);
        $gameSystem.changeRelationship(RELATIONSHIP_NPC, effects.npc);
        $gameSystem.changeRelationship(
          RELATIONSHIP_TOWER_DWELLER,
          effects.tower
        );
      }

      // Clear enhanced choice data
      $gameMessage._choiceEffects = null;
    }

    return result;
  };

  // Initialize relationship values on new game
  const _DataManager_setupNewGame = DataManager.setupNewGame;
  DataManager.setupNewGame = function () {
    _DataManager_setupNewGame.call(this);
    $gameVariables.setValue(sisterRelationshipVariable, 50); // Start with neutral sister relationship
    $gameVariables.setValue(npcRelationshipVariable, 30); // Start with lower NPC relationship
    $gameVariables.setValue(towerDwellerRelationshipVariable, 20); // Start with low tower dweller relationship
  };
})();
