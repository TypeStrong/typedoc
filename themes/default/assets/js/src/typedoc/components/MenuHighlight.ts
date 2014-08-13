module typedoc
{
    /**
     * Stored element and position data of a single anchor.
     */
    interface IAnchorInfo
    {
        $link?:JQuery;

        $anchor?:JQuery;

        position:number;
    }


    /**
     * Manages the sticky state of the navigation and moves the highlight
     * to the current navigation item.
     */
    export class MenuHighlight
    {
        private anchors:IAnchorInfo[];

        private index:number = 0;


        /**
         * Create a new Navigation instance.
         */
        constructor() {
            this.createAnchors();

            $window.on('resize', () => this.updateAnchors());
            $document.on('scroll', () => this.updateHighlight());
        }


        private createAnchors() {
            this.index = 0;
            this.anchors = [{
                position: 0
            }];

            $('.tsd-navigation.secondary a').each((index, el:HTMLAnchorElement) => {
                var href = el.href;
                if (href.indexOf('#') == -1) return;
                if (href.substr(0, window.location.href.length) != window.location.href) return;

                var hash = href.substr(href.indexOf('#') + 1);
                var $anchor = $('a.anchor[name=' + hash + ']');
                if ($anchor.length == 0) return;

                this.anchors.push({
                    $link:    $(el.parentNode),
                    $anchor:  $anchor,
                    position: 0
                });
            });

            this.updateAnchors();
        }


        private updateAnchors() {
            var anchor;
            for (var index = 1, count = this.anchors.length; index < count; index++) {
                anchor = this.anchors[index];
                anchor.position = anchor.$anchor.offset().top;
            }

            this.anchors.sort((a, b) => {
                return a.position - b.position;
            });

            this.updateHighlight();
        }


        private updateHighlight() {
            var position = $document.scrollTop();
            var anchors  = this.anchors;
            var index    = this.index;
            var count    = anchors.length - 1;

            while (index > 0 && anchors[index].position > position) {
                index -= 1;
            }

            while (index < count && anchors[index + 1].position < position) {
                index += 1;
            }

            if (this.index != index) {
                if (this.index > 0) this.anchors[this.index].$link.removeClass('focus');
                this.index = index;
                if (this.index > 0) this.anchors[this.index].$link.addClass('focus');
            }
        }
    }


    export var menuHighlight = new MenuHighlight();
}
