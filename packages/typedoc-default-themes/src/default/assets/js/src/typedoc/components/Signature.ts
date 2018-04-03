module typedoc
{
    /**
     * Holds a signature and its description.
     */
    class SignatureGroup
    {
        /**
         * The target signature.
         */
        $signature:JQuery;

        /**
         * The description for the signature.
         */
        $description:JQuery;


        /**
         * Create a new SignatureGroup instance.
         *
         * @param $signature    The target signature.
         * @param $description  The description for the signature.
         */
        constructor($signature, $description) {
            this.$signature   = $signature;
            this.$description = $description;
        }


        /**
         * Add the given class to all elements of the group.
         *
         * @param className  The class name to add.
         */
        addClass(className:string):SignatureGroup {
            this.$signature.addClass(className);
            this.$description.addClass(className);
            return this;
        }


        /**
         * Remove the given class from all elements of the group.
         *
         * @param className  The class name to remove.
         */
        removeClass(className:string):SignatureGroup {
            this.$signature.removeClass(className);
            this.$description.removeClass(className);
            return this;
        }
    }


    /**
     * Controls the tab like behaviour of methods and functions with multiple signatures.
     */
    class Signature extends Backbone.View<any>
    {
        /**
         * List of found signature groups.
         */
        private groups:SignatureGroup[];

        /**
         * The container holding all the descriptions.
         */
        private $container:JQuery;

        /**
         * The index of the currently displayed signature.
         */
        private index:number = -1;


        /**
         * Create a new Signature instance.
         *
         * @param options  Backbone view constructor options.
         */
        constructor(options:Backbone.ViewOptions<any>) {
            super(options);

            this.createGroups();

            if (this.groups) {
                this.$el.addClass('active')
                    .on('touchstart', '.tsd-signature', (event) => this.onClick(event))
                    .on('click', '.tsd-signature', (event) => this.onClick(event));
                this.$container.addClass('active');
                this.setIndex(0);
            }
        }


        /**
         * Set the index of the active signature.
         *
         * @param index  The index of the signature to activate.
         */
        private setIndex(index:number) {
            if (index < 0) index = 0;
            if (index > this.groups.length - 1) index = this.groups.length - 1;
            if (this.index == index) return;

            var to = this.groups[index];
            if (this.index > -1) {
                var from = this.groups[this.index];

                animateHeight(this.$container, () => {
                    from.removeClass('current').addClass('fade-out');
                    to.addClass('current fade-in');
                    viewport.triggerResize();
                });

                setTimeout(() => {
                    from.removeClass('fade-out');
                    to.removeClass('fade-in');
                }, 300);
            } else {
                to.addClass('current');
                viewport.triggerResize();
            }

            this.index = index;
        }


        /**
         * Find all signature/description groups.
         */
        private createGroups() {
            var $signatures = this.$el.find('> .tsd-signature');
            if ($signatures.length < 2) return;

            this.$container   = this.$el.siblings('.tsd-descriptions');
            var $descriptions = this.$container.find('> .tsd-description');

            this.groups = [];
            $signatures.each((index, el) => {
                this.groups.push(new SignatureGroup($(el), $descriptions.eq(index)));
            });
        }


        /**
         * Triggered when the user clicks onto a signature header.
         *
         * @param e  The related jQuery event object.
         */
        private onClick(e:JQueryMouseEventObject) {
            e.preventDefault();
            _(this.groups).forEach((group, index) => {
                if (group.$signature.is(e.currentTarget)) {
                    this.setIndex(index);
                }
            });
        }
    }


    /**
     * Register this component.
     */
    registerComponent(Signature, '.tsd-signatures');
}