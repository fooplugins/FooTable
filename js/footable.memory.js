(function ($, w, undefined) {

    if (w.footable === undefined || w.foobox === null) {
        throw new Error('Please check and make sure footable.js is included in the page and is loaded prior to this script.');
    }

    if ($.cookie === undefined ) {
        throw new Error('Footable Memory requires jQuery $.cookie, https://github.com/carhartl/jquery-cookie');
    }

    var defaults = {
        memory: {
            enabled: false
        }
    };

    var storage = (function($){

        'use strict';

        /**
         * Stores footable bookmarkable data in a cookie
         *
         * By default will store each page in its own cookie.
         * Supports multiple FooTables per page.
         * Supports JS frameworks that use hashmap URLs (AngularJS, Ember, etc).
         *
         * For example take an example application:
         *
         *     http://example.com/application-data (2 FooTables on this page)
         *     http://example.com/application-data/#/details (1 FooTable on this page)
         *     http://example.com/other-data (1 FooTable on this page)
         *
         * Would be stored like this:
         *
         *     cookie['/application-data'] = {
         *         '/': {
         *             1: {
         *                 key1: value1,
         *                 key2: value2
         *             },
         *             2: {
         *                 key1: value1,
         *                 key2: value2
         *             }
         *         },
         *         '#/details': {
         *             1: {
         *                 key1: value1,
         *                 key2: value2
         *             }
         *         }
         *     };
         *
         *     cookie['/other-data'] = {
         *         '/': {
         *             1: {
         *                 key1: value1,
         *                 key2: value2
         *             },
         *         }
         *     }
         *
         */

        $.cookie.json = true;

        var days_to_keep_data = 7;

        var path_page = function(){
            return location.pathname;
        };

        var path_subpage = function(){
            return location.hash || '/';
        };

        var get_data = function(){
            var page = path_page(),
                data = $.cookie(page);

            return data || {};
        };

        var get_table = function(index){
            var subpage = path_subpage(),
                data = get_data();

            if( data[subpage] && data[subpage][index] ){
                return data[subpage][index];
            } else {
                return {};
            }
        };

        var set = function(index, item){
            var page = path_page(),
                subpage = path_subpage(),
                data = get_data(),
                options;

            if( !data[subpage] ){
                data[subpage] = {};
            }

            data[subpage][index] = item;

            options = {
                path: page,
                expires: days_to_keep_data
            }

            $.cookie(page, data, options);
        };

        return {
            get: function(index){
                return get_table(index);
            },
            set: function(index, item){
                set(index, item);
            }
        };

    })($);

    var state = {
        get: function(ft){

        },
        set: function(ft, data){

        }
    };

    var is_enabled = function(ft){
        return ft.options.memory.enabled
    };

    var update = function(ft, event) {
        var index = ft.id,
            data = state.get(ft);

        storage.set(index, data);
    };

    var load = function(ft){
        var index = ft.id,
            data = storage.get(index);

        state.set(ft, data);
        ft.memory_plugin_loaded = true;
    };

    function Memory() {
        var p = this;
        p.name = 'Footable Memory';
        p.init = function(ft) {
            if (is_enabled(ft)) {
                $(ft.table).bind({
                    'footable_initialized': function(){
                        load(ft);
                    },
                    'footable_page_filled footable_redrawn footable_filtered footable_sorted footable_row_expanded footable_row_collapsed': function(e) {
                        if (ft.memory_plugin_loaded) {
                            update(ft, e);
                        }
                    }
                });
            }
        };
    }

    w.footable.plugins.register(Memory, defaults);

})(jQuery, window);
