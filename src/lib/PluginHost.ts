module td
{
    export interface IPluginInterface {
        remove();
    }

    export interface IPluginClass<T extends IPluginInterface> {
        new(instance:PluginHost<T>):T;
    }


    export class PluginHost<T extends IPluginInterface> extends EventDispatcher implements IParameterProvider
    {
        /**
         * List of all plugins that are attached to this host.
         */
        plugins:{[name:string]:T};

        static PLUGINS:{[name:string]:IPluginClass<IPluginInterface>};


        getParameters():IParameter[] {
            var result:IParameter[] = [];
            for (var key in this.plugins) {
                if (!this.plugins.hasOwnProperty(key)) continue;
                var plugin:IParameterProvider = <any>this.plugins[key];
                if (plugin.getParameters) {
                    result.push.call(result, plugin.getParameters());
                }
            }

            return result;
        }


        /**
         * Retrieve a plugin instance.
         *
         * @returns  The instance of the plugin or NULL if no plugin with the given class is attached.
         */
        getPlugin(name:string):T {
            if (this.plugins[name]) {
                return this.plugins[name];
            } else {
                return null;
            }
        }


        addPlugin(name:string, pluginClass:IPluginClass<T>):T {
            if (!this.plugins) this.plugins = {};
            if (this.plugins[name]) {
                return null;
            } else {
                return this.plugins[name] = new pluginClass(this);
            }
        }


        removePlugin(name:string):boolean {
            if (this.plugins[name]) {
                this.plugins[name].remove();
                delete this.plugins[name];
                return true;
            } else {
                return false;
            }
        }


        removeAllPlugins() {
            for (var name in this.plugins) {
                if (!this.plugins.hasOwnProperty(name)) continue;
                this.plugins[name].remove();
            }

            this.plugins = {};
        }


        static registerPlugin<T extends IPluginInterface>(name:string, pluginClass:IPluginClass<T>) {
            if (!this.PLUGINS) this.PLUGINS = {};
            this.PLUGINS[name] = pluginClass;
        }


        static loadPlugins<T extends IPluginInterface>(instance:PluginHost<T>) {
            for (var name in this.PLUGINS) {
                if (!this.PLUGINS.hasOwnProperty(name)) continue;
                instance.addPlugin(name, <IPluginClass<T>>this.PLUGINS[name]);
            }
        }
    }
}