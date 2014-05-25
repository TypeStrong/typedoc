/// <reference path="../../bin/typedoc.d.ts" />

interface ITemplateMapping {
    kind:any;
    isLeaf:boolean;
    prefix:string;
    template:string;
}


export class Theme extends TypeDoc.Renderer.BaseTheme
{
    static MAPPINGS:ITemplateMapping[] = [{
        kind:     TypeDoc.Models.Kind.Class,
        isLeaf:   true,
        prefix:   'classes',
        template: 'reflection.hbs'
    },{
        kind:     TypeDoc.Models.Kind.Interface,
        isLeaf:   true,
        prefix:   'interfaces',
        template: 'reflection.hbs'
    },{
        kind:     TypeDoc.Models.Kind.Enum,
        isLeaf:   true,
        prefix:   'enums',
        template: 'reflection.hbs'
    },{
        kind:     [TypeDoc.Models.Kind.Container, TypeDoc.Models.Kind.DynamicModule],
        isLeaf:   false,
        prefix:   'modules',
        template: 'reflection.hbs'
    }];



    isOutputDirectory(dirname:string):boolean {
        if (!FS.existsSync(Path.join(dirname, 'index.html'))) return false;
        if (!FS.existsSync(Path.join(dirname, 'assets'))) return false;
        if (!FS.existsSync(Path.join(dirname, 'assets', 'js', 'main.js'))) return false;
        if (!FS.existsSync(Path.join(dirname, 'assets', 'images', 'icons.png'))) return false;

        return true;
    }


    private getMapping(reflection:TypeDoc.Models.DeclarationReflection):ITemplateMapping {
        for (var i = 0, c = Theme.MAPPINGS.length; i < c; i++) {
            var mapping = <any>Theme.MAPPINGS[i];
            if (reflection.kindOf(mapping.kind)) {
                return mapping;
            }
        }

        return null;
    }


    initialize() {
        this.project.reflections.forEach((reflection:TypeDoc.Models.DeclarationReflection) => {
            var classes = [];
            /*
            var flags = <any>Flags, classes = [];
            classes.push(classify('ts-kind-'+ Kind[this.kind]));

            if (this.parent && this.parent instanceof DeclarationReflection) {
                classes.push(classify('ts-parent-kind-'+ Kind[(<DeclarationReflection>this.parent).kind]));
            }

            for (var key in flags) {
                var num = +key;
                if (num != key || num == 0 || !flags.hasOwnProperty(key)) continue;
                if ((this.flags & num) != num) continue;
                classes.push(classify('ts-flag-'+ flags[+key]));
            }
            */

            if (reflection.inheritedFrom) classes.push('tsd-is-inherited');
            if (reflection.isPrivate)     classes.push('tsd-is-private');
            if (!reflection.isExported)   classes.push('tsd-is-not-exported');
            reflection.cssClasses = classes.join(' ');

            if (reflection.groups) {
                reflection.groups.forEach((group:TypeDoc.Models.ReflectionGroup) => {
                    var classes = [];
                    if (group.allChildrenAreInherited) classes.push('tsd-is-inherited');
                    if (group.allChildrenArePrivate)   classes.push('tsd-is-private');
                    if (!group.allChildrenAreExported) classes.push('tsd-is-not-exported');
                    group.cssClasses = classes.join(' ');
                });
            }
        });
    }


    /**
     * Build the urls for the current project.
     *
     * @returns  An array of url mappings.
     */
    getUrls():TypeDoc.Models.UrlMapping[]
    {
        var urls = [];

        var createUrl = (reflection:TypeDoc.Models.BaseReflection, to?:TypeDoc.Models.BaseReflection, separator:string = '.') => {
            var url = reflection.getAlias();
            if (reflection.parent && reflection.parent != to && !(reflection.parent instanceof TypeDoc.Models.ProjectReflection)) {
                url = createUrl(reflection.parent, to, separator) + separator + url;
            }
            return url;
        };

        var walkLeaf = (reflection:TypeDoc.Models.BaseReflection, container:TypeDoc.Models.BaseReflection) => {
            reflection.children.forEach((child) => {
                if (child.kindOf(TypeDoc.Models.Kind.Parameter)) {
                    return;
                }

                child.url = container.url + '#' + createUrl(child, container, '.');
                walkLeaf(child, container);
            });
        };

        var walkReflection = (reflection:TypeDoc.Models.BaseReflection, container:TypeDoc.Models.BaseReflection) => {
            reflection.children.forEach((child) => {
                var mapping = this.getMapping(child);
                if (mapping) {
                    child.url = Path.join(mapping.prefix, createUrl(child) + '.html');
                    child.hasOwnDocument = true;
                    urls.push(new TypeDoc.Models.UrlMapping(child.url, child, mapping.template));

                    if (mapping.isLeaf) {
                        walkLeaf(child, child);
                    } else {
                        walkReflection(child, child);
                    }
                } else {
                    child.url = container.url + '#' + createUrl(child, container, '.');
                    walkLeaf(child, container);
                }
            });
        };

        this.project.url = 'modules/_globals.html';
        urls.push(new TypeDoc.Models.UrlMapping('modules/_globals.html', this.project, 'reflection.hbs'));
        urls.push(new TypeDoc.Models.UrlMapping('index.html', this.project, 'index.hbs'));

        walkReflection(this.project, this.project);

        return urls;
    }


    getNavigation():TypeDoc.Models.NavigationItem
    {
        function walkReflection(reflection:TypeDoc.Models.DeclarationReflection, parent:TypeDoc.Models.NavigationItem) {
            var name = parent == root ? reflection.getFullName() : reflection.name;
            var item = new TypeDoc.Models.NavigationItem(name, reflection.url, parent);
            item.isPrimary = (parent == root);
            item.cssClasses = reflection.cssClasses;

            reflection.children.forEach((child) => {
                if (child.kindOf(TypeDoc.Models.Kind.SomeContainer)) return;
                walkReflection(child, item);
            });
        }


        var root = new TypeDoc.Models.NavigationItem('Index', 'index.html');
        new TypeDoc.Models.NavigationItem('<em>Globals</em>', 'modules/_globals.html', root);

        var modules = this.project.getReflectionsByKind(TypeDoc.Models.Kind.SomeContainer);
        modules.forEach((container) => walkReflection(container, root));

        return root;
    }
}