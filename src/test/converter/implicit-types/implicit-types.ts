export interface IBreakpointRange { start: number; end: number }

let _breakpoints: {
    small: IBreakpointRange;
    medium: IBreakpointRange;
    large: IBreakpointRange;
    xlarge: IBreakpointRange;
    xxlarge: IBreakpointRange;
};

export function getBreakpoints() {
    if (!_breakpoints) {
        const small = 64;
        const medium = 128;
        const large = 256;
        const xlarge = 512;
        const xxlarge = 1024;

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
