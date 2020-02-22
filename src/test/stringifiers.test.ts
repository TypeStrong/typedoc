import { stringifyType } from '..';
import * as t from '../lib/models/types';

import Assert = require('assert');

const union = new t.UnionType([
    new t.IntrinsicType('string'),
    new t.IntrinsicType('number'),
    new t.TupleType([
        new t.IntrinsicType('boolean'),
        new t.IntrinsicType('string')
    ])
]);

describe('stringifiers', function() {
    it('maintains the `toString` method on type models', function() {
        Assert.equal(union.toString(), stringifyType(union));
    });

    it('stringifies intrinsic types', function() {
        const types = ['string', 'number', 'boolean', 'Object'];
        for (const type of types) {
            const input = new t.IntrinsicType(type);
            Assert.equal(stringifyType(input), type);
        }
    });

    it('stringifies conditional types', function() {
        const input = new t.ConditionalType(
            new t.StringLiteralType('foo'),
            new t.IntrinsicType('string'),
            new t.IntrinsicType('number'),
            new t.IntrinsicType('boolean')
        );

        Assert.equal(stringifyType(input), '"foo" extends string ? number : boolean');
    });

    it('stringifies inferred types', function() {
        const input = new t.ConditionalType(
            new t.ReferenceType('T', t.ReferenceType.SYMBOL_FQN_RESOLVED),
            new t.ArrayType(new t.InferredType('E')),
            new t.IntrinsicType('number'),
            new t.IntrinsicType('boolean')
        );

        Assert.equal(stringifyType(input), 'T extends infer E[] ? number : boolean');
    });

    it('stringifies query types', function() {
        const input = new t.QueryType(
            new t.ReferenceType('T', t.ReferenceType.SYMBOL_FQN_RESOLVED)
        );

        Assert.equal(stringifyType(input), 'typeof T');
    });

    it('stringifies indexed access types', function() {
        const input = new t.IndexedAccessType(
            new t.ReferenceType('T', t.ReferenceType.SYMBOL_FQN_RESOLVED),
            new t.StringLiteralType('foobar')
        );

        Assert.equal(stringifyType(input), 'T["foobar"]');
    });

    it('stringifies union types', function() {
        Assert.equal(stringifyType(union), 'string | number | [boolean, string]');
    });

    it('stringifies intersection types', function() {
        const intersection = new t.IntersectionType([
            new t.ReferenceType('T', t.ReferenceType.SYMBOL_FQN_RESOLVED),
            new t.ReferenceType('U', t.ReferenceType.SYMBOL_FQN_RESOLVED),
            new t.ReferenceType('V', t.ReferenceType.SYMBOL_FQN_RESOLVED)
        ]);

        Assert.equal(stringifyType(intersection), 'T & U & V');
    });

    it('stringifies complex union & intersection types', function() {
        const input = new t.UnionType([
            new t.ReferenceType('T', t.ReferenceType.SYMBOL_FQN_RESOLVED),
            new t.IntersectionType([
                new t.ReferenceType('U', t.ReferenceType.SYMBOL_FQN_RESOLVED),
                new t.ReferenceType('V', t.ReferenceType.SYMBOL_FQN_RESOLVED)
            ]),
            new t.StringLiteralType('foo')
        ]);

        Assert.equal(stringifyType(input), 'T | U & V | "foo"');
    });

    it('stringifies tuple types', function() {
        const input = new t.TupleType([
            new t.IntrinsicType('boolean'),
            new t.IntrinsicType('string')
        ]);

        Assert.equal(stringifyType(input), '[boolean, string]');
    });

    it('stringifies basic array types', function() {
        const input = new t.ArrayType(new t.IntrinsicType('string'));
        const expected = 'string[]';
        Assert.equal(stringifyType(input), expected);
    });

    it('stringifies complex array types', function() {
        const input = new t.ArrayType(union);
        const expected = '(string | number | [boolean, string])[]';
        Assert.equal(stringifyType(input), expected);
    });

    it('stringifies predicate types', function() {
        const input = new t.PredicateType('T', false, new t.IntrinsicType('string'));
        Assert.equal(stringifyType(input), 'T is string');
    });

    it('throws on invalid types', function() {
        Assert.throws(
            () => stringifyType({ type: 'bad' } as unknown as t.Type),
            {
                name: 'TypeError',
                message: `Cannot stringify type 'bad'`
            }
        );
    });
});
