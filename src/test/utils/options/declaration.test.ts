import { convert, DeclarationOption, ParameterType, MapDeclarationOption } from '../../../lib/utils/options/declaration';
import { deepStrictEqual as equal } from 'assert';
import { Result } from '../../../lib/utils';

describe('Default convert function', () => {
    const optionWithType = (type: ParameterType) => ({
        type,
        defaultValue: null,
        name: 'test',
        help: ''
    }) as DeclarationOption;

    it('Converts to numbers', () => {
        equal(convert('123', optionWithType(ParameterType.Number)), Result.Ok(123));
        equal(convert('a', optionWithType(ParameterType.Number)), Result.Ok(0));
        equal(convert(NaN, optionWithType(ParameterType.Number)), Result.Ok(0));
    });

    it('Converts to strings', () => {
        equal(convert('123', optionWithType(ParameterType.String)), Result.Ok('123'));
        equal(convert(123, optionWithType(ParameterType.String)), Result.Ok('123'));
        equal(convert(['1', '2'], optionWithType(ParameterType.String)), Result.Ok('1,2'));
        equal(convert(null, optionWithType(ParameterType.String)), Result.Ok(''));
        equal(convert(void 0, optionWithType(ParameterType.String)), Result.Ok(''));
    });

    it('Converts to booleans', () => {
        equal(convert('a', optionWithType(ParameterType.Boolean)), Result.Ok(true));
        equal(convert([1], optionWithType(ParameterType.Boolean)), Result.Ok(true));
        equal(convert(false, optionWithType(ParameterType.Boolean)), Result.Ok(false));
    });

    it('Converts to arrays', () => {
        equal(convert('12,3', optionWithType(ParameterType.Array)), Result.Ok(['12', '3']));
        equal(convert(['12,3'], optionWithType(ParameterType.Array)), Result.Ok(['12,3']));
        equal(convert(true, optionWithType(ParameterType.Array)), Result.Ok([]));
    });

    it('Converts to mapped types', () => {
        const declaration: MapDeclarationOption<number> = {
            name: '',
            help: '',
            type: ParameterType.Map,
            map: {
                a: 1,
                b: 2
            },
            defaultValue: 1
        };
        equal(convert('a', declaration), Result.Ok(1));
        equal(convert('b', declaration), Result.Ok(2));
        equal(convert(2, declaration), Result.Ok(2));
    });

    it('Converts to mapped types with a map', () => {
        const declaration: MapDeclarationOption<number> = {
            name: '',
            help: '',
            type: ParameterType.Map,
            map: new Map([
                ['a', 1],
                ['b', 2]
            ]),
            defaultValue: 1
        };
        equal(convert('a', declaration), Result.Ok(1));
        equal(convert('b', declaration), Result.Ok(2));
        equal(convert(2, declaration), Result.Ok(2));
    });

    it('Uses the mapError if provided for errors', () => {
        const declaration: MapDeclarationOption<number> = {
            name: '',
            help: '',
            type: ParameterType.Map,
            map: {},
            defaultValue: 1,
            mapError: 'Test error'
        };
        equal(convert('a', declaration), Result.Err(declaration.mapError));
    });

    it('Generates a nice error if no mapError is provided', () => {
        const declaration: MapDeclarationOption<number> = {
            name: 'test',
            help: '',
            type: ParameterType.Map,
            map: new Map([['a', 1], ['b', 2]]),
            defaultValue: 1
        };
        equal(convert('c', declaration), Result.Err('test must be one of a, b'));
    });

    it('Correctly handles enum types in the map error', () => {
        enum Enum { a, b }
        const declaration = {
            name: 'test',
            help: '',
            type: ParameterType.Map,
            map: Enum,
            defaultValue: Enum.a
        } as const;
        equal(convert('c', declaration), Result.Err('test must be one of a, b'));
    });

    it('Passes through mixed', () => {
        const data = Symbol();
        equal(convert(data, optionWithType(ParameterType.Mixed)), Result.Ok(data));
    });
});
