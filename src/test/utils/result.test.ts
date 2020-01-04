import { equal, fail, throws } from 'assert';
import { Result } from '../../lib/utils';

describe('Result', () => {
    const okResult = Result.Ok('ok');
    const errResult = Result.Err('error');
    const returnOne = () => 1;

    it('Unwraps Ok', () => {
        equal(okResult.unwrap(), 'ok');
    });

    it('Throws if unwrapping Err as Ok', () => {
        throws(() => errResult.unwrap());
    });

    it ('Unwraps Err', () => {
        equal(errResult.unwrapErr(), 'error');
    });

    it('Throws if unwrapping Ok as Err', () => {
        throws(() => okResult.unwrapErr());
    });

    it('Matches Ok', () => {
        okResult.match({
            ok: data => equal(data, 'ok'),
            err: fail
        });
    });

    it('Matches Err', () => {
        errResult.match({
            ok: fail,
            err: data => equal(data, 'error')
        });
    });

    it('Maps Ok', () => {
        equal(okResult.map(returnOne).unwrap(), 1);
    });

    it('Maps Ok when Err', () => {
        equal(errResult.map(returnOne).unwrapErr(), 'error');
    });

    it('Maps Err', () => {
        equal(errResult.mapErr(returnOne).unwrapErr(), 1);
    });

    it('Maps Err when Ok', () => {
        equal(okResult.mapErr(returnOne).unwrap(), 'ok');
    });

    it('Has a nice display string', () => {
        equal(okResult.toString(), '[Ok ok]');
        equal(errResult.toString(), '[Err error]');
    });
});
