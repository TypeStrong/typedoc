"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
const component_1 = require("../../component");
const options_1 = require("../options");
let ComponentSource = class ComponentSource extends options_1.OptionsComponent {
    initialize() {
        this.knownComponents = [];
        this.addComponent(this.application);
        this.listenTo(this.application, {
            [component_1.ComponentEvent.ADDED]: this.onComponentAdded,
            [component_1.ComponentEvent.REMOVED]: this.onComponentRemoved
        });
    }
    addComponent(component) {
        const name = component.componentName;
        if (!name) {
            this.application.logger.error('Component without name found.');
            return;
        }
        if (!this.knownComponents.includes(name)) {
            this.knownComponents.push(name);
            this.owner.addDeclarations(component.getOptionDeclarations());
        }
        if (component instanceof component_1.ChildableComponent) {
            for (let child of component.getComponents()) {
                this.addComponent(child);
            }
        }
    }
    removeComponent(component) {
        let index = this.knownComponents.indexOf(component.componentName);
        if (index !== -1) {
            this.knownComponents.splice(index, 1);
            for (let declaration of component.getOptionDeclarations()) {
                this.owner.removeDeclarationByName(declaration.name);
            }
        }
        if (component instanceof component_1.ChildableComponent) {
            for (let child of component.getComponents()) {
                this.removeComponent(child);
            }
        }
    }
    onComponentAdded(e) {
        this.addComponent(e.component);
    }
    onComponentRemoved(e) {
        this.removeComponent(e.component);
    }
};
ComponentSource = __decorate([
    component_1.Component({ name: 'options:component' })
], ComponentSource);
exports.ComponentSource = ComponentSource;
//# sourceMappingURL=component.js.map