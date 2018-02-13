import { OptionsComponent } from '../options';
export declare class ComponentSource extends OptionsComponent {
    private knownComponents;
    protected initialize(): void;
    private addComponent(component);
    private removeComponent(component);
    private onComponentAdded(e);
    private onComponentRemoved(e);
}
