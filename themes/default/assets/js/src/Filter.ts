module tsd
{
    var $html = $('html');


    class FilterOption
    {
        private $checkbox:JQuery;

        private key:string;

        private value:boolean;

        private defaultValue:boolean;


        constructor(key:string, value:boolean) {
            this.$checkbox    = $('#tsd-filter-' + key);
            this.key          = key;
            this.value        = value;
            this.defaultValue = value;

            if (window.localStorage[key] && window.localStorage[key] != value) {
                this.value = (window.localStorage[key] == 'true');
                this.$checkbox.prop('checked', this.value);

                console.log(this.key, this.value);
                $html.toggleClass('toggle-' + this.key, this.value != this.defaultValue);
            }

            this.$checkbox.on('change', () => this.onCheckboxChanged());
        }


        private onCheckboxChanged() {
            this.value = this.$checkbox.prop('checked');
            window.localStorage[this.key] = (this.value ? 'true' : 'false');
            console.log('CHANGE', this.key, this.value);

            $html.toggleClass('toggle-' + this.key, this.value != this.defaultValue);
        }
    }


    class Filter
    {
        private optionInherited:FilterOption;

        private optionPrivate:FilterOption;

        private optionOnlyExported:FilterOption;


        constructor() {
            this.optionInherited    = new FilterOption('inherited',     true);
            this.optionPrivate      = new FilterOption('private',       true);
            this.optionOnlyExported = new FilterOption('only-exported', false);
        }


        static isSupported():boolean {
            try {
                return typeof window.localStorage != 'undefined';
            } catch (e) {
                return false;
            }
        }
    }


    if (Filter.isSupported()) {
        new Filter();
    } else {
        $html.addClass('no-filter');
    }
}