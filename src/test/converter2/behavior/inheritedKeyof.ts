export interface Events {
    data: string;
    error: Error;
}

export class Evented<EventType> {
    on<T extends keyof EventType>(type: T): this {
        return this;
    }

    listens(type: keyof EventType): boolean {
        return !!type;
    }
}

export class Source extends Evented<Events> {}

export class DerivedSource extends Source {}

export type EventNames<EventType> = Extract<keyof EventType, string>;

export class NamedEvented<EventType> {
    on<T extends EventNames<EventType>>(type: T): this {
        return this;
    }
}

export class NamedSource extends NamedEvented<Events> {}
