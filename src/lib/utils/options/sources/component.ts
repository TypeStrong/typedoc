import {Component, ComponentEvent, AbstractComponent, ChildableComponent} from "../../component";
import {OptionsComponent} from "../options";


@Component({name:"options:component"})
export class ComponentSource extends OptionsComponent
{
    private knownComponents:string[];


    protected initialize() {
        this.knownComponents = [];
        this.addComponent(this.application);

        this.listenTo(this.application, {
            [ComponentEvent.ADDED]:   this.onComponentAdded,
            [ComponentEvent.REMOVED]: this.onComponentRemoved,
        });
    }


    private addComponent(component:AbstractComponent<any>) {
        var name = component.componentName;
        if (!name) {
            this.application.logger.error("Component without name found.");
            return;
        }

        if (this.knownComponents.indexOf(name) === -1) {
            this.knownComponents.push(name);
            this.owner.addDeclarations(component.getOptionDeclarations());
        }

        if (component instanceof ChildableComponent) {
            for (var child of component.getComponents()) {
                this.addComponent(child);
            }
        }
    }


    private removeComponent(component:AbstractComponent<any>) {
        var name = component.componentName;
        var index = this.knownComponents.indexOf(name);
        if (index != -1) {
            this.knownComponents.slice(index, 1);
            for (var declaration of component.getOptionDeclarations()) {
                this.owner.removeDeclarationByName(declaration.name);
            }
        }

        if (component instanceof ChildableComponent) {
            for (var child of component.getComponents()) {
                this.removeComponent(child);
            }
        }
    }


    private onComponentAdded(e:ComponentEvent) {
        this.addComponent(e.component);
    }


    private onComponentRemoved(e:ComponentEvent) {
        var declarations = e.component.getOptionDeclarations();
        for (var declaration of declarations) {
            this.owner.removeDeclarationByName(declaration.name);
        }
    }
}
