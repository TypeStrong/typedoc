/// <reference lib="dom" />

type HtmlExtraElementProperties = {
    [K in keyof HTMLElementTagNameMap]: {
        style: string;
    };
} & {
    meta: {
        charSet: string;
    };
};

export type HtmlElements = {
    [K in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[K] &
        HtmlExtraElementProperties[K];
};

type SvgExtraElementProperties = {
    [K in keyof SVGElementTagNameMap]: {
        d: string;
        xmlns: string;
        stroke: string;
        fill: string;
    };
};

export type SvgElements = {
    [K in keyof SVGElementTagNameMap]: SVGElementTagNameMap[K] &
        SvgExtraElementProperties[K];
};
