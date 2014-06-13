var theme;
(function (theme) {
    var $html = $('html');

    var FilterOption = (function () {
        function FilterOption(key, value) {
            var _this = this;
            this.$checkbox = $('#tsd-filter-' + key);
            this.key = key;
            this.value = value;
            this.defaultValue = value;

            if (localStorage[key] && localStorage[key] != value) {
                this.value = (localStorage[key] == 'true');
                this.$checkbox.prop('checked', this.value);

                console.log(this.key, this.value);
                $html.toggleClass('toggle-' + this.key, this.value != this.defaultValue);
            }

            this.$checkbox.on('change', function () {
                return _this.onCheckboxChanged();
            });
        }
        FilterOption.prototype.onCheckboxChanged = function () {
            this.value = this.$checkbox.prop('checked');
            localStorage[this.key] = (this.value ? 'true' : 'false');
            console.log('CHANGE', this.key, this.value);

            $html.toggleClass('toggle-' + this.key, this.value != this.defaultValue);
        };
        return FilterOption;
    })();

    var Filter = (function () {
        function Filter() {
            this.optionInherited = new FilterOption('inherited', true);
            this.optionPrivate = new FilterOption('private', true);
            this.optionOnlyExported = new FilterOption('only-exported', false);
        }
        Filter.isSupported = function () {
            try  {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        };
        return Filter;
    })();

    if (Filter.isSupported()) {
        new Filter();
    } else {
        $html.addClass('no-filter');
    }
})(theme || (theme = {}));
var theme;
(function (theme) {
    var search;
    (function (search) {
        var $el = $('#tsd-search');

        var $field = $('#tsd-search-field');

        var index;

        $field.on('focusin', function () {
            $field.off('focusin');
            $.getJSON($el.attr('data-index'), function (data) {
                index = lunr(function () {
                    this.field('name', { boost: 10 });
                    this.field('body');
                    this.ref('id');
                });

                var rows = data.rows;
                for (var n = 0, c = 10; n < c; n++) {
                    index.add(rows[n]);
                }
            });
        });

        $field.on('change', function () {
            console.log(index);
        });
    })(search || (search = {}));
})(theme || (theme = {}));
