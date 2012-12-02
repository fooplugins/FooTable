/*!
 * FooTable - Awesome Responsive Tables
 * http://themergency.com/footable
 *
 * Requires jQuery - http://jquery.com/
 *
 * Copyright 2012 Steven Usher & Brad Vincent
 * Released under the MIT license
 * You are free to use FooTable in commercial projects as long as this copyright header is left intact.
 *
 * Date: 15 Nov 2012
 */
(function ($, w, undefined) {
  w.footable = {
    options: {
      delay: 100, // The number of millseconds to wait before triggering the react event
      breakpoints: { // The different screen resolution breakpoints
        phone: 480,
        tablet: 1024
      },
      parsers: {  // The default parser to parse the value out of a cell (values are used in building up row detail)
        alpha: function (cell) {
          return $(cell).data('value') || $.trim($(cell).text());
        }
      },
      toggleSelector: ' > tbody > tr:not(.footable-row-detail)', //the selector to show/hide the detail row
      createDetail: function (element, data) {  //creates the contents of the detail row
        for (var i = 0; i < data.length; i++) {
          element.append('<div><strong>' + data[i].name + '</strong> : ' + data[i].display + '</div>');
        }
      },
      debug: false // Whether or not to log information to the console.
    },
    
    version: {
      major: 0, minor: 1,
      toString: function () {
        return w.footable.version.major + '.' + w.footable.version.minor;
      },
      parse: function (str) {
        version = /(\d+)\.?(\d+)?\.?(\d+)?/.exec(str);
        return {
          major: parseInt(version[1]) || 0,
          minor: parseInt(version[2]) || 0,
          patch: parseInt(version[3]) || 0
        };
      }
    },
    
    plugins: {
      _validate: function (plugin) {
        ///<summary>Simple validation of the <paramref name="plugin"/> to make sure any members called by Foobox actually exist.</summary>
        ///<param name="plugin">The object defining the plugin, this should implement a string property called "name" and a function called "init".</param>
        
        if (typeof plugin['name'] !== 'string') {
          if (w.footable.options.debug == true) console.error('Validation failed, plugin does not implement a string property called "name".', plugin);
          return false;
        }
        if (!$.isFunction(plugin['init'])) {
          if (w.footable.options.debug == true) console.error('Validation failed, plugin "' + plugin['name'] + '" does not implement a function called "init".', plugin);
          return false;
        }
        if (w.footable.options.debug == true) console.log('Validation succeeded for plugin "' + plugin['name'] + '".', plugin);
        return true;
      },
      registered: [], // An array containing all registered plugins.
      register: function (plugin, options) {
        ///<summary>Registers a <paramref name="plugin"/> and its default <paramref name="options"/> with Foobox.</summary>
        ///<param name="plugin">The plugin that should implement a string property called "name" and a function called "init".</param>
        ///<param name="options">The default options to merge with the Foobox's base options.</param>

        if (w.footable.plugins._validate(plugin)) {
          w.footable.plugins.registered.push(plugin);
          if (options != undefined && typeof options === 'object') $.extend(true, w.footable.options, options);
          if (w.footable.options.debug == true) console.log('Plugin "' + plugin['name'] + '" has been registered with the Foobox.', plugin);
        }
      },
      init: function (instance) {
        ///<summary>Loops through all registered plugins and calls the "init" method supplying the current <paramref name="instance"/> of the Foobox as the first parameter.</summary>
        ///<param name="instance">The current instance of the Foobox that the plugin is being initialized for.</param>

        for(var i = 0; i < w.footable.plugins.registered.length; i++){
          try {
            w.footable.plugins.registered[i]['init'](instance);
          } catch(err) {
            if (w.footable.options.debug == true) console.error(err);
          }
        }
      }
    }
  };
  
  var instanceCount = 0;
  
  $.fn.footable = function(options) {
    ///<summary>The main constructor call to initialize the plugin using the supplied <paramref name="options"/>.</summary>
    ///<param name="options">
    ///<para>A JSON object containing user defined options for the plugin to use. Any options not supplied will have a default value assigned.</para>
    ///<para>Check the documentation or the default options object above for more information on available options.</para>
    ///</param>
    
    options=options||{};
    var o=$.extend(true,{},w.footable.options,options); //merge user and default options
    return this.each(function () {
      instanceCount++;
      this.footable = new Footable(this, o, instanceCount);
    });
  };

  //helper for using timeouts
  function Timer() {
    ///<summary>Simple timer object created around a timeout.</summary>
    var t=this;
    t.id=null;
    t.busy=false;
    t.start=function (code,milliseconds) {
      ///<summary>Starts the timer and waits the specified amount of <paramref name="milliseconds"/> before executing the supplied <paramref name="code"/>.</summary>
      ///<param name="code">The code to execute once the timer runs out.</param>
      ///<param name="milliseconds">The time in milliseconds to wait before executing the supplied <paramref name="code"/>.</param>
      
      if (t.busy) {return;}
      t.stop();
      t.id=setTimeout(function () {
        code();
        t.id=null;
        t.busy=false;
      },milliseconds);
      t.busy=true;
    };
    t.stop=function () {
      ///<summary>Stops the timer if its runnning and resets it back to its starting state.</summary>
      
      if(t.id!=null) {
        clearTimeout(t.id);
        t.id=null;
        t.busy=false;
      }
    };
  };

  function Footable(t, o, id) {
    ///<summary>Inits a new instance of the plugin.</summary>
    ///<param name="t">The main table element to apply this plugin to.</param>
    ///<param name="o">The options supplied to the plugin. Check the defaults object to see all available options.</param>
    ///<param name="id">The id to assign to this instance of the plugin.</param>
    
    var ft = this;
    ft.id = id;
    ft.table = t;
    ft.options = o;
    ft.breakpoints = [];
    ft.breakpointNames = '';
    ft.columns = { };

    // This object simply houses all the timers used in the footable.
    ft.timers = {
      resize: new Timer(),
      register: function (name) {
        ft.timers[name] = new Timer();
        return ft.timers[name];
      }
    };
    
    w.footable.plugins.init(ft);

    ft.init = function() {
      var $window = $(w), $table = $(ft.table).addClass('footable-loading');

      // Get the column data once for the life time of the plugin
      $table.find('> thead > tr > th').each(function() {
        var data = ft.getColumnData(this);
        ft.columns[data.index] = data;
      });

      // Create a nice friendly array to work with out of the breakpoints object.
      for(var name in ft.options.breakpoints) {
        ft.breakpoints.push({ 'name': name, 'width': ft.options.breakpoints[name] });
        ft.breakpointNames += (name + ' ');
      }
      
      // Sort the breakpoints so the smallest is checked first
      ft.breakpoints.sort(function(a, b) { return a['width'] - b['width']; });
      
      $table.on('click', ft.options.toggleSelector, function (e) {
        if ($table.is('.breakpoint')) {
          var $row = $(this).is('tr') ? $(this) : $(this).parents('tr:first');
          ft.toggleDetail($row.get(0));
        }
      });
      
      ft.raise('footable_initializing');
      
      $table.on('footable_initialized', function (e) {
        //resize the footable onload
        ft.resize();
        
        //remove the loading class
        $table.removeClass('footable-loading');
      
        //hides all elements within the table that have the attribute data-hide="init"
        $table.find('[data-init="hide"]').hide();
        $table.find('[data-init="show"]').show();
      });
      
      $window
        .bind('resize.footable', function () {
          ft.timers.resize.stop();
          ft.timers.resize.start(function() {
            ft.raise('footable_resizing');
            ft.resize();
            ft.raise('footable_resized');
          }, ft.options.delay);
        });

      ft.raise('footable_initialized');
    };

    ft.parse = function(cell, column) {
      var parser = ft.options.parsers[column.type] || ft.options.parsers.alpha;
      return parser(cell);
    };

    ft.getColumnData = function(th) {
      var $th = $(th), hide = $th.data('hide');
      hide = hide || '';
      hide = hide.split(',');
      var data = {
        'index': $th.index(),
        'hide': { },
        'type': $th.data('type') || 'alpha',
        'name': $th.data('name') || $.trim($th.text()),
        'ignore': $th.data('ignore') || false,
        'className': $th.data('class') || null
      };
      data.hide['default'] = ($.inArray('default', hide) >= 0);
      
      for(var name in ft.options.breakpoints) {
        data.hide[name] = ($.inArray(name, hide) >= 0);
      }
      var e = ft.raise('footable_column_data', { 'column': { 'data': data, 'th': th } });
      return e.column.data;
    };

    ft.resize = function() {
      var $table = $(ft.table);
      var info = {
        'width': $table.width(),	//no longer looks at the window width
        'height': $table.height(),	//no longer looks at the window height
        'orientation': null
      };
      info.orientation = info.width > info.height ? 'landscape' : 'portrait';

      var pinfo = $table.data('footable_info');
      $table.data('footable_info', info);

      // This (if) statement is here purely to make sure events aren't raised twice as mobile safari seems to do
      if (!pinfo || ((pinfo && pinfo.width && pinfo.width != info.width) || (pinfo && pinfo.height && pinfo.height != info.height))) {
        var current = null, breakpoint;
        for (var i = 0; i < ft.breakpoints.length; i++) {
          breakpoint = ft.breakpoints[i];
          if (breakpoint && breakpoint.width && info.width <= breakpoint.width) {
            current = breakpoint;
            break;
          }
        }
        var breakpointName = (current == null ? 'default' : current['name']);
        $table
          .removeClass('default breakpoint').removeClass(ft.breakpointNames)
          .addClass(breakpointName + (current == null ? '' : ' breakpoint'))
          .find('> thead > tr > th').each(function() {
            var data = ft.columns[$(this).index()];
            var count = data.index + 1;
            //get all the cells in the column
            var $column = $table.find('> tbody > tr > td:nth-child(' + count + ')').add(this);
            if (data.className != null) $column.not(this).not('.footable-cell-detail').addClass(data.className);
            if (data.hide[breakpointName] == false) $column.show();
            else $column.hide();
          })
          .end()
          .find('> tbody > tr.footable-detail-show').each(function() {
            ft.createOrUpdateDetailRow(this);
          });

        $table.find('> tbody > tr.footable-detail-show').each(function() {
          var $next = $(this).next();
          if ($next.hasClass('footable-row-detail')) {
            if (breakpointName == 'default') $next.hide();
            else $next.show();
          }
        });

        ft.raise('footable_breakpoint_' + breakpointName, { 'info': info });
      }
    };

    ft.toggleDetail = function(actualRow) {
      var $row = $(actualRow),
          created = ft.createOrUpdateDetailRow($row.get(0)),
          $next = $row.next();
      
      if (!created && $next.is(':visible')) {
        $row.removeClass('footable-detail-show');
        $next.hide();
      } else {
        $row.addClass('footable-detail-show');
        $next.show();
      }
    };

    ft.createOrUpdateDetailRow = function (actualRow) {
      var $row = $(actualRow), $next = $row.next(), $detail, values = [];
      $row.find('> td:hidden').each(function () {
        var column = ft.columns[$(this).index()];
        if (column.ignore == true) return true;
        values.push({ 'name': column.name, 'value': ft.parse(this, column), 'display': $.trim($(this).html()) });
      });
      var colspan = $row.find('> td:visible').length;
      var exists = $next.hasClass('footable-row-detail');
      if (!exists) { // Create
        $next = $('<tr class="footable-row-detail"><td class="footable-cell-detail"><div class="footable-row-detail-inner"></div></td></tr>');
        $row.after($next);
      }
      $next.find('> td:first').attr('colspan', colspan);
      $detail = $next.find('.footable-row-detail-inner').empty();
      ft.options.createDetail($detail, values);
      return !exists;
    };

    ft.raise = function(eventName, args) {
      args = args || { };
      var def = { 'ft': ft };
      $.extend(true, def, args);
      var e = $.Event(eventName, def);
      $(ft.table).trigger(e);
      return e;
    };
    
    ft.init();
    return ft;
  };
})(jQuery, window);