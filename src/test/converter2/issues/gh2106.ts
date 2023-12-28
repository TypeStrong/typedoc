export function balance(address: string): Coin {
    return {
        amount: "",
        denom: "",
    };
}

export interface Coin {
    denom: string;
    amount: string;
}

export const Coin = {
    thisIsAValue: true,
};

export type TypeOf = typeof Coin;
