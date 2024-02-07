export interface IAnimal {
    name: number;
}

export interface IFish extends IAnimal {
    maxDepth: number;
}

export class IFish implements IFish {}
