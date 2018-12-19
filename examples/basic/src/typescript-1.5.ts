/**
 * Destructuring objects.
 */
var {destructObjectA, destructObjectB, destructObjectC} = {destructObjectA:0, destructObjectB:'string', destructObjectC:0};


/**
 * Destructuring arrays.
 */
var [destructArrayA, destructArrayB, destructArrayC = 10] = [0, 'string', 0];

const numberArray = [1, 2, 3, 4];

/**
 * Array Destructuring with rest
 */
const [destructArrayWithRestA, destructArrayWithRestB, ...destructArrayWithRest] = numberArray;

/**
 * Array Destructuring with ignores
 */
const [destructArrayWithIgnoresA, , ...destructArrayWithIgnoresRest] = numberArray;

/**
 * Destructuring function parameters.
 *
 * @param text This is the text
 * @param location This is the location
 * @param bold Should it be bold?
 */
function drawText({text = "", location:[x, y] = [0, 0], bold = false}) {
}