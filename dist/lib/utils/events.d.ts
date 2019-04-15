export interface EventCallback extends Function {
    _callback?: Function;
}
export interface EventMap {
    [name: string]: EventCallback;
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
    private _events?;
    private _listeningTo?;
    private _listeners?;
    private readonly _listenId;
    private _savedListenId?;
    on(eventMap: EventMap, context?: any): any;
    on(eventMap: EventMap, callback?: EventCallback, context?: any, priority?: number): any;
    on(name: string, callback: EventCallback, context?: any, priority?: number): any;
    private internalOn;
    once(eventMap: EventMap, context?: any): any;
    once(name: string, callback: EventCallback, context?: any, priority?: any): any;
    off(): any;
    off(eventMap: EventMap | undefined, context?: any): any;
    off(name: string | undefined, callback?: EventCallback, context?: any): any;
    listenTo(obj: EventDispatcher, name: EventMap | string, callback?: EventCallback, priority?: number): this;
    listenToOnce(obj: EventDispatcher, eventMap: EventMap): any;
    listenToOnce(obj: EventDispatcher, name: string, callback: EventCallback, priority?: number): any;
    stopListening(obj?: EventDispatcher, name?: EventMap | string, callback?: EventCallback): this;
    trigger(name: Event | EventMap | string, ...args: any[]): this;
}
