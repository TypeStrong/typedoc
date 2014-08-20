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
            super(_.defaults(options, {
                events: {
                    'click': 'onClick'
                }
            }));

            this.className = this.$el.attr('data-toggle');
            $html.on('mousedown', (e) => this.onDocumentMouseDown(e));
            $html.on('touchstart', (e) => this.onDocumentMouseDown(e));
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


        onClick(event:JQueryMouseEventObject) {
            this.setActive(true);
        }


        onDocumentMouseDown(e:JQueryMouseEventObject) {
            if (this.active) {
                var $path = $(e.target).parents().addBack();
                if ($path.hasClass('col-menu')) {
                    var $link = $path.filter('a');
                    if ($link.length) {
                        var href = window.location.href;
                        if (href.indexOf('#') != -1) {
                            href = href.substr(0, href.indexOf('#'));
                        }
                        if ($link.prop('href').substr(0, href.length) != href) {
                            return;
                        }
                    } else {
                        return;
                    }
                }

                this.setActive(false);
            }
        }
    }


    /**
     * Register this component.
     */
    registerComponent(Toggle, 'a[data-toggle]');
}