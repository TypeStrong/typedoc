/**
 * An object literal.
 */
const objectLiteral = {
    valueZ: 'foo',
    valueY: function() { return 'foo'; },
    valueX: {
        valueZ: 'foo',
        valueY: (z:string) => { return {a:'test', b:z}; },
        valueA: [100, 200, 300]
    },
    valueA: 100,
    valueB: true
};
