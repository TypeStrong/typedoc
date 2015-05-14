/// <reference path="../lib.core.d.ts" />


/**
 * Destructuring objects.
 */
var {destructObjectA, destructObjectB, destructObjectC} = {destructObjectA:0, destructObjectB:'string', destructObjectC:0};


/**
 * Destructuring arrays.
 */
var [destructArrayA, destructArrayB, destructArrayC = 10] = [0, 'string', 0];

/**
 * Array Destructuring with rest
 */
var [destructArrayWithRestA, destructArrayWithRestB, ...destructArrayWithRest] = [1, 2, 3, 4];

/**
 * Array Destructuring with ignores
 */
var [destructArrayWithIgnoresA, , ...destructArrayWithIgnoresRest] = [1, 2, 3, 4];

/**
 * Destructuring function parameters.
 */
function drawText({text = "", location:[x, y] = [0, 0], bold = false}) { }