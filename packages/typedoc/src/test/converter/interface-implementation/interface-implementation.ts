module Forms
{
    /**
     * Function signature of an event listener callback
     */
    interface IEventListener<T>
    {
        (parameter:T):any;
    }


    /**
     * Encapsulates a subscription to an event dispatcher, and allows for unsubscribing
     */
    interface ISubscription<T>
    {
        listener: IEventListener<T>
        priority: number
        filter: any

        /**
         * Remove this subscription from its dispatcher
         */
        unsubscribe():void
    }


    class Subscription<V> implements ISubscription<V>
    {
        constructor(public listener:IEventListener<V>, public filter:any, public priority:number, public dispatcher:EventDispatcher<V>) { }

        unsubscribe():void { }
    }


    /**
     * The main interface of the event system.
     * An IEventDispatcher is an object that keeps a list of listeners, and sends dispatches events of a certain type to them.
     * This might otherwise be known as a Signal.
     */
    export interface IEventDispatcher<U>
    {
        add(listener:IEventListener<U>, filter?:any, priority?:number):ISubscription<U>;
        remove(subscription:ISubscription<U>): void;
        dispatch(parameter:U): boolean;
        clear():void;
        hasListeners():boolean;
    }


    /**
     * Implementation of IEventDispatcher
     * @see IEventDispatcher
     */
    export class EventDispatcher<T> implements IEventDispatcher<T>
    {
        private subscriptions:ISubscription<T>[];

        add(listener:IEventListener<T>, filter:any=null, priority:number = 0):ISubscription<T> {
            return new Subscription<T>(listener, filter, priority, this);
        }

        remove(subscription:ISubscription<T>):void { }

        dispatch(event:T):boolean {
            return false;
        }

        clear():void { }

        hasListeners():boolean {
            return false;
        }
    }
}
