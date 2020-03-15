import Assert = require('assert');
import { LegendBuilder } from '../lib/output/plugins/LegendPlugin';

describe('LegendBuilder', function () {
    it('returns empty items when no css classes are registered', function () {
        const builder = new LegendBuilder();
        const results = builder.build().map(items => items.map(item => item.name));

        Assert.deepEqual(results, []);
    });

    it('returns single item list when common css classes are registered', function () {
        const builder = new LegendBuilder();
        builder.registerCssClasses(['tsd-kind-module']);
        const results = builder.build().map(items => items.map(item => item.name));

        Assert.deepEqual(results, [['Module']]);
    });

    it('returns single item list with multiple items when common css classes are registered', function () {
        const builder = new LegendBuilder();
        builder.registerCssClasses(['tsd-kind-module']);
        builder.registerCssClasses(['tsd-kind-function']);
        const results = builder.build().map(items => items.map(item => item.name));

        Assert.deepEqual(results, [['Module', 'Function']]);
    });

    it('returns single item list with multiple items when multiple css classes are registered', function () {
        const builder = new LegendBuilder();
        builder.registerCssClasses(['tsd-kind-module']);
        builder.registerCssClasses(['tsd-kind-function']);
        builder.registerCssClasses(['tsd-kind-function', 'tsd-has-type-parameter']);
        const results = builder.build().map(items => items.map(item => item.name));

        Assert.deepEqual(results, [['Module', 'Function', 'Function with type parameter']]);
    });

    it('returns multiple item list when common css classes are registered from different groups', function () {
        const builder = new LegendBuilder();
        builder.registerCssClasses(['tsd-kind-module']);
        builder.registerCssClasses(['tsd-kind-accessor', 'tsd-parent-kind-class', 'tsd-is-inherited']);
        builder.registerCssClasses(['tsd-kind-property', 'tsd-parent-kind-class', 'tsd-is-private']);
        builder.registerCssClasses(['tsd-kind-accessor', 'tsd-parent-kind-class', 'tsd-is-private']);
        const results = builder.build().map(items => items.map(item => item.name));

        Assert.deepEqual(results, [['Module'], ['Inherited accessor'], ['Private property', 'Private accessor']]);
    });

    it('returns single item when includes ignored classes', function () {
        const builder = new LegendBuilder();
        builder.registerCssClasses(['tsd-kind-class', 'tsd-parent-kind-external-module']);
        const results = builder.build().map(items => items.map(item => item.name));

        Assert.deepEqual(results, [['Class']]);
    });
});
