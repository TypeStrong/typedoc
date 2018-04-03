module typedoc
{
    /**
     * Enabled simple toggle buttons.
     */
    class Toggle extends Backbone.View<any>
    {
        active:boolean;

        className:string;


        constructor(options:Backbone.ViewOptions<any>) {
            super(options);

            this.className = this.$el.attr('data-toggle');
            this.$el.on(pointerUp, (e) => this.onPointerUp(e));
            this.$el.on('click', (e) => e.preventDefault());
            $document.on(pointerDown, (e) => this.onDocumentPointerDown(e));
            $document.on(pointerUp, (e) => this.onDocumentPointerUp(e));
        }


        setActive(value:boolean) {
            if (this.active == value) return;
            this.active = value;

            $html.toggleClass('has-' + this.className, value);
            this.$el.toggleClass('active', value);

            var transition = (this.active ? 'to-has-' : 'from-has-') + this.className;
            $html.addClass(transition);
            setTimeout(() => $html.removeClass(transition), 500);
        }


        onPointerUp(event:JQueryMouseEventObject) {
            if (hasPointerMoved) return;
            this.setActive(true);
            event.preventDefault();
        }


        onDocumentPointerDown(e:JQueryMouseEventObject) {
            if (this.active) {
                var $path = $(e.target).parents().addBack();
                if ($path.hasClass('col-menu')) {
                    return;
                }

                if ($path.hasClass('tsd-filter-group')) {
                    return;
                }

                this.setActive(false);
            }
        }

        onDocumentPointerUp(e:JQueryMouseEventObject) {
            if (hasPointerMoved) return;
            if (this.active) {
                var $path = $(e.target).parents().addBack();
                if ($path.hasClass('col-menu')) {
                    var $link = $path.filter('a');
                    if ($link.length) {
                        var href = window.location.href;
                        if (href.indexOf('#') != -1) {
                            href = href.substr(0, href.indexOf('#'));
                        }
                        if ($link.prop('href').substr(0, href.length) == href) {
                            setTimeout(() => this.setActive(false), 250);
                        }
                    }
                }
            }
        }
    }


    /**
     * Register this component.
     */
    registerComponent(Toggle, 'a[data-toggle]');
}