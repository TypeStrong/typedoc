import Assert = require('assert');
import {
    IntrinsicType, UnionType, ArrayType, IntersectionType, TypeParameterType, StringLiteralType
} from '../lib/models';

const stringType = new IntrinsicType('string');
const numberType = new IntrinsicType('number');
const booleanType = new IntrinsicType('boolean');
const stringArrayType = new ArrayType(stringType);
const numberArrayType = new ArrayType(numberType);
const stringNumberUnionType = new UnionType([ stringType, numberType ]);
const numberStringUnionType = new UnionType([ numberType, stringType ]);
const stringNumberIntersectionType = new IntersectionType([ stringType, numberType ]);
const stringBooleanIntersectionType = new IntersectionType([ stringType, booleanType ]);
const numberStringIntersectionType = new IntersectionType([ numberType, stringType ]);
const numberBooleanUnionType = new UnionType([ numberType, booleanType ]);
const stringParamType = new TypeParameterType(stringType);
const numberParamType = new TypeParameterType(numberType);
const booleanParamType = new TypeParameterType(booleanType);
const anyParamType = new TypeParameterType();
const stringParamArrayType = new ArrayType(stringParamType);

describe('ArrayType', () => {
    it('is assignable to compatible types', () => {
        const type = new ArrayType(stringType);
        Assert(type.isAssignableTo(type));
        Assert(type.isAssignableTo(stringArrayType));
        Assert(type.isAssignableTo(anyParamType));
        Assert(type.isAssignableTo(stringParamArrayType));
    });
    it('is not assignable to incompatible types', () => {
        const type = new ArrayType(stringType);
        Assert(!type.isAssignableTo(stringType));
        Assert(!type.isAssignableTo(numberArrayType));
        Assert(!type.isAssignableTo(numberType));
        Assert(!type.isAssignableTo(booleanType));
        Assert(!type.isAssignableTo(stringParamType));
        Assert(!type.isAssignableTo(numberParamType));
        Assert(!type.isAssignableTo(numberBooleanUnionType));
        Assert(!type.isAssignableTo(stringNumberUnionType));
        Assert(!type.isAssignableTo(stringNumberIntersectionType));
    });
    it('is assignable from compatible types', () => {
        const type = new ArrayType(stringType);
        Assert(type.isAssignableFrom(type));
        Assert(type.isAssignableFrom(stringArrayType));
        Assert(type.isAssignableFrom(stringParamArrayType));
    });
    it('is not assignable from incompatible types', () => {
        const type = new ArrayType(stringType);
        Assert(!type.isAssignableFrom(booleanType));
        Assert(!type.isAssignableFrom(booleanParamType));
        Assert(!type.isAssignableFrom(stringNumberUnionType));
        Assert(!type.isAssignableFrom(anyParamType));
        Assert(!type.isAssignableFrom(numberArrayType));
    });
});

describe('IntersectionType', () => {
    it('is assignable to compatible types', () => {
        const type = new IntersectionType([ stringType, numberType ]);
        Assert(type.isAssignableTo(type));
        Assert(type.isAssignableTo(stringNumberIntersectionType));
        Assert(type.isAssignableTo(numberStringIntersectionType));
        Assert(type.isAssignableTo(numberType));
        Assert(type.isAssignableTo(stringType));
        Assert(type.isAssignableTo(stringNumberUnionType));
        Assert(type.isAssignableTo(numberStringUnionType));
        Assert(type.isAssignableTo(numberBooleanUnionType));
        Assert(type.isAssignableTo(stringParamType));
        Assert(type.isAssignableTo(numberParamType));
        Assert(type.isAssignableTo(anyParamType));
    });
    it('is not assignable to incompatible types', () => {
        const type = new IntersectionType([ stringType, numberType ]);
        Assert(!type.isAssignableTo(booleanType));
        Assert(!type.isAssignableTo(stringArrayType));
        Assert(!type.isAssignableTo(stringBooleanIntersectionType));
        Assert(!type.isAssignableTo(booleanParamType));
    });
    it('is assignable from compatible types', () => {
        const type = new IntersectionType([ stringType, numberType ]);
        Assert(type.isAssignableFrom(type));
        Assert(type.isAssignableFrom(stringNumberIntersectionType));
        Assert(type.isAssignableFrom(numberStringIntersectionType));
    });
    it('is not assignable from incompatible types', () => {
        const type = new IntersectionType([ stringType, numberType ]);
        Assert(!type.isAssignableFrom(stringType));
        Assert(!type.isAssignableFrom(numberType));
        Assert(!type.isAssignableFrom(booleanType));
        Assert(!type.isAssignableFrom(stringArrayType));
        Assert(!type.isAssignableFrom(stringNumberUnionType));
        Assert(!type.isAssignableFrom(numberStringUnionType));
        Assert(!type.isAssignableFrom(stringBooleanIntersectionType));
        Assert(!type.isAssignableFrom(numberBooleanUnionType));
        Assert(!type.isAssignableFrom(stringParamType));
        Assert(!type.isAssignableFrom(numberParamType));
        Assert(!type.isAssignableFrom(booleanParamType));
        Assert(!type.isAssignableFrom(anyParamType));
    });
});

