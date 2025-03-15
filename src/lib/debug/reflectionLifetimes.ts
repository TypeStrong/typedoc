/* eslint-disable no-console */
import type { Application } from "../application.js";
import { ConverterEvents } from "../converter/converter-events.js";
import { type Reflection, ReflectionKind } from "../models/index.js";

export function debugReflectionLifetimes(app: Application, kindFilter = ReflectionKind.All) {
    app.converter.on(ConverterEvents.CREATE_PROJECT, logCreate);
    app.converter.on(ConverterEvents.CREATE_SIGNATURE, logCreate);
    app.converter.on(ConverterEvents.CREATE_TYPE_PARAMETER, logCreate);
    app.converter.on(ConverterEvents.CREATE_DECLARATION, logCreate);
    app.converter.on(ConverterEvents.CREATE_DOCUMENT, logCreate);
    app.converter.on(ConverterEvents.CREATE_PARAMETER, logCreate);

    app.converter.on(ConverterEvents.CREATE_PROJECT, (_context, project) => {
        const oldRemove = project["_removeReflection"];
        project["_removeReflection"] = function (reflection) {
            if (reflection.kindOf(kindFilter)) {
                console.log("Remove", reflection.id, reflection.getFullName());
            }
            return oldRemove.call(this, reflection);
        };
    });

    function logCreate(_context: unknown, refl: Reflection) {
        if (refl.kindOf(kindFilter)) {
            console.log("Create", refl.variant, refl.id, refl.getFullName());
        }
    }
}

export function load(app: Application) {
    debugReflectionLifetimes(app);
}
