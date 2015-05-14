/// <reference path="../lib.core.d.ts" />


/**
 * Destructuring objects.
 */
var {x, y, z} = (function() { return {x:0, y:'string', z:0}; })();


/**
 * Destructuring arrays.
 */
var [a, b, c = 10] = (function() { return [0, 'string']; })();


/**
 * Destructuring function parameters.
 */
function drawText({text = "", location:[x, y] = [0, 0], bold = false}) {
}