/*:
 * @target MZ
 * @plugindesc Make player move with WASD keys.
 * @author Plam
 */

// Add WASD movement to the game.
(() => {
  const newMap = Object.assign({}, Input.keyMapper, {
    87: "up", // W
    65: "left", // A
    83: "down", // S
    68: "right", // D
  });
  Input.keyMapper = newMap;
})();
