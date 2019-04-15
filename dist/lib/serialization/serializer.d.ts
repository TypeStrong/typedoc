import { ChildableComponent } from '../utils';
import { Component, ComponentClass } from '../utils/component';
import { Application } from '../application';
import { ProjectReflection } from '../models';
import { SerializerComponent } from './components';
export declare class Serializer extends ChildableComponent<Application, SerializerComponent<any>> {
    static EVENT_BEGIN: string;
    static EVENT_END: string;
    private router;
    private routes;
    initialize(): void;
    addComponent<T extends SerializerComponent<any> & Component>(name: string, componentClass: T | ComponentClass<T>): T;
    removeComponent(name: string): SerializerComponent<any> | undefined;
    removeAllComponents(): void;
    toObject(value: any, obj?: any): any;
    projectToObject(value: ProjectReflection, eventData?: {
        begin?: any;
        end?: any;
    }): any;
    private findRoutes;
}