describe('IntrinsicType', () => {
    it('is assignable to compatible types', () => {
        const type = new IntrinsicType('string');
        Assert(type.isAssignableTo(type));
        Assert(type.isAssignableTo(stringType));
        Assert(type.isAssignableTo(stringNumberUnionType));
        Assert(type.isAssignableTo(stringParamType));
        Assert(type.isAssignableTo(anyParamType));
    });
    it('is not assignable to incompatible types', () => {
        const type = new IntrinsicType('string');
        Assert(!type.isAssignableTo(numberType));
        Assert(!type.isAssignableTo(numberBooleanUnionType));
        Assert(!type.isAssignableTo(stringArrayType));
        Assert(!type.isAssignableTo(stringNumberIntersectionType));
        Assert(!type.isAssignableTo(numberParamType));
    });
    it('is assignable from compatible types', () => {
        const type = new IntrinsicType('string');
        Assert(type.isAssignableFrom(type));
        Assert(type.isAssignableFrom(stringType));
        Assert(type.isAssignableFrom(stringNumberIntersectionType));
        Assert(type.isAssignableFrom(stringParamType));
    });
    it('is not assignable from incompatible types', () => {
        const type = new IntrinsicType('string');
        Assert(!type.isAssignableFrom(numberType));
        Assert(!type.isAssignableFrom(stringArrayType));
        Assert(!type.isAssignableFrom(stringNumberUnionType));
        Assert(!type.isAssignableFrom(anyParamType));
        Assert(!type.isAssignableFrom(numberParamType));
    });
});

describe('StringLiteralType', () => {
    it('is assignable to compatible types', () => {
        const type = new StringLiteralType('test');
        Assert(type.isAssignableTo(type));
        Assert(type.isAssignableTo(stringType));
        Assert(type.isAssignableTo(new StringLiteralType('test')));
        Assert(type.isAssignableTo(stringParamType));
        Assert(type.isAssignableTo(anyParamType));
    });
    it('is not assignable to incompatible types', () => {
        const type = new StringLiteralType('test');
        Assert(!type.isAssignableTo(new StringLiteralType('test2')));
    });
    it('is assignable from compatible types', () => {
        const type = new StringLiteralType('test');
        Assert(type.isAssignableFrom(new StringLiteralType('test')));
    });
    it('is not assignable from incompatible types', () => {
        const type = new StringLiteralType('test');
        Assert(!type.isAssignableFrom(stringType));
        Assert(!type.isAssignableFrom(stringParamType));
    });
});

describe('UnionType', () => {
    it('is assignable to compatible types', () => {
        const type = new UnionType([ stringType, numberType ]);
        Assert(type.isAssignableTo(type));
        Assert(type.isAssignableTo(stringNumberUnionType));
        Assert(type.isAssignableTo(numberStringUnionType));
        Assert(type.isAssignableTo(anyParamType));
    });
    it('is not assignable to incompatible types', () => {
        const type = new UnionType([ stringType, numberType ]);
        Assert(!type.isAssignableTo(numberType));
        Assert(!type.isAssignableTo(booleanType));
        Assert(!type.isAssignableTo(stringType));
        Assert(!type.isAssignableTo(stringArrayType));
        Assert(!type.isAssignableTo(stringParamType));
        Assert(!type.isAssignableTo(numberParamType));
        Assert(!type.isAssignableTo(numberBooleanUnionType));
        Assert(!type.isAssignableTo(stringNumberIntersectionType));
        Assert(!type.isAssignableTo(stringBooleanIntersectionType));
    });
    it('is assignable from compatible types', () => {
        const type = new UnionType([ stringType, numberType ]);
        Assert(type.isAssignableFrom(type));
        Assert(type.isAssignableFrom(stringNumberUnionType));
        Assert(type.isAssignableFrom(numberStringUnionType));
        Assert(type.isAssignableFrom(stringNumberIntersectionType));
        Assert(type.isAssignableFrom(stringType));
        Assert(type.isAssignableFrom(numberType));
        Assert(type.isAssignableFrom(numberParamType));
        Assert(type.isAssignableFrom(stringParamType));
        Assert(type.isAssignableFrom(stringBooleanIntersectionType));
    });
    it('is not assignable from incompatible types', () => {
        const type = new UnionType([ stringType, numberType ]);
        Assert(!type.isAssignableFrom(booleanType));
        Assert(!type.isAssignableFrom(booleanParamType));
        Assert(!type.isAssignableFrom(numberBooleanUnionType));
        Assert(!type.isAssignableFrom(stringArrayType));
    });
});
