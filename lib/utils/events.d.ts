export interface IEventCallback extends Function {
    _callback?: Function;
}
export interface IEventMap {
    [name: string]: IEventCallback;
}
export declare class Event {
    private _name;
    private _isPropagationStopped;
    private _isDefaultPrevented;
    constructor(name: string);
    stopPropagation(): void;
    preventDefault(): void;
    readonly name: string;
    readonly isPropagationStopped: boolean;
    readonly isDefaultPrevented: boolean;
}
export declare class EventDispatcher {
    private _events;
    private _listeningTo;
    private _listeners;
    private _listenId;
    on(name: IEventMap | string, callback: IEventCallback, context?: any, priority?: number): this;
    private internalOn(name, callback, context?, priority?, listening?);
    once(name: IEventMap | string, callback: IEventCallback, context?: any, priority?: number): this;
    off(name: IEventMap | string, callback: IEventCallback, context?: any): this;
    listenTo(obj: EventDispatcher, name: IEventMap | string, callback?: IEventCallback, priority?: number): this;
    listenToOnce(obj: EventDispatcher, name: IEventMap | string, callback: IEventCallback, priority?: number): this;
    stopListening(obj?: EventDispatcher, name?: IEventMap | string, callback?: IEventCallback): this;
    trigger(name: Event | IEventMap | string, ...args: any[]): this;
}
