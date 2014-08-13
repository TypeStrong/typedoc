var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var typedoc;
(function (typedoc) {
    

    

    var services = [];

    var components = [];

    typedoc.$document = $(document);

    typedoc.$window = $(window);

    typedoc.$body = $('body');

    function registerService(constructor, name, priority) {
        if (typeof priority === "undefined") { priority = 0; }
        services.push({
            constructor: constructor,
            name: name,
            priority: priority,
            instance: null
        });

        services.sort(function (a, b) {
            return a.priority - b.priority;
        });
    }
    typedoc.registerService = registerService;

    function registerComponent(constructor, selector, priority, namespace) {
        if (typeof priority === "undefined") { priority = 0; }
        if (typeof namespace === "undefined") { namespace = '*'; }
        components.push({
            selector: selector,
            constructor: constructor,
            priority: priority,
            namespace: namespace
        });

        components.sort(function (a, b) {
            return a.priority - b.priority;
        });
    }
    typedoc.registerComponent = registerComponent;

    if (typeof Backbone != 'undefined') {
        typedoc['Events'] = (function () {
            var res = function () {
            };
            _.extend(res.prototype, Backbone.Events);
            return res;
        })();
    }

    var Application = (function (_super) {
        __extends(Application, _super);
        function Application() {
            _super.call(this);

            this.createServices();
            this.createComponents(typedoc.$body);
        }
        Application.prototype.createServices = function () {
            _(services).forEach(function (c) {
                c.instance = new c.constructor();
                typedoc[c.name] = c.instance;
            });
        };

        Application.prototype.createComponents = function ($context, namespace) {
            if (typeof namespace === "undefined") { namespace = 'default'; }
            var result = [];
            _(components).forEach(function (c) {
                if (c.namespace != namespace && c.namespace != '*') {
                    return;
                }

                $context.find(c.selector).each(function (m, el) {
                    var $el = $(el), instance;
                    if (instance = $el.data('component')) {
                        if (_(result).indexOf(instance) == -1) {
                            result.push(instance);
                        }
                    } else {
                        instance = new c.constructor({ el: el });
                        $el.data('component', instance);
                        result.push(instance);
                    }
                });
            });

            return result;
        };
        return Application;
    })(typedoc.Events);
    typedoc.Application = Application;
})(typedoc || (typedoc = {}));
var typedoc;
(function (typedoc) {
    var $html = $('html');

    var FilterOption = (function () {
        function FilterOption(key, value) {
            var _this = this;
            this.$checkbox = $('#tsd-filter-' + key);
            this.key = key;
            this.value = value;
            this.defaultValue = value;

            if (window.localStorage[key] && window.localStorage[key] != value) {
                this.value = (window.localStorage[key] == 'true');
                this.$checkbox.prop('checked', this.value);

                $html.toggleClass('toggle-' + this.key, this.value != this.defaultValue);
            }

            this.$checkbox.on('change', function () {
                return _this.onCheckboxChanged();
            });
        }
        FilterOption.prototype.onCheckboxChanged = function () {
            this.value = this.$checkbox.prop('checked');
            window.localStorage[this.key] = (this.value ? 'true' : 'false');

            $html.toggleClass('toggle-' + this.key, this.value != this.defaultValue);
        };
        return FilterOption;
    })();

    var Filter = (function () {
        function Filter() {
            this.optionInherited = new FilterOption('inherited', true);
            this.optionPrivate = new FilterOption('private', true);
            this.optionExternals = new FilterOption('externals', true);
            this.optionOnlyExported = new FilterOption('only-exported', false);
        }
        Filter.isSupported = function () {
            try  {
                return typeof window.localStorage != 'undefined';
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
})(typedoc || (typedoc = {}));
var typedoc;
(function (typedoc) {
    

    var MenuHighlight = (function () {
        function MenuHighlight() {
            var _this = this;
            this.index = 0;
            this.createAnchors();

            typedoc.$window.on('resize', function () {
                return _this.updateAnchors();
            });
            typedoc.$document.on('scroll', function () {
                return _this.updateHighlight();
            });
        }
        MenuHighlight.prototype.createAnchors = function () {
            var _this = this;
            this.index = 0;
            this.anchors = [{
                    position: 0
                }];

            $('.tsd-navigation.secondary a').each(function (index, el) {
                var href = el.href;
                if (href.indexOf('#') == -1)
                    return;
                if (href.substr(0, window.location.href.length) != window.location.href)
                    return;

                var hash = href.substr(href.indexOf('#') + 1);
                var $anchor = $('a.anchor[name=' + hash + ']');
                if ($anchor.length == 0)
                    return;

                _this.anchors.push({
                    $link: $(el.parentNode),
                    $anchor: $anchor,
                    position: 0
                });
            });

            this.updateAnchors();
        };

        MenuHighlight.prototype.updateAnchors = function () {
            var anchor;
            for (var index = 1, count = this.anchors.length; index < count; index++) {
                anchor = this.anchors[index];
                anchor.position = anchor.$anchor.offset().top;
            }

            this.anchors.sort(function (a, b) {
                return a.position - b.position;
            });

            this.updateHighlight();
        };

        MenuHighlight.prototype.updateHighlight = function () {
            var position = typedoc.$document.scrollTop();
            var anchors = this.anchors;
            var index = this.index;
            var count = anchors.length - 1;

            while (index > 0 && anchors[index].position > position) {
                index -= 1;
            }

            while (index < count && anchors[index + 1].position < position) {
                index += 1;
            }

            if (this.index != index) {
                if (this.index > 0)
                    this.anchors[this.index].$link.removeClass('focus');
                this.index = index;
                if (this.index > 0)
                    this.anchors[this.index].$link.addClass('focus');
            }
        };
        return MenuHighlight;
    })();
    typedoc.MenuHighlight = MenuHighlight;

    typedoc.menuHighlight = new MenuHighlight();
})(typedoc || (typedoc = {}));
var typedoc;
(function (typedoc) {
    var StickyMode;
    (function (StickyMode) {
        StickyMode[StickyMode["None"] = 0] = "None";

        StickyMode[StickyMode["Secondary"] = 1] = "Secondary";

        StickyMode[StickyMode["Current"] = 2] = "Current";
    })(StickyMode || (StickyMode = {}));

    var MenuSticky = (function (_super) {
        __extends(MenuSticky, _super);
        function MenuSticky(options) {
            _super.call(this, options);
            this.state = '';
            this.stickyMode = 0 /* None */;

            this.$current = this.$el.find('> ul.current');
            this.$navigation = this.$el.parents('.col-4');
            this.$container = this.$el.parents('.row');

            this.listenTo(typedoc.viewport, 'resize', this.onResize);
            this.listenTo(typedoc.viewport, 'scroll', this.onScroll);

            this.onResize(typedoc.viewport.width, typedoc.viewport.height);
        }
        MenuSticky.prototype.setState = function (state) {
            if (this.state == state)
                return;

            if (this.state != '')
                this.$el.removeClass(this.state);
            this.state = state;
            if (this.state != '')
                this.$el.addClass(this.state);
        };

        MenuSticky.prototype.onResize = function (width, height) {
            this.stickyMode = 0 /* None */;
            this.setState('');

            var containerHeight = this.$container.height();
            if (this.$navigation.height() < containerHeight) {
                var elHeight = this.$el.height();
                var elTop = this.$el.offset().top;

                if (this.$current.length) {
                    var currentHeight = this.$current.height();
                    var currentTop = this.$current.offset().top;

                    this.$el.css('top', elTop - currentTop + 20);
                    if (currentHeight < height) {
                        var bottom = this.$container.offset().top + containerHeight;
                        this.stickyMode = 2 /* Current */;
                        this.stickyTop = currentTop;
                        this.stickyBottom = bottom - elHeight + (currentTop - elTop) - 40;
                    }
                }

                if (elHeight < height) {
                    this.stickyMode = 1 /* Secondary */;
                    this.stickyTop = elTop;
                }
            }

            this.onScroll(typedoc.viewport.scrollTop);
        };

        MenuSticky.prototype.onScroll = function (scrollTop) {
            if (this.stickyMode == 2 /* Current */) {
                if (scrollTop > this.stickyBottom) {
                    this.setState('sticky-bottom');
                } else {
                    this.setState(scrollTop + 20 > this.stickyTop ? 'sticky-current' : '');
                }
            } else if (this.stickyMode == 1 /* Secondary */) {
                this.setState(scrollTop + 20 > this.stickyTop ? 'sticky' : '');
            }
        };
        return MenuSticky;
    })(Backbone.View);
    typedoc.MenuSticky = MenuSticky;

    typedoc.registerComponent(MenuSticky, '.tsd-navigation.secondary');
})(typedoc || (typedoc = {}));
var typedoc;
(function (typedoc) {
    (function (search) {
        var SearchLoadingState;
        (function (SearchLoadingState) {
            SearchLoadingState[SearchLoadingState["Idle"] = 0] = "Idle";
            SearchLoadingState[SearchLoadingState["Loading"] = 1] = "Loading";
            SearchLoadingState[SearchLoadingState["Ready"] = 2] = "Ready";
            SearchLoadingState[SearchLoadingState["Failure"] = 3] = "Failure";
        })(SearchLoadingState || (SearchLoadingState = {}));

        var $el = $('#tsd-search');

        var $field = $('#tsd-search-field');

        var $results = $('.results');

        var base = $el.attr('data-base') + '/';

        var query = '';

        var loadingState = 0 /* Idle */;

        var hasFocus = false;

        var preventPress = false;

        var index;

        function createIndex() {
            index = new lunr.Index();
            index.pipeline.add(lunr.trimmer);

            index.field('name', { boost: 10 });
            index.field('parent');
            index.ref('id');

            var rows = search.data.rows;
            var pos = 0;
            var length = rows.length;
            function batch() {
                var cycles = 0;
                while (cycles++ < 100) {
                    index.add(rows[pos]);
                    if (++pos == length) {
                        return setLoadingState(2 /* Ready */);
                    }
                }
                setTimeout(batch, 10);
            }

            batch();
        }

        function loadIndex() {
            if (loadingState != 0 /* Idle */)
                return;
            setTimeout(function () {
                if (loadingState == 0 /* Idle */) {
                    setLoadingState(1 /* Loading */);
                }
            }, 500);

            if (typeof search.data != 'undefined') {
                createIndex();
            } else {
                $.get($el.attr('data-index')).done(function (source) {
                    eval(source);
                    createIndex();
                }).fail(function () {
                    setLoadingState(3 /* Failure */);
                });
            }
        }

        function updateResults() {
            if (loadingState != 2 /* Ready */)
                return;
            $results.empty();

            var res = index.search(query);
            for (var i = 0, c = Math.min(10, res.length); i < c; i++) {
                var row = search.data.rows[res[i].ref];
                var name = row.name;
                if (row.parent)
                    name = '<span class="parent">' + row.parent + '.</span>' + name;
                $results.append('<li class="' + row.classes + '"><a href="' + base + row.url + '" class="tsd-kind-icon">' + name + '</li>');
            }
        }

        function setLoadingState(value) {
            if (loadingState == value)
                return;

            $el.removeClass(SearchLoadingState[loadingState].toLowerCase());
            loadingState = value;
            $el.addClass(SearchLoadingState[loadingState].toLowerCase());

            if (value == 2 /* Ready */) {
                updateResults();
            }
        }

        function setHasFocus(value) {
            if (hasFocus == value)
                return;
            hasFocus = value;
            $el.toggleClass('has-focus');

            if (!value) {
                $field.val(query);
            } else {
                setQuery('');
                $field.val('');
            }
        }

        function setQuery(value) {
            query = $.trim(value);
            updateResults();
        }

        function setCurrentResult(dir) {
            var $current = $results.find('.current');
            if ($current.length == 0) {
                $results.find(dir == 1 ? 'li:first-child' : 'li:last-child').addClass('current');
            } else {
                var $rel = dir == 1 ? $current.next('li') : $current.prev('li');
                if ($rel.length > 0) {
                    $current.removeClass('current');
                    $rel.addClass('current');
                }
            }
        }

        function gotoCurrentResult() {
            var $current = $results.find('.current');

            if ($current.length == 0) {
                $current = $results.find('li:first-child');
            }

            if ($current.length > 0) {
                window.location.href = $current.find('a').prop('href');
                $field.blur();
            }
        }

        $field.on('focusin', function () {
            setHasFocus(true);
            loadIndex();
        }).on('focusout', function () {
            setTimeout(function () {
                return setHasFocus(false);
            }, 100);
        }).on('input', function () {
            setQuery($.trim($field.val()));
        }).on('keydown', function (e) {
            if (e.keyCode == 13 || e.keyCode == 27 || e.keyCode == 38 || e.keyCode == 40) {
                preventPress = true;
                e.preventDefault();

                if (e.keyCode == 13) {
                    gotoCurrentResult();
                } else if (e.keyCode == 27) {
                    $field.blur();
                } else if (e.keyCode == 38) {
                    setCurrentResult(-1);
                } else if (e.keyCode == 40) {
                    setCurrentResult(1);
                }
            } else {
                preventPress = false;
            }
        }).on('keypress', function (e) {
            if (preventPress)
                e.preventDefault();
        });

        $('body').on('keydown', function (e) {
            if (e.altKey || e.ctrlKey || e.metaKey)
                return;
            if (!hasFocus && e.keyCode > 47 && e.keyCode < 112) {
                $field.focus();
            }
        });
    })(typedoc.search || (typedoc.search = {}));
    var search = typedoc.search;
})(typedoc || (typedoc = {}));
var typedoc;
(function (typedoc) {
    $('.tsd-signatures').each(function (n, el) {
        var $signatures, $descriptions;

        function init() {
            var $el = $(el);
            $signatures = $el.find('> .tsd-signature');
            if ($signatures.length < 2) {
                return false;
            }

            var $cn = $el.siblings('.tsd-descriptions');
            $descriptions = $cn.find('> .tsd-description');

            $el.addClass('active');
            $cn.addClass('active');
            return true;
        }

        function setIndex(index) {
            $signatures.removeClass('current').eq(index).addClass('current');
            $descriptions.removeClass('current').eq(index).addClass('current');
        }

        if (init()) {
            $signatures.on('click', function (e) {
                setIndex($signatures.index(e.currentTarget));
            });

            setIndex(0);
        }
    });
})(typedoc || (typedoc = {}));
var typedoc;
(function (typedoc) {
    var Viewport = (function (_super) {
        __extends(Viewport, _super);
        function Viewport() {
            var _this = this;
            _super.call(this);
            this.scrollTop = 0;
            this.width = 0;
            this.height = 0;
            typedoc.$window.on('scroll', _(function () {
                return _this.onScroll();
            }).throttle(10));
            typedoc.$window.on('resize', _(function () {
                return _this.onResize();
            }).throttle(10));

            this.onResize();
            this.onScroll();
        }
        Viewport.prototype.onResize = function () {
            this.width = typedoc.$window.width();
            this.height = typedoc.$window.height();
            this.trigger('resize', this.width, this.height);
        };

        Viewport.prototype.onScroll = function () {
            this.scrollTop = typedoc.$window.scrollTop();
            this.trigger('scroll', this.scrollTop);
        };
        return Viewport;
    })(typedoc.Events);
    typedoc.Viewport = Viewport;

    typedoc.viewport;
    typedoc.registerService(Viewport, 'viewport');
})(typedoc || (typedoc = {}));
var typedoc;
(function (typedoc) {
    typedoc.app = new typedoc.Application();
})(typedoc || (typedoc = {}));
