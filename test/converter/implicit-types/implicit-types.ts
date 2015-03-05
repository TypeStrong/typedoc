/// <reference path="../lib.core.d.ts" />


export interface IBreakpointRange { start: number; end: number }

var _breakpoints: {
    small: IBreakpointRange;
    medium: IBreakpointRange;
    large: IBreakpointRange;
    xlarge: IBreakpointRange;
    xxlarge: IBreakpointRange;
};

export function getBreakpoints() {
    if (!_breakpoints) {
        var small = 64;
        var medium = 128;
        var large = 256;
        var xlarge = 512;
        var xxlarge = 1024;

        _breakpoints = {
            small: { start: small, end: medium },
            medium: { start: medium, end: large },
            large: { start: large, end: xlarge },
            xlarge: { start: xlarge, end: xxlarge },
            xxlarge: { start: xxlarge, end: 999999999 }
        };
    }

    return _breakpoints;
}