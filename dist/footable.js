(function($, FooTable){
	// add in console we use in case it's missing
	window.console = window.console || { log:function(){}, error:function(){} };

	/**
	 * The jQuery plugin initializer.
	 * @function jQuery.fn.footable
	 * @param {(object|FooTable.Defaults)} [options] - The options to initialize the plugin with.
	 * @returns {jQuery}
	 */
	$.fn.footable = function (options) {
		options = options || {};
		// make sure we only work with tables
		return this.filter('table').each(function (i, tbl) {
			if (FooTable.exists(tbl)){
				FooTable.get(tbl).reinit(options);
			} else {
				FooTable.init(tbl, options);
			}
		});
	};

	/**
	 * Checks if the supplied table has an instance of FooTable loaded. True if the table has an instance of FooTable.
	 * @param {(jQuery|jQuery.selector|HTMLTableElement)} table - The jQuery table object, selector or the HTMLTableElement to check for FooTable.
	 * @returns {boolean}
	 */
	FooTable.exists = function(table){
		return FooTable.get(table) instanceof FooTable.Instance;
	};

	/**
	 * Gets the FooTable instance of the supplied table if one exists.
	 * @param {(jQuery|jQuery.selector|HTMLTableElement)} table - The jQuery table object, selector or the HTMLTableElement to retrieve FooTable from.
	 * @returns {FooTable.Instance}
	 */
	FooTable.get = function(table){
		return $(table).data('__FooTable__');
	};

	/**
	 * Initializes a new instance of FooTable on the supplied table.
	 * @param {(jQuery|jQuery.selector|HTMLTableElement)} table - The jQuery table object, selector or the HTMLTableElement to initialize FooTable on.
	 * @param {object} options - The options to initialize FooTable with.
	 * @returns {FooTable.Instance}
	 */
	FooTable.init = function(table, options){
		var footable = new FooTable.Instance(table, options);
		$(table).data('__FooTable__', footable);
		return footable;
	};

	FooTable.ExitEarly = function(message) {
		if (!(this instanceof FooTable.ExitEarly)) return new FooTable.ExitEarly(message);
		this.name = 'EarlyExit';
		this.message = message || 'Used to exit early from chained jQuery.Deferred without outputting anything to the console.';
	};
	FooTable.ExitEarly.prototype = new Error();
	FooTable.ExitEarly.prototype.constructor = FooTable.ExitEarly;
})(
	jQuery,
	/**
	 * The core FooTable namespace containing all the plugin code.
	 * @namespace
	 */
	FooTable = window.FooTable || {}
);
(function ($, FooTable) {
	/**
	 * The FooTable.utils namespace houses commonly used utility methods.
	 * @namespace
	 */
	FooTable.utils = {
		/**
		 * The jQuery div object used to convert a JSON object to cssText.
		 * @type {jQuery}
		 * @private
		 */
		_$jsonToCSS: $('<div/>'),
		/**
		 * Converts the supplied JSON object into a cssText string.
		 * @param {object} obj - An object containing CSS properties and values.
		 * @returns {string}
		 */
		jsonToCSS: function(obj){
			return this._$jsonToCSS.removeAttr('style').css(obj).get(0).style.cssText;
		},
		/**
		 * Wrote this as jQuery.extend merges arrays by index rather than overwriting them. This will not merge nested arrays.
		 * @param {object} base - An object that will receive the new properties if additional objects are passed in.
		 * @param {object} object1 - An object containing additional properties to merge in.
		 * @param {...object} [objectN] - Additional objects containing properties to merge in.
		 * @returns {object} - The modified base object is returned.
		 */
		merge: function (base, object1, objectN) {
			var args = Array.prototype.slice.call(arguments), i, hasOwnProperties = function (obj) {
					if (typeof obj !== 'object') { return false; }
					var prop;
					for (prop in obj) {
						if (obj.hasOwnProperty(prop)) {
							return true;
						}
					}
					return false;
				},
				merge = function (base, changes) {
					var prop;
					for (prop in changes) {
						if (changes.hasOwnProperty(prop)) {
							if (hasOwnProperties(changes[prop]) && !$.isArray(changes[prop])) {
								base[prop] = base[prop] || {};
								merge(base[prop], changes[prop]);
							} else if ($.isArray(changes[prop])) {
								base[prop] = [];
								$.extend(true, base[prop], changes[prop]);
							} else {
								base[prop] = changes[prop];
							}
						}
					}
				};
			base = args.shift();
			object1 = args.shift();
			merge(base, object1);
			for (i = 0; i < args.length; i++) {
				objectN = args[i];
				merge(base, objectN);
			}
			return base;
		},
		/**
		 * Gets the value of the property specified by the name from the supplied obj.
		 * @param {object} obj - The object to retrieve the property value from.
		 * @param {string} name - The name of the property to get. Child properties are delimited with a period [.]
		 * @returns {*} - The value of the property retrieved.
		 */
		getPropertyValue: function (obj, name) {
			if (this.strings.contains(name, '.')) {
				var propName = this.strings.until(name, '.'),
					remainder = this.strings.from(name, '.');
				obj[propName] = obj[propName] || {};
				return this.getPropertyValue(obj[propName], remainder);
			}
			return obj[name];
		},
		/**
		 * Sets the value of the property specified by the name on the supplied obj.
		 * @param {object} obj - The object to set the property value on.
		 * @param {string} name - The name of the property to set. Child properties are delimited with a period [.]
		 * @param {*} value - The value to set the property to.
		 */
		setPropertyValue: function (obj, name, value) {
			if (this.strings.contains(name, '.')) {
				var propName = this.strings.until(name, '.'),
					remainder = this.strings.from(name, '.');
				obj[propName] = obj[propName] || {};
				this.setPropertyValue(obj[propName], remainder, value);
			} else {
				obj[name] = value;
			}
		},
		/**
		 * Retrieves the specified URL parameters' value.
		 * @param {string} name - The name of the parameter to retrieve.
		 * @returns {(string|null)}
		 */
		getURLParameter: function (name) {
			return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || null;
		},
		/**
		 * @classdesc The strings namespace contains commonly used string utility methods such as {@link FooTable.utils.strings.startsWith} and {@link FooTable.utils.strings.endsWith}.
		 * @namespace
		 */
		strings: {
			/**
			 * Imitates .NET's String.format method, arguments that are not strings will be auto-converted to strings.
			 * @param {string} formatString - The format string to use.
			 * @param {*} arg1 - An argument to format the string with.
			 * @param {...*} [argN] - Additional arguments to format the string with.
			 * @returns {string}
			 */
			format: function (formatString, arg1, argN) {
				var s = arguments[0], i, reg;
				for (i = 0; i < arguments.length - 1; i++) {
					reg = new RegExp("\\{" + i + "\\}", "gm");
					s = s.replace(reg, arguments[i + 1]);
				}
				return s;
			},
			/**
			 * Checks if the supplied string is NULL or empty.
			 * @param {string} str - The string to check.
			 * @returns {boolean}
			 */
			isNullOrEmpty: function (str) {
				return str == null || typeof str !== 'string' || str.length == 0;
			},
			/**
			 * Joins the supplied string arguments together into a single string using the supplied separator.
			 * @param {string} separator - The separator to use when joining the strings.
			 * @param {string} str1 - The first string to join.
			 * @param {...string} [strN] - Additional strings to join to the first.
			 * @returns {string}
			 */
			join: function (separator, str1, strN) {
				var args = Array.prototype.slice.call(arguments);
				separator = args.shift();
				return args.join(separator);
			},
			/**
			 * Checks if the supplied string contains the given substring.
			 * @param {string} str - The string to check.
			 * @param {string} contains - The string to check for.
			 * @returns {boolean}
			 */
			contains: function (str, contains) {
				return typeof str === 'string' && str.length > 0
					&& typeof contains === 'string' && contains.length > 0 && contains.length <= str.length
					&& str.indexOf(contains) !== -1;
			},
			/**
			 * Returns the remainder of a string split on the first index of the given substring.
			 * @param {string} str - The string to split.
			 * @param {string} from - The substring to split on.
			 * @returns {string}
			 */
			from: function (str, from) {
				return this.contains(str, from) ? str.substring(str.indexOf(from) + 1) : str;
			},
			/**
			 * Returns the base of a string split on the first index of the given substring.
			 * @param {string} str - The string to split.
			 * @param {string} until - The substring to split on.
			 * @returns {string}
			 */
			until: function (str, until) {
				return this.contains(str, until) ? str.substring(0, str.indexOf(until)) : str;
			},
			/**
			 * Checks if a string ends with the supplied suffix.
			 * @param {string} str - The string to check.
			 * @param {string} suffix - The suffix to check for.
			 * @returns {boolean}
			 */
			endsWith: function (str, suffix) {
				return str.slice(-suffix.length) == suffix;
			},
			/**
			 * Checks if a string starts with the supplied prefix.
			 * @param {string} str - The string to check.
			 * @param {string} prefix - The prefix to check for.
			 * @returns {boolean}
			 */
			startsWith: function (str, prefix) {
				return str.slice(0, prefix.length) == prefix;
			},
			/**
			 * Takes the supplied text and slugify's it.
			 * @param {string} text - The text to slugify.
			 * @returns {string} The slugified text string.
			 */
			slugify: function (text) {
				return typeof text != 'string' ? '' : text.toLowerCase().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
			}
		}
	};

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	/**
	 * This namespace contains the methods and members for add-on management.
	 * @namespace
	 */
	FooTable.addons = {
		/**
		 * An array containing all registered add-ons for the plugin.
		 * @type {Array.<FooTable.AddOn>}
		 * @default []
		 */
		registered: [],
		/**
		 * Registers the specified add-on enabling a new instance of the add-on to be created for each new instance of the plugin.
		 * @param {FooTable.AddOn} addOn - The add-on to register with the plugin.
		 * @throws {TypeError} The addOn parameter must be a pointer to a class that inherits from {@link FooTable.AddOn}.
		 */
		register: function(addOn){
			if (typeof addOn !== 'function')
				throw new TypeError('The addOn parameter must be a pointer to a class that inherits from FooTable.AddOn.');
			this.registered.push(addOn);
		},
		/**
		 * Creates a new instance of each registered add-on and returns them all in an array.
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the add-on.
		 * @returns {Array}
		 */
		ctor: function(instance){
			var loaded = [];
			$.each(this.registered, function(i, addOn){
				loaded = new addOn(instance);
			});
			return loaded;
		},
		/**
		 * Gets an instance add-on by name.
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object containing the add-ons.
		 * @param {string} name - The name of the add-on to retrieve
		 * @returns {(FooTable.AddOn|null)}
		 */
		get: function(instance, name){
			var found = null;
			$.each(instance.components.addons, function(i, addOn){
				if (addOn.name === name){
					found = addOn;
					return false;
				}
			});
			return found;
		}
	};

})(jQuery, FooTable = window.FooTable || {});
(function (FooTable) {
	"use strict";

	if (typeof Object.create != 'function') {
		Object.create = (function () {
			var Object = function () {};
			return function (prototype) {
				if (arguments.length > 1)
					throw Error('Second argument not supported');

				if (typeof prototype != 'object')
					throw TypeError('Argument must be an object');

				Object.prototype = prototype;
				var result = new Object();
				Object.prototype = null;
				return result;
			};
		})();
	}

	var fnTest = /xyz/.test(function () {xyz;}) ? /\b_super\b/ : /.*/;

	/**
	 * This base implementation does nothing except provide access to the {@link FooTable.Class.extend} method for inheritance.
	 * @constructs FooTable.Class
	 * @classdesc This class is based off of John Resig's [Simple JavaScript Inheritance]{@link http://ejohn.org/blog/simple-javascript-inheritance} but it has been updated to be ES 5.1
	 * compatible by implementing an [Object.create polyfill]{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill}
	 * for older browsers.
	 * @see {@link http://ejohn.org/blog/simple-javascript-inheritance}
	 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create#Polyfill}
	 * @returns {FooTable.Class}
	 */
	function Class() {}

	/**
	 * Creates a new class that inherits from this class which in turn allows itself to be extended.
	 * @param {object} props - Any new methods or members to implement.
	 * @returns {FooTable.Class} A new class that inherits from the base class.
	 * @example <caption>The below shows an example of how to implement inheritance using this method.</caption>
	 * var Person = FooTable.Class.extend({
	 *   ctor: function(isDancing){
	 *     this.dancing = isDancing;
	 *   },
	 *   dance: function(){
	 *     return this.dancing;
	 *   }
	 * });
	 *
	 * var Ninja = Person.extend({
	 *   ctor: function(){
	 *     this._super( false );
	 *   },
	 *   dance: function(){
	 *     // Call the inherited version of dance()
	 *     return this._super();
	 *   },
	 *   swingSword: function(){
	 *     return true;
	 *   }
	 * });
	 *
	 * var p = new Person(true);
	 * p.dance(); // => true
	 *
	 * var n = new Ninja();
	 * n.dance(); // => false
	 * n.swingSword(); // => true
	 *
	 * // Should all be true
	 * p instanceof Person && p instanceof FooTable.Class &&
	 * n instanceof Ninja && n instanceof Person && n instanceof FooTable.Class
	 */
	Class.extend = function (props) {
		var _super = this.prototype;

		// Instantiate a base class (but only create the instance,
		// don't run the construct method)
		var proto = Object.create(_super);

		// Copy the properties over onto the new prototype
		for (var name in props) {
			//if (!Object.prototype.hasOwnProperty.call(props, name)) continue;
			// Check if we're overwriting an existing function
			proto[name] = typeof props[name] === "function" &&
			typeof _super[name] === "function" && fnTest.test(props[name]) ?
				(function (name, fn) {
					return function () {
						var tmp = this._super;

						// Add a new ._super() method that is the same method
						// but on the super-class
						this._super = _super[name];

						// The method only need to be bound temporarily, so we
						// remove it when we're done executing
						var ret = fn.apply(this, arguments);
						this._super = tmp;

						return ret;
					};
				})(name, props[name]) :
				props[name];
		}

		// The new constructor
		var newClass = typeof proto.ctor === "function" ?
			proto.ctor : // All construction is actually done in the construct method
			function () {};

		// Populate our constructed prototype object
		newClass.prototype = proto;

		// Enforce the constructor to be what we expect
		proto.constructor = newClass;

		// And make this class extendable
		newClass.extend = Class.extend;

		return newClass;
	};

	FooTable.Class = Class;

})(FooTable = window.FooTable || {});
(function ($, FooTable) {

	FooTable.Component = FooTable.Class.extend(/** @lends FooTable.Component */{
		/**
		 * The base class for all FooTable components.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @throws {TypeError} The instance parameter must be an instance of {@link FooTable.Instance}.
		 * @returns {FooTable.Component}
		 */
		ctor: function (instance) {
			if (!(instance instanceof FooTable.Instance))
				throw new TypeError('The instance parameter must be an instance of FooTable.Instance.');

			/**
			 * The parent {@link FooTable.Instance} for the component.
			 * @type {FooTable.Instance}
			 */
			this.instance = instance;
		},
		/**
		 * The construct method called from within the {@link FooTable.Cell} constructor.
		 * @instance
		 * @param {FooTable.Cell} cell - The cell object being constructed.
		 */
		ctor_cell: function(cell){},
		/**
		 * The construct method called from within the {@link FooTable.Column} constructor.
		 * @instance
		 * @param {FooTable.Column} column - The column object being constructed.
		 * @param {object} definition - The definition object used to populate the column.
		 */
		ctor_column: function(column, definition){},
		/**
		 * The construct method called from within the {@link FooTable.Row} constructor.
		 * @instance
		 * @param {FooTable.Row} row - The row object being constructed.
		 */
		ctor_row: function(row){},
		/**
		 * The initialize method is called during the parent {@link FooTable.Instance}'s constructor call.
		 * @instance
		 * @param {HTMLElement} element - The element the parent instance is initializing on.
		 * @param {object} options - The options the parent instance is using to initialize. See {@link FooTable.Defaults} for more information.
		 */
		preinit: function (element, options) {},
		/**
		 * The initialize method is called during the parent {@link FooTable.Instance} constructor call.
		 * @instance
		 * @param {HTMLElement} element - The element the parent instance is initializing on.
		 * @param {object} options - The options the parent instance is using to initialize. See {@link FooTable.Defaults} for more information.
		 */
		init: function (element, options) {},
		/**
		 * The reinitialize method called from the {@link FooTable.Instance#reinit} method.
		 * @instance
		 * @param {object} options - The options the parent instance is using to initialize. See {@link FooTable.Defaults} for more information.
		 */
		reinit: function (options) {},
		/**
		 * This method is called from the {@link FooTable.Instance#destroy} method.
		 * @instance
		 */
		destroy: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#ajax} method.
		 * @instance
		 */
		preajax: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#ajax} method.
		 * @instance
		 */
		postajax: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#draw} method.
		 * @instance
		 */
		predraw: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#draw} method.
		 * @instance
		 */
		draw: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#draw} method.
		 * @instance
		 */
		postdraw: function () {}
	});

})(jQuery, FooTable = window.FooTable || {});
(function ($, FooTable) {

	/**
	 * Contains all the available options for the FooTable plugin.
	 * @constructor
	 * @returns {FooTable.Defaults}
	 */
	FooTable.Defaults = function () {
		/**
		 * Whether or not FooTable is to use ajax.
		 * @type {boolean}
		 * @default false
		 */
		this.ajaxEnabled = false;
		/**
		 * The function that retrieves the ajax data for the table. This must return a {@link jQuery.Promise} object.
		 * @type {jQuery.Promise}
		 * @default Empty Promise
		 * @example <caption>The below shows an example of how to use this option.</caption>
		 * ajax: function(requestData){
		 * 	return jQuery.ajax({
		 * 		url: 'http://example.com/my-endpoint',
		 * 		data: requestData
		 * 	});
		 * }
		 * @see {@link http://api.jquery.com/Types/#Promise}
		 */
		this.ajax = $.when();
		/**
		 * The namespace appended to all events raised by the plugin.
		 * @type {string}
		 * @default "footable"
		 */
		this.namespace = 'footable';
		/**
		 * An object in which the string keys represent one or more space-separated event types and optional namespaces, and the values represent a handler function to be called for the event(s).
		 * @type {object.<string, function>}
		 * @default null
		 * @example <caption>This example shows how to pass an object containing the events and handlers.</caption>
		 * on: {
		 * 	click: function(e){
		 * 		// do something whenever the table is clicked
		 * 	},
		 * 	"init.footable": function(e, instance){
		 * 		// do something when FooTable initializes
		 * 	},
		 * 	"init.footable reinit.footable": function(e, instance){
		 * 		// do something when FooTable initializes or reinitializes
		 * 	}
		 * }
		 */
		this.on = null;
	};

	/**
	 * Contains all the default options for the plugin.
	 * @type {FooTable.Defaults}
	 */
	FooTable.defaults = new FooTable.Defaults();

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	FooTable.AddOn = FooTable.Component.extend(/** @lends FooTable.AddOn */{
		/**
		 * The base class for all FooTable add-ons.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {string} name - The name of the add-on.
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the add-on.
		 * @throws {TypeError} The name parameter cannot be an empty or null string.
		 * @throws {TypeError} The instance parameter must be an instance of {@link FooTable.Instance}.
		 * @returns {FooTable.AddOn}
		 */
		ctor: function (name, instance) {
			if (typeof name !== 'string' || name.length === 0)
				throw new TypeError('The name parameter cannot be an empty or null string.');

			/**
			 * The name of the add-on.
			 * @type {string}
			 */
			this.name = name;
			// call the base constructor
			this._super(instance);
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	FooTable.Breakpoint = FooTable.Class.extend(/** @lends FooTable.Breakpoint */{
		/**
		 * The breakpoint class containing the name and maximum width for the breakpoint.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {FooTable.Instance} instance -  The {@link FooTable.Instance} this breakpoint belongs to.
		 * @param {string} name - The name of the breakpoint. Must contain no spaces or special characters.
		 * @param {number} width - The width of the breakpoint in pixels.
		 * @returns {FooTable.Breakpoint}
		 */
		ctor: function(instance, name, width){
			this.instance = instance;
			/**
			 * The name of the breakpoint.
			 * @type {string}
			 */
			this.name = name;
			/**
			 * The maximum width of the breakpoint in pixels.
			 * @type {number}
			 */
			this.width = width;
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	FooTable.Cell = FooTable.Class.extend(/** @lends FooTable.Cell */{
		/**
		 * The cell class containing all the properties for cells.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {FooTable.Instance} instance -  The {@link FooTable.Instance} this cell belongs to.
		 * @param {FooTable.Row} row - The parent {@link FooTable.Row} this cell belongs to.
		 * @param {HTMLElement} cell -  The cell element this object wraps.
		 * @param {FooTable.Column} column - The {@link FooTable.Column} this cell falls under.
		 * @param {*} value - The value of the cell.
		 * @returns {FooTable.Cell}
		 */
		ctor: function (instance, row, cell, column, value) {
			/**
			 * The {@link FooTable.Instance} for the cell.
			 * @type {FooTable.Instance}
			 */
			this.instance = instance;
			/**
			 * The parent {@link FooTable.Row} for the cell.
			 * @type {FooTable.Row}
			 */
			this.row = row;
			/**
			 * The jQuery table cell object this instance wraps.
			 * @type {jQuery}
			 */
			this.$cell = $(cell);
			/**
			 * The {@link FooTable.Column} this cell falls under.
			 * @type {FooTable.Column}
			 */
			this.column = column;
			/**
			 * The value of the cell.
			 * @type {*}
			 */
			this.value = value;
			/**
			 * The display text of the cell.
			 * @type {string}
			 */
			this.display = $.isFunction(column.formatter) ? column.formatter(value) : value;

			// set the cells' html to the display value
			this.$cell.html(this.display).get(0).__FooTable_Cell__ = this;

			this.instance.execute('ctor_cell', this);
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	FooTable.Column = FooTable.Class.extend(/** @lends FooTable.Column */{
		/**
		 * The column class containing all the properties for columns.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {FooTable.Instance} instance -  The parent {@link FooTable.Instance} this component belongs to.
		 * @param {HTMLElement} cell - The column header cell element.
		 * @param {object} definition - An object containing all the properties to set for the column.
		 * @returns {FooTable.Column}
		 */
		ctor: function(instance, cell, definition){
			/**
			 * The {@link FooTable.Instance} for the column.
			 * @type {FooTable.Instance}
			 */
			this.instance = instance;
			/**
			 * The jQuery cell object for the column header.
			 * @type {jQuery}
			 */
			this.$headerCell = $(cell);
			/**
			 * The index of the column in the table. This is set by the plugin.
			 * @type {number}
			 * @default -1
			 */
			this.index = typeof definition.index === 'number' ? definition.index : -1;
			/**
			 * Whether or not this column is hidden from view and appears in the details row. This is set by the plugin.
			 * @type {boolean}
			 * @default false
			 */
			this.hidden = typeof definition.hidden === 'boolean' ? definition.hidden : false;
			/**
			 * Whether or not this column is completely hidden from view and will not appear in the details row.
			 * @type {boolean}
			 * @default false
			 */
			this.visible = typeof definition.visible === 'boolean' ? definition.visible : true;
			/**
			 * The parse function for this column. This is set by the plugin.
			 * @type {function}
			 * @default jQuery.noop
			 */
			this.parser = typeof definition.parser === 'function' ? definition.parser : $.noop;
			/**
			 * Whether or not to force a column to hide overflow with an ellipsis.
			 * @type {boolean}
			 * @default false
			 */
			this.ellipsis = typeof definition.ellipsis === 'boolean' ? definition.ellipsis : false;
			/**
			 * A function used to format the columns value into a string to display. If NULL the plugin uses the cell values' default toString result.
			 * The column format function is passed the value obtained by the parser for the column and must return a string used to display the value in the cell, this result can be an HTML string.
			 * @type {function}
			 * @default null
			 * @example <caption>The below shows a formatter to convert a date or a ticks value to a string representation to display in a cell.</caption>
			 * format: function(value){
			 * 	var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			 * 	if (typeof value == "number") value = new Date(value);
			 * 	return value instanceof Date ? value.getDate() + ' ' + months[value.getMonth()] + ' ' + value.getFullYear() : null;
			 * }
			 */
			this.formatter = typeof definition.formatter === 'function' ? definition.formatter : null;
			/**
			 * Specifies the maximum width for the column.
			 * @type {number}
			 * @default null
			 */
			this.maxWidth = typeof definition.maxWidth === 'number' ? definition.maxWidth : null;
			/**
			 * Specifies the minimum width for the column.
			 * @type {number}
			 * @default null
			 */
			this.minWidth = typeof definition.minWidth === 'number' ? definition.minWidth : null;
			/**
			 * The name of the column. This name must correspond to the property name of the JSON row data.
			 * @type {string}
			 * @default null
			 */
			this.name = typeof definition.name === 'string' ? definition.name : null;
			/**
			 * Whether or not the column is the primary key for the row.
			 * @type {boolean}
			 * @default false
			 */
			this.pk = typeof definition.pk === 'boolean' ? definition.pk : false;
			/**
			 * The title to display in the column header.
			 * @type {string}
			 * @default null
			 */
			this.title = typeof definition.title === 'string' ? definition.title : null;
			/**
			 * The type of data displayed by the column.
			 * @type {string}
			 * @default "text"
			 */
			this.type = typeof definition.type === 'string' ? definition.type : 'text';
			/**
			 * Specifies the width for the column.
			 * @type {number}
			 * @default null
			 */
			this.width = typeof definition.width === 'number' ? definition.width : null;
			/**
			 * Whether or not to force a column to wrap overflow onto a new line. Overrides the {@link FooTable.Column#ellipsis} option.
			 * @type {boolean}
			 * @default false
			 */
			this.wrap = typeof definition.wrap === 'boolean' ? definition.wrap : false;

			// add this object to the header element
			this.$headerCell.html(this.title).get(0).__FooTable_Column__ = this;

			this.instance.execute('ctor_column', this, definition);
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	FooTable.Row = FooTable.Class.extend(/** @lends FooTable.Row */{
		/**
		 * The row class containing all the properties for a row and its' cells.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {FooTable.Instance} instance -  The parent {@link FooTable.Instance} this component belongs to.
		 * @param {HTMLElement} row - The row element this object wraps.
		 * @param {Array.<FooTable.Column>} columns - The array of {@link FooTable.Column} for this row.
		 * @returns {FooTable.Row}
		 */
		ctor: function (instance, row, columns) {
			/**
			 * The {@link FooTable.Instance} for the row.
			 * @type {FooTable.Instance}
			 */
			this.instance = instance;
			/**
			 * The jQuery row object.
			 * @type {jQuery}
			 */
			this.$row = $(row);
			/**
			 * The array of {@link FooTable.Column} for this row.
			 * @type {Array.<FooTable.Column>}
			 */
			this.columns = columns;
			/**
			 * The cells array.
			 * @type {Array.<FooTable.Cell>}
			 */
			this.cells = [];

			// add this object to the row
			this.$row.get(0).__FooTable_Row__ = this;

			this.instance.execute('ctor_row', this);
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function ($, FooTable) {

	/**
	 * An array of all currently loaded instances of the plugin.
	 * @type {Array.<FooTable.Instance>}
	 */
	FooTable.instances = [];

	FooTable.Instance = FooTable.Class.extend(/** @lends FooTable.Instance */{
		/**
		 * This class is the core of the plugin and drives the logic of all components and addons.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {HTMLTableElement} element - The element to bind the plugin to.
		 * @param {object} options - The options to initialize the plugin with.
		 * @returns {FooTable.Instance}
		 */
		ctor: function (element, options) {
			var self = this;
			//BEGIN MEMBERS
			/**
			 * The timeout ID for the resize event.
			 * @instance
			 * @type {?number}
			 * @private
			 */
			this._resizeTimeout = null;
			/**
			 * The callback function to execute once fully initialized.
			 * @instance
			 * @type {function}
			 * @default jQuery.noop
			 * @private
			 */
			this._ready = $.noop;
			/**
			 * The ID of the FooTable instance.
			 * @instance
			 * @type {number}
			 */
			this.id = FooTable.instances.push(self);
			/**
			 * Whether or not the plugin and all components and add-ons are fully initialized.
			 * @instance
			 * @type {boolean}
			 */
			this.initialized = false;
			/**
			 * The jQuery table object the plugin is bound to.
			 * @instance
			 * @type {jQuery}
			 */
			this.$table = $(element);
			/**
			 * The jQuery style object containing any CSS styles for this instance of the plugin.
			 * @instance
			 * @type {jQuery}
			 */
			this.$styles = $('<style/>', { type: 'text/css' }).appendTo('head');
			/**
			 * The jQuery row object that serves as the loader for the plugin.
			 * @instance
			 * @type {jQuery}
			 */
			this.$loader = null;
			/**
			 * The options the plugin is initialized with.
			 * @instance
			 * @type {object}
			 */
			this.options = $.extend(true, {}, FooTable.defaults, options);
			/**
			 * The breakpoints component for this instance of the plugin.
			 * @instance
			 * @type {FooTable.Breakpoints}
			 */
			this.breakpoints = new FooTable.Breakpoints(self);
			/**
			 * The columns component for this instance of the plugin.
			 * @instance
			 * @type {FooTable.Columns}
			 */
			this.columns = new FooTable.Columns(self);
			/**
			 * The rows component for this instance of the plugin.
			 * @instance
			 * @type {FooTable.Rows}
			 */
			this.rows = new FooTable.Rows(self);
			/**
			 * The filtering component for this instance of the plugin.
			 * @instance
			 * @type {FooTable.Filtering}
			 */
			this.filtering = new FooTable.Filtering(self);
			/**
			 * The sorting component for this instance of the plugin.
			 * @instance
			 * @type {FooTable.Sorting}
			 */
			this.sorting = new FooTable.Sorting(self);
			/**
			 * The paging component for this instance of the plugin.
			 * @instance
			 * @type {FooTable.Paging}
			 */
			this.paging = new FooTable.Paging(self);

			/**
			 * The components for this instance of the plugin. These are executed in the order they appear in the array for the initialize phase and in reverse order for the destroy phase of the plugin.
			 * @instance
			 * @type {object}
			 * @prop {Array.<FooTable.Component>} internal - The internal components for the plugin. These are executed either before all other components in the initialize phase or after them in the destroy phase of the plugin.
			 * @prop {Array.<FooTable.Component>} core - The core components for the plugin. These are executed either after the internal components in the initialize phase or before them in the destroy phase of the plugin.
			 * @prop {Array.<FooTable.AddOn>} addons - The addon components for the plugin. These are executed either after the core components in the initialize phase or before them in the destroy phase of the plugin.
			 */
			this.components = {
				internal: [self.breakpoints, self.columns, self.rows],
				core: [self.filtering, self.sorting, self.paging],
				addons: FooTable.addons.ctor(self)
			};
			//END MEMBERS
			self._init(element, self.options);
		},
		/**
		 * Initializes this instance of the plugin with the supplied element and options.
		 * @instance
		 * @private
		 * @param {HTMLElement} element - The table element to initialize the plugin on.
		 * @param {object} options - The options to initialize the plugin with.
		 * @return {jQuery.Promise}
		 * @fires FooTable.Instance#preinit
		 * @fires FooTable.Instance#init
		 */
		_init: function(element, options){
			var self = this;
			if (typeof options.on === 'object') self.$table.on(options.on);
			self.$table.addClass('footable-' + self.id);
			self.when(false, true, 'preinit', element, options).then(function () {
				/**
				 * The preinit event is raised before any core components or add-ons are initialized.
				 * @event FooTable.Instance#preinit
				 * @param {jQuery.Event} e - The jQuery.Event object for the event.
				 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
				 */
				if (self.raise('preinit').isDefaultPrevented()) throw FooTable.ExitEarly;
				return self.when(false, true, 'init', element, options).then(function(){
					self.$loader = $('<tr/>', { 'class': 'footable-loader' }).append($('<td/>').attr('colspan', self.columns.colspan()).append($('<span/>', {'class': 'glyphicon glyphicon-repeat'})));
					self.initialized = true;
					/**
					 * The init event is raised after all core components and add-ons are initialized.
					 * @event FooTable.Instance#init
					 * @param {jQuery.Event} e - The jQuery.Event object for the event.
					 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
					 */
					self.raise('init');
					self._ready.call(self, self);
				});
			}).then(function () {
				self.update();
				$(window).off('resize', self._onWindowResize).on('resize', { self: self }, self._onWindowResize);
			}, function (err) {
				if (err instanceof FooTable.ExitEarly) return;
				console.error(err);
			});
		},
		/**
		 * Reinitializes this instance of the plugin with the supplied options.
		 * @instance
		 * @param {object} options - The options to reinitialize the plugin with.
		 * @return {jQuery.Promise}
		 * @fires FooTable.Instance#reinit
		 */
		reinit: function (options) {
			var self = this;
			self.initialized = false;
			self.$loader.remove();
			self.clearCSSRules();
			// cleanup any previously bound events before we merge the new options with the old
			if (typeof self.options.on === 'object') self.$table.off(self.options.on);
			$.extend(true, self.options, options);

			if (typeof self.options.on === 'object') self.$table.on(self.options.on);
			self.$table.addClass('footable-' + self.id);
			return self.when(false, true, 'reinit', self.options).then(function () {
				self.$loader = $('<tr/>', { 'class': 'footable-loader' }).append($('<td/>').attr('colspan', self.columns.colspan()).append($('<span/>', {'class': 'glyphicon glyphicon-repeat'})));
				self.initialized = true;
				/**
				 * The reinit event is raised after all core components are reinitialized.
				 * @event FooTable.Instance#reinit
				 * @param {jQuery.Event} e - The jQuery.Event object for the event.
				 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
				 */
				self.raise('reinit');
			}).then(function () {
				self.update();
				$(window).off('resize', self._onWindowResize).on('resize', { self: self }, self._onWindowResize);
			}, function (err) {
				console.error(err);
			});
		},
		/**
		 * Destroys this plugin removing it from the table.
		 * @instance
		 * @fires FooTable.Instance#destroy
		 */
		destroy: function () {
			var self = this;
			return self.when(true, false, 'destroy').then(function () {
				self.clearCSSRules();
				/**
				 * The destroy event is called after all core components and add-ons have destroyed themselves.
				 * @event FooTable.Instance#destroy
				 * @param {jQuery.Event} e - The jQuery.Event object for the event.
				 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
				 */
				self.raise('destroy');
				if (typeof self.options.on === 'object') self.$table.off(self.options.on);
			});
		},
		/**
		 * Executes the ajax function and loads the response into the plugin.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Instance#preajax
		 * @fires FooTable.Instance#postajax
		 */
		ajax: function () {
			var self = this, request = new FooTable.RequestData(),
				$header = self.$table.children('thead').children('tr.footable-header'),
				$tbody = self.$table.children('tbody'),
				height = $tbody.height();

			height = height > 0 ? $header.height() + height : 150;
			// show the loader
			self.$loader.children('td').height(height);
			$header.hide();
			$tbody.children('tr').detach();
			$tbody.append(self.$loader);

			return self.when(false, false, 'preajax', request).then(function () {
				/**
				 * The preajax event is raised before the actual Ajax request is made and is passed the request data object.
				 * @event FooTable.Instance#preajax
				 * @param {jQuery.Event} e - The jQuery.Event object for the event.
				 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
				 * @param {FooTable.RequestData} requestData - The request data object that will be supplied to the {@link FooTable.Defaults#ajax} function.
				 */
				if (self.raise('preajax', [request]).isDefaultPrevented()) throw FooTable.ExitEarly;
				return self.options.ajax(request).then(function (response) {
					return self.when(false, false, 'postajax', response).then(function(){
						/**
						 * The postajax event is raised after the Ajax request is made and is passed the response.
						 * @event FooTable.Instance#postajax
						 * @param {jQuery.Event} e - The jQuery.Event object for the event.
						 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
						 * @param {object} response - The JSON response object returned from the {@link FooTable.Defaults#ajax} function.
						 */
						self.raise('postajax', [response]);
						// hide the loader
						self.$table.children('thead').children('tr.footable-header').show();
						self.$loader.detach();
					});
				});
			});
		},
		/**
		 * Performs the drawing of the table.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Instance#predraw
		 * @fires FooTable.Instance#draw
		 * @fires FooTable.Instance#postdraw
		 */
		draw: function () {
			var self = this;
			// when drawing the order that the components are executed is important so chain the methods but use promises to retain async safety.
			return self.when(false, true, 'predraw').then(function(){
				/**
				 * The predraw event is raised after all core components and add-ons have executed there predraw functions but before they execute there draw functions.
				 * @event FooTable.Instance#predraw
				 * @param {jQuery.Event} e - The jQuery.Event object for the event.
				 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
				 */
				if (self.raise('predraw').isDefaultPrevented()) throw FooTable.ExitEarly;
				return self.when(false, true, 'draw').then(function(){
					self.$loader.children('td').attr('colspan', self.columns.colspan());
					/**
					 * The draw event is raised after all core components and add-ons have executed there draw functions.
					 * @event FooTable.Instance#draw
					 * @param {jQuery.Event} e - The jQuery.Event object for the event.
					 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
					 */
					if (self.raise('draw').isDefaultPrevented()) throw FooTable.ExitEarly;
					return self.when(false, true, 'postdraw').then(function(){
						self.$loader.children('td').attr('colspan', self.columns.colspan());
						/**
						 * The postdraw event is raised after all core components and add-ons have executed there postdraw functions.
						 * @event FooTable.Instance#postdraw
						 * @param {jQuery.Event} e - The jQuery.Event object for the event.
						 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
						 */
						self.raise('postdraw');
					});
				});
			});
		},
		/**
		 * Performs an update for the table calling the ajax function if required and then drawing.
		 * @instance
		 * @returns {jQuery.Promise}
		 */
		update: function () {
			var self = this;
			if (self.options.ajaxEnabled == true) {
				return self.ajax().then(function () {
					return self.draw();
				}, function (err) {
					console.error(err);
				});
			} else {
				return self.draw();
			}
		},
		/**
		 * Executes the specified method with the optional number of parameters on all components.
		 * @instance
		 * @param {string} methodName - The name of the method to execute.
		 * @param {*} [param1] - The first parameter for the method.
		 * @param {...*} [paramN] - Any number of additional parameters for the method.
		 * @returns {jQuery.Promise} A jQuery Promise object containing promises for each of the executed methods.
		 */
		execute: function (methodName, param1, paramN) {
			var self = this,
				args = Array.prototype.slice.call(arguments),
				components = self.components.internal.concat(self.components.core, self.components.internal);
			methodName = args.shift();
			$.each(components, function(i, component){
				if (component[methodName] && typeof component[methodName] === 'function') {
					component[methodName].apply(component, args);
				}
			});
		},
		/**
		 * Executes the specified method with the optional number of parameters on all components and waits for all promises to be resolved.
		 * @instance
		 * @param {boolean} reverse - Whether or not to execute the component methods in the reverse order to what they were registered in.
		 * @param {boolean} chain - Whether or not to chain all the method calls waiting for the result of the first before calling the second and so on.
		 * @param {string} methodName - The name of the method to execute.
		 * @param {*} [param1] - The first parameter for the method.
		 * @param {...*} [paramN] - Any number of additional parameters for the method.
		 * @returns {jQuery.Promise} A jQuery Promise object containing promises for each of the executed methods.
		 */
		when: function(reverse, chain, methodName, param1, paramN){
			var self = this, args = Array.prototype.slice.call(arguments);
			reverse = args.shift();
			chain = args.shift();
			var exec = chain ? self._chain : self._when;
			args.unshift(reverse ? self.components.addons.slice(0).reverse() : self.components.internal.slice(0));
			return exec.apply(self, args).then(function(){
				args.shift();
				args.unshift(reverse ? self.components.core.slice(0).reverse() : self.components.core.slice(0));
				return exec.apply(self, args).then(function(){
					args.shift();
					args.unshift(reverse ? self.components.internal.slice(0).reverse() : self.components.addons.slice(0));
					return exec.apply(self, args);
				});
			});
		},
		/**
		 * Executes the specified method with the optional number of parameters on all supplied components.
		 * @param {Array.<FooTable.Component>} components - The components to call the method on.
		 * @param {string} methodName - The name of the method to execute
		 * @param {*} [param1] - The first parameter for the method.
		 * @param {...*} [paramN] - Any additional parameters for the method.
		 * @returns {jQuery.Promise} A jQuery Promise object containing promises for each of the executed methods.
		 */
		_when: function (components, methodName, param1, paramN) {
			if (!components || !components.length) return $.when();
			var args = Array.prototype.slice.call(arguments),
				methods = [];
			components = args.shift();
			methodName = args.shift();
			$.each(components, function(i, component){
				if (component[methodName] && typeof component[methodName] === 'function') {
					methods.push(component[methodName].apply(component, args));
				}
			});
			return $.when.apply($, methods);
		},
		/**
		 * Executes the specified method with the optional number of parameters on all supplied components waiting for the result of each before executing the next.
		 * @param {Array.<FooTable.Component>} components - The components to call the method on.
		 * @param {string} methodName - The name of the method to execute
		 * @param {*} [param1] - The first parameter for the method.
		 * @param {...*} [paramN] - Any additional parameters for the method.
		 * @returns {jQuery.Promise} A jQuery Promise object containing promises for each of the executed methods.
		 */
		_chain: function(components, methodName, param1, paramN){
			if (!components || !components.length) return $.when();
			var self = this, args = Array.prototype.slice.call(arguments),
				component;
			components = args.shift();
			methodName = args.shift();
			component = components.shift();
			return $.when(component[methodName].apply(component, args)).then(function(){
				return self._chain(components, methodName, param1, paramN);
			});
		},
		/**
		 * Raises an event on this instance supplying the args array as additional parameters to the handlers.
		 * @instance
		 * @param {string} eventName - The name of the event to raise, this can include namespaces.
		 * @param {Array} [args] - An array containing additional parameters to be passed to any bound handlers.
		 * @returns {jQuery.Event} The jQuery.Event object used to raise the event.
		 */
		raise: function (eventName, args) {
			args = args || [];
			args.unshift(this);
			if (!FooTable.utils.strings.isNullOrEmpty(this.options.namespace) && !FooTable.utils.strings.contains(eventName, '.')) {
				eventName = FooTable.utils.strings.join('.', eventName, this.options.namespace);
			}
			var evt = $.Event(eventName);
			this.$table.one(eventName, function (e) {e.stopPropagation();}).trigger(evt, args);
			return evt;
		},
		/**
		 * This method is called once the entire plugin is initialized.
		 * @instance
		 * @param {function} callback - The function to execute once the entire plugin is initialized.
		 */
		ready: function (callback) {
			if (typeof callback !== 'function') return;
			this._ready = callback;
			if (this.initialized === true) callback.call(this, this);
		},
		/**
		 * Clears all rules from this instances' {@link FooTable.Instance#$styles} tag.
		 * @instance
		 */
		clearCSSRules: function(){
			this.$styles.html('');
		},
		/**
		 * Adds the supplied selector and cssText to this instances' {@link FooTable.Instance#$styles} tag.
		 * @instance
		 * @param {string} selector - The rule selector to append.
		 * @param {string} cssText - The cssText for the selector.
		 */
		addCSSRule: function(selector, cssText){
			var style = this.$styles.get(0), sheet = style.styleSheet || style.sheet;
			if (sheet.insertRule){
				sheet.insertRule(selector + " { " + cssText + " }", sheet.cssRules.length);
			} else {
				sheet.addRule(selector, cssText, -1);
			}
		},
		/**
		 * Listens to the window resize event and performs a check to see if the breakpoint has changed.
		 * @instance
		 * @private
		 * @fires FooTable.Instance#resize
		 */
		_onWindowResize: function (e) {
			var self = e.data.self;
			if (self._resizeTimeout != null) { clearTimeout(self._resizeTimeout); }
			self._resizeTimeout = setTimeout(function () {
				self._resizeTimeout = null;
				/**
				 * The resize event is raised a short time after window resize operations cease.
				 * @event FooTable.Instance#resize
				 * @param {jQuery.Event} e - The jQuery.Event object for the event.
				 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
				 */
				if (!self.raise('resize').isDefaultPrevented()) {
					self.breakpoints.check();
				}
			}, 300);
		}
	});

	FooTable.RequestData = FooTable.Class.extend(/** @lends FooTable.RequestData */{
		/**
		 * The request data object is passed to the {@link FooTable.Defaults#ajax} method and contains all information required to make the ajax request.
		 * @constructs
		 * @extends FooTable.Class
		 * @returns {FooTable.RequestData}
		 */
		ctor: function(){}
	});

	FooTable.ResponseData = FooTable.Class.extend(/** @lends FooTable.ResponseData */{
		/**
		 * The response object that the plugin expects back from the {@link FooTable.Defaults#ajax} method.
		 * @constructs
		 * @extends FooTable.Class
		 * @returns {FooTable.ResponseData}
		 */
		ctor: function(){}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	/**
	 * An object containing the column definitions for the table.
	 * @type {object.<number, object>}
	 * @default {}
	 */
	FooTable.Defaults.prototype.columns = {};

	/**
	 * These parsers are supplied the HTMLTableCellElement being parsed and must return a value.
	 * The name of the parser must match a {@link FooTable.Column#type} for it to be used automatically by the plugin for those columns.
	 * @summary An object containing the default parsers for the plugin to use.
	 * @type {object.<string, function(HTMLTableCellElement)>}
	 * @default { "text": function, "number": function }
	 * @example <caption>This example shows how to register a parser for the custom column type of "example".</caption>
	 * parsers: {
	 * 	...
	 * 	"example": function(cell){
	 * 		return $(cell).text();
	 * 	}
	 * }
	 */
	FooTable.Defaults.prototype.parsers = {
		text: function (cell) {
			cell = $(cell);
			return cell.data('value') || $.trim(cell.text());
		},
		number: function (cell) {
			cell = $(cell);
			var val = parseFloat(cell.data('value') || cell.text().replace(/[^0-9.\-]/g, ''));
			return isNaN(val) ? 0 : val;
		}
	};

	FooTable.Columns = FooTable.Component.extend(/** @lends FooTable.Columns */{
		/**
		 * The columns class contains all the logic for handling columns.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance -  The parent {@link FooTable.Instance} this component belongs to.
		 * @returns {FooTable.Columns}
		 */
		ctor: function(instance){
			/**
			 * An array of {@link FooTable.Column} objects created from parsing the options and/or DOM.
			 * @type {Array.<FooTable.Column>}
			 */
			this.array = [];

			// call the base class constructor
			this._super(instance);
		},
		/**
		 * Initializes the columns creating the table header if required.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Columns#columns_init
		 */
		init: function(table, options){
			if (this.instance.$table.children('thead').length == 0) this.instance.$table.prepend('<thead/>');
			var last = this.instance.$table.children('thead').children('tr').not('.footable-filtering,.footable-paging').last().get(0);
			this.array = (last instanceof HTMLTableRowElement) ? this.fromDOM(last) : this.fromJSON(options.columns);
			this._generateCSS();
			/**
			 * The columns_init event is raised after the header row is created/parsed for column data.
			 * @event FooTable.Columns#columns_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Column>} columns - The array of {@link FooTable.Column} objects parsed from the options and/or DOM.
			 */
			this.instance.raise('columns_init', [ this.array ]);
		},
		/**
		 * Reinitializes the columns creating the table header if required.
		 * @instance
		 * @param {object} options - The options the plugin was reinitialized with.
		 * @fires FooTable.Columns#columns_reinit
		 */
		reinit: function(options){
			if (this.instance.$table.children('thead').length == 0) this.instance.$table.prepend('<thead/>');
			var last = this.instance.$table.children('thead').children('tr').not('.footable-filtering,.footable-paging').last().get(0);
			this.array = (last instanceof HTMLTableRowElement) ? this.fromDOM(last) : this.fromJSON(options.columns);
			this._generateCSS();
			/**
			 * The columns_reinit event is raised after the header row is created/parsed for column data.
			 * @event FooTable.Columns#columns_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Column>} columns - The array of {@link FooTable.Column} objects parsed from the options and/or DOM.
			 */
			this.instance.raise('columns_reinit', [ this.array ]);
		},
		/**
		 * Parses the supplied rows' cells to produce an array of {@link FooTable.Column}s.
		 * @instance
		 * @param {HTMLTableRowElement} headerRow - The header row of the table.
		 * @returns {Array.<FooTable.Column>}
		 */
		fromDOM: function(headerRow){
			var self = this, columns = [];
			$(headerRow).addClass('footable-header');
			for (var i = 0, $cell, column, definition, len = headerRow.cells.length; i < len; i++){
				$cell = $(headerRow.cells[i]);
				definition = $.extend(true, {
					title: $cell.text()
				}, self.instance.options.columns[i] || {}, $cell.data(), { index: i });
				definition.sorter = self.instance.options.sorters[definition.type] || self.instance.options.sorters.text;
				definition.parser = self.instance.options.parsers[definition.type] || self.instance.options.parsers.text;
				column = new FooTable.Column(self.instance, $cell, definition);
				columns.push(column);
			}
			return columns;
		},
		/**
		 * Parses the supplied JSON object to produce an array of {@link FooTable.Column}s and generates the table header.
		 * @instance
		 * @param {object.<number, object>} obj - The JSON object containing the column definitions.
		 * @returns {Array}
		 */
		fromJSON: function(obj){
			var self = this, columns = [];
			var column, definition, $row = $('<tr/>', { 'class': 'footable-header' });
			for (var i in obj){
				if (obj.hasOwnProperty(i)){
					i = parseInt(i);
					if (isNaN(i)) continue;
					definition = $.extend(true, {
						title: obj[i].title || obj[i].name && obj[i].name.replace(/(.)([A-Z])/, "$1 $2").replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); }) || i
					}, obj[i], { index: i });
					definition.sorter = self.instance.options.sorters[definition.type] || self.instance.options.sorters.text;
					definition.parser = self.instance.options.parsers[definition.type] || self.instance.options.parsers.text;
					column = new FooTable.Column(self.instance, document.createElement('th'), definition);
					column.$headerCell.appendTo($row);
					columns.push(column);
				}
			}
			self.instance.$table.children('thead').append($row);
			return columns;
		},
		/**
		 * The predraw method called from within the {@link FooTable.Instance#draw} method.
		 * @instance
		 */
		predraw: function(){
			var self = this;
			$.each(self.array, function(i, col){
				col.hidden = FooTable.utils.strings.contains(col.hide, self.instance.breakpoints.current) || FooTable.utils.strings.contains(col.hide, 'all');
			});
		},
		/**
		 * The postdraw method called from within the {@link FooTable.Instance#draw} method.
		 * @instance
		 */
		postdraw: function(){
			var self = this;
			$.each(self.array, function(i, col){
				self.toggle(col.index, !col.hidden);
			});
		},
		/**
		 * Toggles the visibility of the supplied column index.
		 * @instance
		 * @param {number} index - The zero based column index to toggle.
		 * @param {boolean} hidden - Whether or not to hide the column.
		 * @example <caption>This example shows how to hide the second column in a table. The <code>columns</code> object is an instance of {@link FooTable.Columns}.</caption>
		 * columns.toggle(1, true); // the index for the second column is 1 as it is zero based
		 */
		toggle: function(index, hidden) {
			this.instance.$table.children('thead,tbody,tfoot').children('tr').not('.footable-detail-row,.footable-paging,.footable-filtering').each(function(i, row){
				if (index >= 0 && index < row.cells.length) {
					row.cells[index].style.display = hidden ? 'table-cell' : 'none';
				}
			});
		},
		/**
		 * Creates the CSS styles for the parsed columns by generating the classes and appending them in a &lt;style/&gt; tag to the document.
		 * @instance
		 * @private
		 */
		_generateCSS: function(){
			for (var i = 0, col, style, len = this.array.length; i < len; i++){
				col = this.array[i];
				style = col.style || {};
				if (col.minWidth != null){
					style.minWidth = col.minWidth;
				}
				if (col.width != null){
					style.width = col.width;
					style.maxWidth = col.width;
				}
				if (col.maxWidth != null){
					style.maxWidth = col.maxWidth;
				}
				if (col.ellipsis == true){
					style.overflow = 'hidden';
					style.textOverflow = 'ellipsis';
					style.wordBreak = 'keep-all';
					style.whiteSpace = 'nowrap';
				}
				if (col.wrap == true){
					style.wordBreak = 'break-all';
					style.whiteSpace = 'normal';
				}
				this.instance.addCSSRule(this._generateCSSSelector(col.index), FooTable.utils.jsonToCSS(style));
			}
		},
		/**
		 * Creates a CSS selector to target the specified column index for this instance of the plugin.
		 * @instance
		 * @param {number} index - The column index to create the selector for.
		 * @returns {string}
		 * @private
		 */
		_generateCSSSelector: function(index){
			if (document.all && !document.addEventListener) {
				// IE8 forces us to use the sibling CSS selector (+) to target a column
				var i, rules = [],
					selectors = ['table.footable-{0} > thead > tr > ','table.footable-{0} > tbody > tr > ','table.footable-{0} > tfoot > tr > '],
					td = 'td', th = 'th';
				for (i = 0; i < index; i++){
					td += ' + td';
					th += ' + th';
				}
				for (i = 0; i < selectors.length; i++){
					rules.push(FooTable.utils.strings.format(selectors[i], this.instance.id) + td);
					rules.push(FooTable.utils.strings.format(selectors[i], this.instance.id) + th);
				}
				return rules.join(',');
			} else {
				// anything else we can use the nth-child selector
				var formatString = 'table.footable-{0} > thead > tr > td:nth-child({1}),table.footable-{0} > thead > tr > th:nth-child({1}),table.footable-{0} > tbody > tr > td:nth-child({1}),table.footable-{0} > tbody > tr > th:nth-child({1}),table.footable-{0} > tfoot > tr > td:nth-child({1}),table.footable-{0} > tfoot > tr > th:nth-child({1})';
				return FooTable.utils.strings.format(formatString, this.instance.id, index + 1);
			}
		},
		/**
		 * Attempts to return a {@link FooTable.Column} instance when passed the {@link FooTable.Column} instance, the {@link FooTable.Column#name} string or the {@link FooTable.Column#index} number.
		 * @instance
		 * @param {(FooTable.Column|string|number)} column - The column to retrieve.
		 * @returns {(FooTable.Column|null)} The column if one is found otherwise it returns NULL.
		 * @example <caption>This example shows retrieving a column by name assuming a column called "id" exists. The <code>columns</code> object is an instance of {@link FooTable.Columns}.</caption>
		 * var column = columns.getColumn('id');
		 * if (column instanceof FooTable.Column){
		 * 	// found the "id" column
		 * } else {
		 * 	// no column with a name of "id" exists
		 * }
		 */
		getColumn: function(column){
			if (column instanceof FooTable.Column) return column;
			if (typeof column == 'string') return this.first(function (col) { return col.name == column; });
			if (typeof column == 'number') return this.first(function (col) { return col.index == column; });
			return null;
		},
		/**
		 * Translate all items in the {@link FooTable.Columns#array} to a new array of items.
		 * @instance
		 * @param {function} callback - The function to process each item against.
		 * The first argument to the function is the {@link FooTable.Column} object.
		 * The function can return any value except NULL values as they will be removed from the final result.
		 * @returns {Array}
		 * @example <caption>This example shows how to get an array of all column names. The <code>columns</code> object is an instance of {@link FooTable.Columns}.</caption>
		 * var colNames = columns.map(function(column){
		 * 	return column.name;
		 * });
		 */
		map: function(callback){
			var result = [], returned = null;
			if (!$.isFunction(callback)) { return result; }
			for (var i = 0, len = this.array.length; i < len; i++) {
				if ((returned = callback(this.array[i])) != null) result.push(returned);
			}
			return result;
		},
		/**
		 * Returns the first instance of {@link FooTable.Column} that matches the supplied where function.
		 * @instance
		 * @param {function} where - The function to process each item against. The first argument to the function is the {@link FooTable.Column} object. The function must return a boolean value.
		 * @returns {(FooTable.Column|null)} The first column that matches the where function otherwise if no column matches then NULL.
		 * @example <caption>This example shows how to retrieve the first column that has a type of "text". The <code>columns</code> object is an instance of {@link FooTable.Columns}.</caption>
		 * var firstTextColumn = columns.first(function(column){
		 * 	return column.type == 'text';
		 * });
		 */
		first: function(where){
			where = where || function () { return true; };
			for (var i = 0, len = this.array.length; i < len; i++) {
				if (where(this.array[i])) return this.array[i];
			}
			return null;
		},
		/**
		 * Returns the last instance of {@link FooTable.Column} that matches the supplied where function.
		 * @instance
		 * @param {function} where - The function to process each item against. The first argument to the function is the {@link FooTable.Column} object. The function must return a boolean value.
		 * @returns {(FooTable.Column|null)} The last column that matches the where function otherwise if no column matches then NULL.
		 * @example <caption>This example shows how to retrieve the last column that has a type of "text". The <code>columns</code> object is an instance of {@link FooTable.Columns}.</caption>
		 * var lastTextColumn = columns.last(function(column){
		 * 	return column.type == 'text';
		 * });
		 */
		last: function(where){
			where = where || function () { return true; };
			for (var i = this.array.length - 1; i >= 0; i--) {
				if (where(this.array[i])) return this.array[i];
			}
			return null;
		},
		/**
		 * Returns the current colspan required to span all visible columns.
		 * @instance
		 * @returns {number}
		 */
		colspan: function(){
			var colspan = 0;
			$.each(this.array, function(i, col){
				if (!col.hidden) colspan++;
			});
			return colspan;
		},
		/**
		 * Checks if there are any hidden columns.
		 * @instance
		 * @returns {boolean}
		 */
		hasHidden: function(){
			return this.first(function(col){ return col.hidden && col.visible; }) instanceof FooTable.Column;
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function ($, FooTable) {

	/**
	 * An array of JSON objects containing the row data.
	 * @type {Array.<object>}
	 * @default []
	 */
	FooTable.Defaults.prototype.rows = [];

	/**
	 * An array of JSON objects containing the row data.
	 * @type {Array.<object>}
	 * @default []
	 */
	FooTable.ResponseData.prototype.rows = [];

	FooTable.Rows = FooTable.Component.extend(/** @lends FooTable.Rows */{
		/**
		 * The rows class contains all the logic for handling rows.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance -  The parent {@link FooTable.Instance} this component belongs to.
		 * @returns {FooTable.Rows}
		 */
		ctor: function (instance) {
			/**
			 * An array of {@link FooTable.Row} objects created from parsing the options and/or DOM.
			 * @type {Array.<FooTable.Row>}
			 * @default []
			 */
			this.array = [];
			/**
			 * The {@link FooTable.Rows#array} member is populated with a shallow clone of this array prior to the predraw operation.
			 * @type {Array.<FooTable.Row>}
			 * @default []
			 * @private
			 */
			this._array = [];

			// call the base class constructor
			this._super(instance);
		},
		/**
		 * Initializes the rows class using the supplied table and options.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Columns#rows_init
		 */
		init: function (table, options) {
			var self = this;
			if (self.instance.$table.children('tbody').length == 0) self.instance.$table.append('<tbody/>');
			self.instance.$table.on('click.footable', '> tbody > tr:has(td > span.footable-toggle)', { self: self }, self._onToggleClicked);
			self._array = (self.instance.options.ajaxEnabled == false && self.instance.options.rows.length == 0)
				? self.fromDOM(self.instance.$table.children('tbody').get(0).rows)
				: self.fromJSON(options.rows);
			/**
			 * The rows_init event is raised after the body rows are parsed for rows data.
			 * @event FooTable.Columns#rows_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Row>} rows - The array of {@link FooTable.Row} objects parsed from the options and/or DOM.
			 */
			self.instance.raise('rows_init', [self._array]);
		},
		/**
		 * Reinitializes the rows class using the supplied options.
		 * @instance
		 * @param {object} options - The options the plugin was reinitialized with.
		 * @fires FooTable.Columns#rows_reinit
		 */
		reinit: function (options) {
			var self = this;
			if (self.instance.$table.children('tbody').length == 0) self.instance.$table.append('<tbody/>');
			self.instance.$table.off('click.footable', '> tbody > tr:has(td > span.footable-toggle)', self._onToggleClicked)
				.on('click.footable', '> tbody > tr:has(td > span.footable-toggle)', { self: self }, self._onToggleClicked);
			self._array = (self.instance.options.ajaxEnabled == false && self.instance.options.rows.length == 0)
				? self.fromDOM(self.instance.$table.children('tbody').get(0).rows)
				: self.fromJSON(options.rows);
			/**
			 * The rows_init event is raised after the body rows are parsed for rows data.
			 * @event FooTable.Columns#rows_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Row>} rows - The array of {@link FooTable.Row} objects parsed from the options and/or DOM.
			 */
			self.instance.raise('rows_init', [self._array]);
		},
		/**
		 * Parses the supplied rows to produce an array of {@link FooTable.Row}s.
		 * @instance
		 * @param {Array.<HTMLTableRowElement>} rows - The rows of the table.
		 * @returns {Array.<FooTable.Row>}
		 */
		fromDOM: function (rows) {
			var self = this, _rows = [], row, cell, column;
			if (!rows) return _rows;
			for (var i = 0, len = rows.length; i < len; i++) {
				row = new FooTable.Row(self.instance, rows[i], self.instance.columns.array);
				for (var j = 0, len2 = row.columns.length; j < len2; j++) {
					column = row.columns[j];
					cell = new FooTable.Cell(self.instance, row, rows[i].cells[column.index], column, column.parser(rows[i].cells[column.index]));
					row.cells.push(cell);
				}
				_rows.push(row);
			}
			return _rows;
		},
		/**
		 * Parses the supplied JSON array of row objects to produce an array of {@link FooTable.Row}s.
		 * @instance
		 * @param {Array.<object>} rows - The JSON array of row objects for the table.
		 * @returns {Array.<FooTable.Row>}
		 */
		fromJSON: function (rows) {
			var self = this, _rows = [], row, cell, column;
			if (!rows) return _rows;
			for (var i = 0, len = rows.length; i < len; i++) {
				row = new FooTable.Row(self.instance, document.createElement('tr'), self.instance.columns.array);
				for (var j = 0, len2 = row.columns.length; j < len2; j++) {
					column = row.columns[j];
					cell = new FooTable.Cell(self.instance, row, document.createElement('td'), column, rows[i][column.name]);
					row.cells.push(cell);
					row.$row.append(cell.$cell);
				}
				_rows.push(row);
			}
			return _rows;
		},
		/**
		 * Performs post ajax operations on the response object checking for rows to parse.
		 * @instance
		 * @param {object} response - The response object from the Ajax request.
		 */
		postajax: function (response) {
			this._array = this.fromJSON(response.rows);
		},
		/**
		 * Performs the predraw operations that are required including creating the shallow clone of the {@link FooTable.Rows#array} to work with.
		 * @instance
		 */
		predraw: function(){
			this.restoreDetails();
			this.array = this._array.slice(0);
		},
		/**
		 * Performs the actual drawing of the table rows.
		 * @instance
		 */
		draw: function(){
			var self = this, $tbody = self.instance.$table.children('tbody');
			$tbody.find('> tr > td > span.footable-toggle').remove();
			// use detach to remove the rows to preserve jQuery data and any events.
			$tbody.children('tr').detach();

			// loop through the table and append the main rows
			for (var i = 0, len = self.array.length; i < len; i++){
				$tbody.append(self.array[i].$row);
			}

			if (!self.instance.columns.hasHidden()) return;

			// update or create details for any rows with the footable-detail-show class
			self.updateAllDetails();
			// add the row toggle to the first visible column
			var index = (self.instance.columns.first(function (col) { return !col.hidden; }) || {}).index;
			if (typeof index !== 'number') return;
			$tbody.find('> tr > td:nth-child(' + (index + 1) + '):not(tr.footable-detail-row > td, tr.footable-loader > td)').prepend($('<span/>', {'class': 'footable-toggle glyphicon glyphicon-plus'}));
		},
		/**
		 * Gets the detail row for the supplied row if one exists.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to retrieve the details for.
		 * @returns {(jQuery|null)}
		 */
		getDetail: function(row){
			var $row = $(row), $next;
			if ($row.hasClass('footable-detail-show')){
				$next = $row.next();
				if ($next.is('.footable-detail-row')) return $next;
			}
			return null;
		},
		/**
		 * Creates a new detail row for the supplied row.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to create the details for.
		 */
		createDetail: function(row){
			var self = this,
				data = $(row).get(0).__FooTable_Row__,
				hidden = $.map(data.cells, function(cell){
					return cell.column.hidden && cell.column.visible ? cell : null;
				}),
				colspan = self.instance.columns.colspan();

			if (hidden.length > 0 && !self.instance.raise('details_create', [ row, hidden, colspan ]).isDefaultPrevented()){
				var i, len, $tr, $th, $td,
					$cell = $('<td/>', { colspan: colspan }),
					$table = $('<table/>', { 'class': 'footable-details table table-bordered table-condensed table-hover' }).appendTo($cell),
					$tbody = $('<tbody/>').appendTo($table);

				for (i = 0, len = hidden.length; i < len; i++){
					$tr = $('<tr/>').data('footable_detail', hidden[i]).appendTo($tbody);
					$th = $('<th/>', { text: hidden[i].column.title }).appendTo($tr);
					$td = $('<td/>').appendTo($tr).append(hidden[i].$cell.contents());
				}
				data.$row.addClass('footable-detail-show').find('td > span.footable-toggle').removeClass('glyphicon-plus').addClass('glyphicon-minus');
				$('<tr/>', { 'class': 'footable-detail-row' }).append($cell).insertAfter(data.$row);
			}
		},
		/**
		 * Removes the details row from the supplied row if one exists.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to remove the details from.
		 */
		removeDetail: function(row){
			var self = this,
				data = $(row).get(0).__FooTable_Row__,
				$details = self.getDetail(data.$row.get(0)),
				$el;

			if ($details != null && !self.instance.raise('details_remove', [ row, $details.get(0) ]).isDefaultPrevented()){
				data.$row.removeClass('footable-detail-show').find('td > span.footable-toggle').removeClass('glyphicon-minus').addClass('glyphicon-plus');
				$details.children('td').first()
					.find('.footable-details > tbody > tr').each(function(i, el){
						$el = $(el);
						$el.data('footable_detail').$cell.append($el.children('td').first().contents());
					});
				$details.remove();
			}
		},
		/**
		 * Updates the detail row for the supplied row by removing and then recreating it.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to remove the details from.
		 */
		updateDetail: function(row){
			this.removeDetail(row);
			this.createDetail(row);
		},
		/**
		 * Updates all visible detail rows in the table.
		 * @instance
		 */
		updateAllDetails: function(){
			var self = this;
			self.instance.$table.children('tbody').children('tr.footable-detail-show').each(function(i, row){
				self.updateDetail(row);
			});
		},
		/**
		 * This method restores the detail row cells to there original row position but does not remove the expanded class.
		 * @instance
		 */
		restoreDetails: function(){
			var self = this, $detail, $el;
			self.instance.$table.children('tbody').children('tr.footable-detail-show').each(function () {
				$detail = $(this).next('tr.footable-detail-row');
				$detail.children('td').first()
					.find('.footable-details > tbody > tr').each(function (i, el) {
						$el = $(el);
						$el.data('footable_detail').$cell.append($el.children('td').first().contents());
					});
				$detail.remove();
			});
		},
		/**
		 * Handles the toggle click event for rows.
		 * @instance
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		_onToggleClicked: function (e) {
			var self = e.data.self;
			if (self.instance.columns.hasHidden() && $(e.target).is('tr,td,span.footable-toggle')){ // only execute the toggle code if the event.target matches our check selector
				var row = $(this), hasDetail = row.hasClass('footable-detail-show');
				if (!self.instance.raise('rows_toggle_clicked', [ row, hasDetail ]).isDefaultPrevented()){
					if (hasDetail) self.removeDetail(row.get(0));
					else self.createDetail(row.get(0));
				}
			}
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	/**
	 * A comma separated string of breakpoint names that specify when the column will be hidden.
	 * @type {string}
	 * @default null
	 */
	FooTable.Column.prototype.hide = null;

	/**
	 * An object containing the breakpoints for the plugin.
	 * @type {object.<string, number>}
	 * @default { "phone": 480, "tablet": 1024 }
	 */
	FooTable.Defaults.prototype.breakpoints = null;

	/**
	 * Whether or not to calculate breakpoints on the width of the parent element rather than the viewport.
	 * @type {boolean}
	 * @default false
	 */
	FooTable.Defaults.prototype.useParentWidth = false;

	/**
	 * A function used to override the default getWidth function with a custom one.
	 * @type {function}
	 * @default null
	 * @example <caption>The below shows what the default getWidth function would look like.</caption>
	 * getWidth: function(instance){
	 * 	if (instance.options.useParentWidth == true) return instance.$table.parent().width();
	 * 	return instance.breakpoints.getViewportWidth();
	 * }
	 */
	FooTable.Defaults.prototype.getWidth = null;

	FooTable.Breakpoints = FooTable.Component.extend(/** @lends FooTable.Breakpoints */{
		/**
		 * Contains the logic to calculate and apply breakpoints for the plugin.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance -  The parent {@link FooTable.Instance} this component belongs to.
		 * @returns {FooTable.Breakpoints}
		 */
		ctor: function(instance){
			/**
			 * Used when performing a {@link FooTable.Breakpoints#check} this stores the previous breakpoint value to compare to the current.
			 * @type {string}
			 * @private
			 */
			this._previous = null;
			/**
			 * The name of the current breakpoint.
			 * @type {string}
			 */
			this.current = null;
			/**
			 * A space separated string of all breakpoint names.
			 * @type {string}
			 */
			this.names = '';
			/**
			 * An array of {@link FooTable.Breakpoint} objects created from parsing the options.
			 * @type {Array.<FooTable.Breakpoint>}
			 */
			this.array = [];

			// call the base class constructor
			this._super(instance);
		},
		/**
		 * Provides access to the {@link FooTable.Column} constructor allowing components to modify the object on creation.
		 * @instance
		 * @param {FooTable.Column} column - The column object being constructed.
		 * @param {object} definition - The definition object used to populate the column.
		 */
		ctor_column: function(column, definition){
			column.hide = typeof definition.hide === 'string' ? definition.hide : null;
		},
		/**
		 * Initializes the class parsing the options into a sorted array of {@link FooTable.Breakpoint} objects.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Breakpoints#breakpoints_init
		 */
		init: function(table, options){
			this._generate(options.breakpoints);
			this.current = this.getCurrent();
			/**
			 * The breakpoints_init event raised after the breakpoints have been parsed.
			 * @event FooTable.Breakpoints#breakpoints_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('breakpoints_init');
		},
		/**
		 * Reinitializes the class parsing the options into a sorted array of {@link FooTable.Breakpoint} objects.
		 * @instance
		 * @param {object} options - The options the plugin was reinitialized with.
		 * @fires FooTable.Breakpoints#breakpoints_reinit
		 */
		reinit: function(options){
			this._generate(options.breakpoints);
			this.current = this.getCurrent();
			/**
			 * The breakpoints_init event raised after the breakpoints have been parsed.
			 * @event FooTable.Breakpoints#breakpoints_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('breakpoints_reinit');
		},
		/**
		 * Generates a sorted array of breakpoints from the supplied object populating the {@link FooTable.Breakpoints#array} and {@link FooTable.Breakpoints#name} members.
		 * @instance
		 * @param {object.<string, number>} breakpoints - The breakpoints object from the options.
		 * @private
		 */
		_generate: function(breakpoints){
			var self = this;
			if (breakpoints == null) breakpoints = { phone: 480, tablet: 1024 };
			// Create a nice friendly array to work with out of the breakpoints object.
			for (var name in breakpoints) {
				if (!breakpoints.hasOwnProperty(name)) continue;
				self.array.push(new FooTable.Breakpoint(self.instance, name, breakpoints[name]));
				self.names += (name + ' ');
			}

			// Sort the breakpoints so the smallest is checked first
			self.array.sort(function (a, b) {
				return a.width - b.width;
			});
		},
		/**
		 * Gets the current breakpoint from the {@link FooTable.Breakpoints#array} and returns its name.
		 * @instance
		 * @returns {string}
		 */
		getCurrent: function(){
			var self = this, current = null, breakpoint, width = self.getWidth();
			for (var i = 0, len = self.array.length; i < len; i++) {
				breakpoint = self.array[i];
				if (breakpoint && breakpoint.width && width <= breakpoint.width) {
					current = breakpoint;
					break;
				}
			}
			return current === null ? 'default' : current['name'];
		},
		/**
		 * Gets the width used to determine breakpoints whether it be from the viewport, parent or a custom function.
		 * @instance
		 * @returns {number}
		 */
		getWidth: function(){
			if ($.isFunction(this.instance.options.getWidth)) return this.instance.options.getWidth(this.instance);
			if (this.instance.options.useParentWidth == true) return this.instance.$table.parent().width();
			return this.getViewportWidth();
		},
		/**
		 * Gets the current viewport width.
		 * @instance
		 * @returns {number}
		 */
		getViewportWidth: function(){
			return window.innerWidth || (document.body ? document.body.offsetWidth : 0);
		},
		/**
		 * Performs a check between the current breakpoint and the previous breakpoint and performs a redraw if they differ.
		 * @instance
		 * @fires FooTable.Breakpoints#breakpoints_changed
		 */
		check: function(){
			var self = this;
			self.current = self.getCurrent();
			if (self.current == self._previous) return;
			/**
			 * The breakpoints_changed event is raised when a call to {@link FooTable.Breakpoints#check} determines that the previous and current breakpoint values differ.
			 * @event FooTable.Breakpoints#breakpoints_changed
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} ft - The instance of FooTable raising the event.
			 * @param {string} current - The current breakpoint name.
			 * @param {string} previous - The previous breakpoint name.
			 */
			if (!self.instance.raise('breakpoints_changed', [ self.current, self._previous ]).isDefaultPrevented()) {
				self.instance.draw();
				self._previous = self.current;
			}
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function ($, FooTable) {

	/**
	 * Whether or not the column can be used during filtering. Added by the {@link FooTable.Filtering} component.
	 * @type {boolean}
	 * @default true
	 */
	FooTable.Column.prototype.filterable = true;

	/**
	 * An object containing the filtering options for the plugin. Added by the {@link FooTable.Filtering} component.
	 * @type {object}
	 * @prop {boolean} enabled=false - Whether or not to allow filtering on the table.
	 * @prop {string} query=null - The query to filter the rows by. Rows that match this query are included in the result.
	 * @prop {(Array.<FooTable.Column>|Array.<string>|Array.<number>)} columns=[] - The columns to apply the query to.
	 * @prop {string} delay=500 - The delay in milliseconds before the query is auto applied after a change.
	 */
	FooTable.Defaults.prototype.filtering = {
		enabled: false,
		query: null,
		columns: [],
		delay: 500
	};

	/**
	 * An object containing the filtering options for the request. Added by the {@link FooTable.Filtering} component.
	 * @type {object}
	 * @prop {string} query=null - The query to filter the rows by. Rows that match this query are included in the result.
	 * @prop {(Array.<string>|Array.<FooTable.Column>)} columns=[\] - The columns to apply the query to.
	 */
	FooTable.RequestData.prototype.filtering = {
		query: null,
		columns: []
	};

	FooTable.Filtering = FooTable.Component.extend(/** @lends FooTable.Filtering */{
		/**
		 * The filtering component adds a search input and column selector dropdown to the table allowing users to filter the using space delimited queries.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @returns {FooTable.Filtering}
		 */
		ctor: function (instance) {
			/**
			 * The timeout ID for the filter changed event.
			 * @instance
			 * @type {?number}
			 * @private
			 */
			this._filterTimeout = null;
			/**
			 * The jQuery object that contains the search input and column selector.
			 * @type {jQuery}
			 */
			this.$container = null;
			/**
			 * The jQuery object that contains the column selector dropdown.
			 * @type {jQuery}
			 */
			this.$dropdown_container = null;
			/**
			 * The jQuery object that of the column selector dropdown.
			 * @type {jQuery}
			 */
			this.$dropdown = null;
			/**
			 * The jQuery object of the search input.
			 * @type {jQuery}
			 */
			this.$search_input = null;
			/**
			 * The jQuery object of the search button.
			 * @type {jQuery}
			 */
			this.$search_button = null;
			// call the constructor of the base class
			this._super(instance);
		},
		/**
		 * Allows the filtering component to extend the {@link FooTable.Column} constructor.
		 * @instance
		 * @param {FooTable.Column} column - The column being constructed.
		 * @param {object} definition - The definition to populate the column with.
		 */
		ctor_column: function(column, definition){
			column.filterable = typeof definition.filterable == 'boolean' ? definition.filterable : true;
		},
		/**
		 * Initializes the filtering component for the plugin using the supplied table and options.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Filtering#filtering_init
		 */
		init: function (table, options) {
			if (options.filtering.enabled == false) return;
			this._generate(options);
			/**
			 * The filtering_init event is raised after its UI is generated.
			 * @event FooTable.Filtering#filtering_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('filtering_init');
		},
		/**
		 * Reinitializes the filtering component for the plugin using the supplied options.
		 * @instance
		 * @param {object} options - The options the plugin was reinitialized with.
		 * @fires FooTable.Filtering#filtering_reinit
		 */
		reinit: function (options) {
			this.destroy();
			if (options.filtering.enabled == false) return;
			this._generate(options);
			/**
			 * The filtering_reinit event is raised after its UI is regenerated.
			 * @event FooTable.Filtering#filtering_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('filtering_reinit');
		},
		/**
		 * Destroys the filtering component removing any UI generated from the table.
		 * @instance
		 */
		destroy: function () {
			if (this.instance.options.filtering.enabled == false) return;
			var $thead = this.instance.$table.children('tfoot');
			$thead.children('.footable-filtering').remove();
			if ($thead.children().length == 0) $thead.remove();
		},
		/**
		 * Appends or updates any filtering specific properties on the {@link FooTable.RequestData} object.
		 * @instance
		 * @param {FooTable.RequestData} data - The {@link FooTable.RequestData} object about to passed to the {@link FooTable.Defaults#ajax} method.
		 */
		preajax: function(data){
			if (this.instance.options.filtering.enabled == false) return;
			data.filtering.query = this.instance.options.filtering.query;
			data.filtering.columns = this.instance.options.filtering.columns;
		},
		/**
		 * Performs the filtering of rows before they are appended to the page.
		 * @instance
		 */
		predraw: function(){
			if (this.instance.options.filtering.enabled == false || this.instance.options.ajaxEnabled == true
				|| this.instance.options.filtering.query == null || this.instance.options.filtering.query.length == 0)
				return;

			var self = this, i, text, len = self.instance.rows.array.length, remove = [];
			for (i = 0; i < len; i++){
				text = '';
				for (var j = 0, column; j < self.instance.options.filtering.columns.length; j++){
					column = self.instance.options.filtering.columns[j];
					text += ' ' + self.instance.rows.array[i].cells[column.index].display;
				}
				if (self._filtered(self.instance.options.filtering.query, text)){
					remove.push(i);
				}
			}
			remove.sort(function(a, b){ return a - b; });
			len = remove.length - 1;
			for (i = len; i >= 0; i--){
				self.instance.rows.array.splice(remove[i],1);
			}
		},
		/**
		 * As the rows are drawn by the {@link FooTable.Rows#draw} method this simply updates the colspan for the UI.
		 * @instance
		 */
		draw: function(){
			if (this.instance.options.filtering.enabled == false) return;
			this.$container.children().first().attr('colspan', this.instance.columns.colspan());
		},
		/**
		 * Sets the filtering options and calls the {@link FooTable.Instance#update} method to perform the actual filtering.
		 * @instance
		 */
		filter: function(){
			var self = this, $icon = self.$search_button.children('.glyphicon'), query = (self.$search_input.val() || '').replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
			if ($icon.hasClass('glyphicon-search')){
				$icon.removeClass('glyphicon-search').addClass('glyphicon-remove');
				self.instance.options.filtering.query = query;
				self.instance.options.filtering.columns = self.$dropdown.find('input:checked').map(function(){
					return $(this).data('footable_column');
				});
			} else {
				$icon.removeClass('glyphicon-remove').addClass('glyphicon-search');
				self.instance.options.filtering.query = null;
				self.instance.options.filtering.columns = [];
				self.$search_input.val(self.instance.options.filtering.query);
			}
			self.instance.update();
		},
		/**
		 * Generates the filtering UI from the supplied options.
		 * @instance
		 * @param {object} options - The options to use to generate the filtering UI.
		 * @private
		 */
		_generate: function (options) {
			var self = this;
			// parse the options into actual FooTable.Columns if they are names or indexes.
			for (var column, i = options.filtering.columns.length - 1; i > 0; i--) {
				column = self.instance.columns.getColumn(options.filtering.columns[i]);
				if (column != null) options.filtering.columns[i] = column;
				else options.filtering.columns.splice(i);
			}
			// if no options for filterable columns exists generate a default array using the column.filterable property.
			if (options.filtering.columns.length == 0) {
				options.filtering.columns = self.instance.columns.map(function (col) {
					return col.filterable ? col : null;
				});
			}
			// a a header if none exists
			if (self.instance.$table.children('thead').length == 0) self.instance.$table.prepend('<thead/>');
			// generate the cell that actually contains all the UI.
			var $cell = $('<th/>').attr('colspan', self.instance.columns.colspan());
			// add it to a row and then populate it with the search input and column selector dropdown.
			self.$container = $('<tr/>', {'class': 'footable-filtering'}).append($cell).prependTo(self.instance.$table.children('thead'));
			$('<div/>', {'class': 'input-group'})
				.append(
				(self.$search_input = $('<input/>', {type: 'text', 'class': 'form-control', placeholder: 'Search'}).on('keyup', { self: self }, self._onFilterChanged)),
				(self.$dropdown_container = $('<div/>', {'class': 'input-group-btn'})
					.append(
					(self.$search_button = $('<button/>', {type: 'button', 'class': 'btn btn-primary'}).on('click', { self: self }, self._onFilterClicked)
						.append($('<span/>', {'class': 'glyphicon glyphicon-search'}))),
					$('<button/>', {type: 'button', 'class': 'btn btn-default dropdown-toggle'}).on('click', { self: self }, self._onDropdownClicked)
						.append($('<span/>', {'class': 'caret'})),
					(self.$dropdown = $('<ul/>', {'class': 'dropdown-menu dropdown-menu-right'})
						.append(
						self.instance.columns.map(function (col) {
							return col.filterable && col.visible ? $('<li/>').append(
								$('<label/>', {text: col.title}).prepend(
									$('<input/>', {type: 'checkbox', checked: $.inArray(options.filtering.columns, col)}).on('click', { self: self }, self._onColumnClicked).data('footable_column', col)
								)
							) : null;
						})
					))
				))
			).appendTo($cell);
		},
		/**
		 * Checks if the supplied text is filtered by the query.
		 * @instance
		 * @param {string} query - The query to filter by.
		 * @param {string} text - The text to check.
		 * @returns {boolean}
		 * @private
		 */
		_filtered: function(query, text){
			var queries = query.split(' '), count = queries.length;
			for (var i = 0, len = queries.length; i < len; i++){
				if (text.toUpperCase().indexOf(queries[i].toUpperCase()) >= 0) count--;
			}
			return count > 0;
		},
		/**
		 * Handles the change event for the {@link FooTable.Filtering#$search_input}.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onFilterChanged: function (e) {
			e.preventDefault();
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			self._filterTimeout = setTimeout(function(){
				self._filterTimeout = null;
				var $icon = self.$search_button.children('.glyphicon');
				if (e.which == 27){
					$icon.removeClass('glyphicon-search glyphicon-remove').addClass('glyphicon-remove');
				} else if ($icon.hasClass('glyphicon-remove')){
					$icon.removeClass('glyphicon-remove').addClass('glyphicon-search');
				}
				self.filter();
			}, self.instance.options.filtering.delay);
		},
		/**
		 * Handles the click event for the {@link FooTable.Filtering#$search_button}.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onFilterClicked: function (e) {
			e.preventDefault();
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			self.filter();
		},
		/**
		 * Handles the click event for the column checkboxes in the {@link FooTable.Filtering#$dropdown}.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onColumnClicked: function (e) {
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			self._filterTimeout = setTimeout(function(){
				self._filterTimeout = null;
				var $icon = self.$search_button.children('.glyphicon');
				if ($icon.hasClass('glyphicon-remove')){
					$icon.removeClass('glyphicon-remove').addClass('glyphicon-search');
					self.filter();
				}
			}, self.instance.options.filtering.delay);
		},
		/**
		 * Handles the click event for the {@link FooTable.Filtering#$dropdown} toggle.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onDropdownClicked: function (e) {
			e.preventDefault();
			e.stopPropagation();
			var self = e.data.self;
			self.$dropdown_container.toggleClass('open');
			if (self.$dropdown_container.hasClass('open')) $(document).on('click.footable', { self: self }, self._onDocumentClicked);
			else $(document).off('click.footable', self._onDocumentClicked);
		},
		/**
		 * Checks all click events when the dropdown is visible and closes the menu if the target is not the dropdown.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onDocumentClicked: function(e){
			if ($(e.target).closest('.dropdown-menu').length == 0){
				e.preventDefault();
				var self = e.data.self;
				self.$dropdown_container.removeClass('open');
				$(document).off('click.footable', self._onDocumentClicked);
			}
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	/**
	 * An object containing the paging options for the plugin. Added by the {@link FooTable.Paging} component.
	 * @type {object}
	 * @prop {boolean} enabled=false - Whether or not to allow paging on the table.
	 * @prop {number} current=1 - The page number to display.
	 * @prop {number} size=10 - The number of rows displayed per page.
	 * @prop {number} total=-1 - The total number of rows. This is only required if you are using Ajax to provide paging capabilities.
	 * @prop {object} strings - An object containing the strings used by the paging buttons.
	 * @prop {string} strings.first="&laquo;" - The string used for the 'first' button.
	 * @prop {string} strings.prev="&lsaquo;" - The string used for the 'previous' button.
	 * @prop {string} strings.next="&rsaquo;" - The string used for the 'next' button.
	 * @prop {string} strings.last="&raquo;" - The string used for the 'last' button.
	 * @prop {object} limit - An object containing the paging limit options.
	 * @prop {number} limit.size=5 - The maximum number of page links to display at once.
	 * @prop {string} limit.prev="..." - The string used for the 'previous X pages' button.
	 * @prop {string} limit.next="..." - The string used for the 'next X pages' button.
	 */
	FooTable.Defaults.prototype.paging = {
		enabled: false,
		current: 1,
		total: -1,
		size: 10,
		strings: {
			first: '&laquo;',
			prev: '&lsaquo;',
			next: '&rsaquo;',
			last: '&raquo;'
		},
		limit: {
			size: 5,
			prev: '...',
			next: '...'
		}
	};

	/**
	 * An object containing the paging options for the request. Added by the {@link FooTable.Paging} component.
	 * @type {object}
	 * @prop {number} current=1 - The page number to display.
	 * @prop {number} size=10 - The number of rows displayed per page.
	 */
	FooTable.RequestData.prototype.paging = {
		current: 1,
		size: 10
	};

	/**
	 * An object containing updated paging information for the plugin to use. If rows have been added to the underlying data you can supply the new total row count so the plugin can adjust accordingly.
	 * Added by the {@link FooTable.Paging} component.
	 * @type {object}
	 * @prop {number} total=-1 - The total number of rows available.
	 */
	FooTable.ResponseData.prototype.paging = {
		total: -1
	};

	FooTable.Paging = FooTable.Component.extend(/** @lends FooTable.Paging */{
		/**
		 * The paging component adds a pagination control to the table allowing users to navigate table rows via pages.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @returns {FooTable.Filtering}
		 */
		ctor: function(instance){
			/**
			 * The jQuery object that contains the pagination control.
			 * @type {jQuery}
			 */
			this.$container = null;
			/**
			 * The jQuery object that contains the links for the pagination control.
			 * @type {jQuery}
			 */
			this.$pagination = null;
			/**
			 * The jQuery object that contains the row count.
			 * @type {jQuery}
			 */
			this.$count = null;
			/**
			 * A boolean used to indicate the direction of paging.
			 * @type {boolean}
			 * @private
			 */
			this._forward = false;
			// call the base constructor
			this._super(instance);
		},
		/**
		 * Initializes the paging component for the plugin using the supplied table and options.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Paging#paging_init
		 */
		init: function(table, options){
			if (this.instance.options.paging.enabled == false) return;
			this._generate(options);
			/**
			 * The paging_init event is raised after its UI is generated.
			 * @event FooTable.Paging#paging_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('paging_init');
		},
		/**
		 * Reinitializes the paging component for the plugin using the supplied table and options.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Paging#paging_reinit
		 */
		reinit: function(table, options){
			this.destroy();
			if (this.instance.options.paging.enabled == false) return;
			this._generate(options);
			/**
			 * The paging_reinit event is raised after its UI is regenerated.
			 * @event FooTable.Paging#paging_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('paging_reinit');
		},
		/**
		 * Destroys the paging component removing any UI generated from the table.
		 * @instance
		 */
		destroy: function () {
			if (this.instance.options.paging.enabled == false) return;
			var $tfoot = this.instance.$table.children('tfoot');
			$tfoot.children('.footable-paging').remove();
			if ($tfoot.children().length == 0) $tfoot.remove();
		},
		/**
		 * Appends or updates any filtering specific properties on the {@link FooTable.RequestData} object.
		 * @instance
		 * @param {FooTable.RequestData} data - The {@link FooTable.RequestData} object about to passed to the {@link FooTable.Defaults#ajax} method.
		 */
		preajax: function(data){
			if (this.instance.options.paging.enabled == false) return;
			data.paging.current = this.instance.options.paging.current;
			data.paging.size = this.instance.options.paging.size;
		},
		/**
		 * Parses the ajax response object and sets the current page, size and total if they exists.
		 * @instance
		 * @param {object} response - The response object that contains the paging options.
		 */
		postajax: function(response){
			if (!response.paging) return;
			this.instance.options.paging.total = typeof response.paging.total == 'number' ? response.paging.total : this.instance.options.paging.total;
			this.instance.options.paging.current = typeof response.paging.current == 'number' ? response.paging.current : this.instance.options.paging.current;
			this.instance.options.paging.size = typeof response.paging.size == 'number' ? response.paging.size : this.instance.options.paging.size;
		},
		/**
		 * Performs the actual paging against the {@link FooTable.Rows#array} removing all rows that are not on the current visible page.
		 * @instance
		 */
		predraw: function(){
			if (this.instance.options.paging.enabled == false || this.instance.options.ajaxEnabled == true) return;
			this.instance.options.paging.total = this.instance.rows.array.length == 0 ? 1 : this.instance.rows.array.length;
			this.instance.options.paging.current = this.instance.options.paging.current > this.instance.options.paging.total ? this.instance.options.paging.total : this.instance.options.paging.current;
			var start = (this.instance.options.paging.current - 1) * this.instance.options.paging.size;
			if (this.instance.options.paging.total > this.instance.options.paging.size) this.instance.rows.array = this.instance.rows.array.splice(start, this.instance.options.paging.size);
		},
		/**
		 * Updates the paging UI setting the state of the pagination control.
		 * @instance
		 */
		draw: function(){
			if (this.instance.options.paging.enabled == false) return;
			this.$container.children('td').attr('colspan', this.instance.columns.colspan());
			this._generateLinks();
		},
		/**
		 * Pages to the first page.
		 * @instance
		 */
		first: function(){
			this._set(1, false);
		},
		/**
		 * Pages to the previous page.
		 * @instance
		 */
		prev: function(){
			var page = this.instance.options.paging.current - 1 > 0 ? this.instance.options.paging.current - 1 : 1;
			this._set(page, false);
		},
		/**
		 * Pages to the next page.
		 * @instance
		 */
		next: function(){
			var total = Math.ceil(this.instance.options.paging.total / this.instance.options.paging.size),
				page = this.instance.options.paging.current + 1 < total ? this.instance.options.paging.current + 1 : total;
			this._set(page, true);
		},
		/**
		 * Pages to the last page.
		 * @instance
		 */
		last: function(){
			var page = Math.ceil(this.instance.options.paging.total / this.instance.options.paging.size);
			this._set(page, true);
		},
		/**
		 * Shows the previous X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value.
		 */
		prevX: function(){
			var page = this.$pagination.children('li.footable-page.visible:first').data('page') - 1;
			this._setVisible(page, false, true);
			this._setNavigation(false);
		},
		/**
		 * Shows the next X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value.
		 */
		nextX: function(){
			var page = this.$pagination.children('li.footable-page.visible:last').data('page') + 1;
			this._setVisible(page, false, false);
			this._setNavigation(false);
		},
		/**
		 * Used by the paging functions to set the actual page, direction and then trigger the {@link FooTable.Instance#update} method.
		 * @instance
		 * @param {number} page - The page to set.
		 * @param {boolean} forward - Whether or not the set direction is forward.
		 * @private
		 */
		_set: function(page, forward){
			if (this.instance.options.paging.current == page) return;
			this.instance.options.paging.current = page;
			this._forward = forward;
			this.instance.update();
		},
		/**
		 * Generates the paging UI from the supplied options.
		 * @instance
		 * @param {object} options - The options to use to generate the paging UI.
		 * @private
		 */
		_generate: function(options){
			options.paging.total = options.paging.total == -1
				? this.instance.rows.array.length
				: options.paging.total;

			if (this.instance.$table.children('tfoot').length == 0) this.instance.$table.append('<tfoot/>');
			var $cell = $('<td/>').attr('colspan', this.instance.columns.colspan());
			this.$pagination = $('<ul/>', { 'class': 'pagination' }).on('click.footable', 'a.footable-page-link', { self: this }, this._onPageClicked);
			this.$count = $('<span/>', { 'class': 'label label-default' });
			this._generateLinks();
			$cell.append(this.$pagination, $('<div/>', {'class': 'divider'}), this.$count);
			this.$container = $('<tr/>', { 'class': 'footable-paging' }).append($cell).appendTo(this.instance.$table.children('tfoot'));
		},
		/**
		 * Generates all page links for the pagination control.
		 * @instance
		 * @private
		 */
		_generateLinks: function(){
			var total = Math.ceil(this.instance.options.paging.total / this.instance.options.paging.size),
				multiple = total > 1,
				changed = this.$pagination.children('li.footable-page').length != total;
			if (total == 0){
				this.$pagination.empty();
				return;
			}
			if (!changed && this.$pagination.children('li.footable-page[data-page="'+this.instance.options.paging.current+'"]').hasClass('visible')){
				this._setNavigation(true);
				return;
			}
			this.$pagination.empty();
			if (multiple) this.$pagination.append(this._createLink('first', this.instance.options.paging.strings.first, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('prev', this.instance.options.paging.strings.prev, 'footable-page-nav'));
			if (multiple && this.instance.options.paging.limit.size > 0 && this.instance.options.paging.limit.size < total) this.$pagination.append(this._createLink('prev-limit', this.instance.options.paging.limit.prev, 'footable-page-nav'));

			for (var i = 0, $li; i < total; i++){
				$li = this._createLink(i + 1, i + 1, 'footable-page');
				this.$pagination.append($li);
			}

			if (multiple && this.instance.options.paging.limit.size > 0 && this.instance.options.paging.limit.size < total) this.$pagination.append(this._createLink('next-limit', this.instance.options.paging.limit.next, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('next', this.instance.options.paging.strings.next, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('last', this.instance.options.paging.strings.last, 'footable-page-nav'));

			this._setVisible((this.instance.options.paging.current = this.instance.options.paging.current > total ? (total == 0 ? 1 : total) : this.instance.options.paging.current), this._forward);
			this._setNavigation(true);
		},
		/**
		 * Generates an individual page link for the pagination control using the supplied parameters.
		 * @instance
		 * @param {string} attr - The value for the data-page attribute for the link.
		 * @param {string} html - The inner HTML for the link created.
		 * @param {string} klass - A CSS class or class names (space separated) to add to the link.
		 * @private
		 */
		_createLink: function(attr, html, klass){
			return $('<li/>', { 'class': klass }).attr('data-page', attr).append($('<a/>', { 'class': 'footable-page-link', href: '#' }).data('page', attr).html(html));
		},
		/**
		 * Sets the state for the navigation links of the pagination control and optionally sets the active class state on the individual page links.
		 * @instance
		 * @param {boolean} active - Whether or not to set the active class state on the individual page links.
		 * @private
		 */
		_setNavigation: function(active){
			var total = Math.ceil(this.instance.options.paging.total / this.instance.options.paging.size);

			this.$count.text(this.instance.options.paging.current + ' of ' + total);

			if (this.instance.options.paging.current == 1) this.$pagination.children('li[data-page="first"],li[data-page="prev"]').addClass('disabled');
			else this.$pagination.children('li[data-page="first"],li[data-page="prev"]').removeClass('disabled');

			if (this.instance.options.paging.current == total) this.$pagination.children('li[data-page="next"],li[data-page="last"]').addClass('disabled');
			else this.$pagination.children('li[data-page="next"],li[data-page="last"]').removeClass('disabled');

			if ((this.$pagination.children('li.footable-page.visible:first').data('page') || 1) == 1) this.$pagination.children('li[data-page="prev-limit"]').addClass('disabled');
			else this.$pagination.children('li[data-page="prev-limit"]').removeClass('disabled');

			if ((this.$pagination.children('li.footable-page.visible:last').data('page') || this.instance.options.paging.limit.size) == total) this.$pagination.children('li[data-page="next-limit"]').addClass('disabled');
			else this.$pagination.children('li[data-page="next-limit"]').removeClass('disabled');

			if (active) this.$pagination.children('li.footable-page').removeClass('active').filter('li[data-page="' + this.instance.options.paging.current + '"]').addClass('active');
		},
		/**
		 * Sets the visible page using the supplied parameters.
		 * @instance
		 * @param {number} page - The page to make visible.
		 * @param {boolean} forward - The direction the pagination control should scroll to make the page visible. If set to true the supplied page will be the right most visible pagination link.
		 * @param {boolean} [invert=false] - If invert is set to tru the supplied page will be the left most visible pagination link.
		 * @private
		 */
		_setVisible: function(page, forward, invert){
			if (this.$pagination.children('li.footable-page[data-page="'+page+'"]').hasClass('visible')) return;

			var total = Math.ceil(this.instance.options.paging.total / this.instance.options.paging.size);
			if (this.instance.options.paging.limit.size > 0 && total > this.instance.options.paging.limit.size){
				page -= 1;
				var start = 0, end = 0;
				if (forward == true || invert == true){
					end = page > total ? total : page;
					start = end - this.instance.options.paging.limit.size;
				} else {
					start = page < 0 ? 0 : page;
					end = start + this.instance.options.paging.limit.size;
				}
				if (start < 0){
					start = 0;
					end = this.instance.options.paging.limit.size > total ? total : this.instance.options.paging.limit.size;
				}
				if (end > total){
					end = total;
					start = total - this.instance.options.paging.limit.size < 0 ? 0 : total - this.instance.options.paging.limit.size;
				}
				if (forward == true){
					start++;
					end++;
				}
				this.$pagination.children('li.footable-page').removeClass('visible').slice(start, end).addClass('visible');
			} else {
				this.$pagination.children('li.footable-page').addClass('visible');
			}
		},
		/**
		 * Handles the click event for all links in the pagination control.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onPageClicked: function(e){
			e.preventDefault();
			if ($(e.target).closest('li').is('.active,.disabled')) return;

			var self = e.data.self, page = $(this).data('page');
			switch(page){
				case 'first': self.first();
					return;
				case 'prev': self.prev();
					return;
				case 'next': self.next();
					return;
				case 'last': self.last();
					return;
				case 'prev-limit': self.prevX();
					return;
				case 'next-limit': self.nextX();
					return;
				default: self._set(page, false);
					return;
			}
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function ($, FooTable) {

	/**
	 * The sort function for this column. This is set by the plugin.
	 * @type {function}
	 * @default jQuery.noop
	 */
	FooTable.Column.prototype.sorter = null;
	/**
	 * The direction to sort if the {@link FooTable.Column#sorted} property is set to true. Can be "ASC", "DESC" or NULL.
	 * @type {string}
	 * @default null
	 */
	FooTable.Column.prototype.direction = null;
	/**
	 * Whether or not the column can be sorted.
	 * @type {boolean}
	 * @default true
	 */
	FooTable.Column.prototype.sortable = true;
	/**
	 * Whether or not the column is sorted.
	 * @type {boolean}
	 * @default false
	 */
	FooTable.Column.prototype.sorted = false;

	/**
	 * An object containing the sorting options for the plugin.
	 * @type {object}
	 * @prop {boolean} enabled=false - Whether or not to allow sorting on the table.
	 * @prop {(string|number|FooTable.Column)} column=null - The column to sort on. Can be an instance of FooTable.Column, the name of a column or the index of a column.
	 * @prop {string} direction=null - The direction to sort the column by. Can be "ASC", "DESC" or NULL.
	 */
	FooTable.Defaults.prototype.sorting = {
		enabled: false,
		column: null,
		direction: null
	};

	/**
	 * These sorters are supplied two values from the column and a comparison must be made between them and the result returned.
	 * The name of the sorter must match a {@link FooTable.Column#type} for it to be used automatically by the plugin for those columns.
	 * @summary An object containing the default sorters for the plugin to use.
	 * @type {object.<string, function(HTMLTableCellElement)>}
	 * @default { "text": function, "number": function }
	 * @example <caption>This example shows using pseudo code what a sorter would look like.</caption>
	 * sorters: {
	 *  ...
	 * 	"pseudo": function(a, b){
	 * 		if (a is less than b by some ordering criterion) {
	 * 			return -1;
	 * 		}
	 * 		if (a is greater than b by the ordering criterion) {
	 * 			return 1;
	 * 		}
	 * 		// a must be equal to b
	 * 		return 0;
	 * 	}
	 * }
	 * @example <caption>This example shows how to register a sorter for the custom column type of "example" which is a number.</caption>
	 * sorters: {
	 * 	...
	 * 	"example": function(a, b){
	 * 		return a - b;
	 * 	}
	 * }
	 */
	FooTable.Defaults.prototype.sorters = {
		text: function (a, b) {
			if (typeof(a) === 'string') { a = a.toLowerCase(); }
			if (typeof(b) === 'string') { b = b.toLowerCase(); }
			if (a === b) return 0;
			if (a < b) return -1;
			return 1;
		},
		number: function (a, b) {
			return a - b;
		}
	};

	/**
	 * An object containing the sorting options for the request.
	 * @type {object}
	 * @prop {FooTable.Column} column=null - The column to sort on.
	 * @prop {string} direction=null - The direction to sort the column by. Can be "ASC", "DESC" or NULL.
	 */
	FooTable.RequestData.prototype.sorting = {
		column: null,
		direction: null
	};

	FooTable.Sorting = FooTable.Component.extend(/** @lends FooTable.Sorting */{
		/**
		 * The sorting component adds a small sort button to specified column headers allowing users to sort those columns in the table.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @returns {FooTable.Sorting}
		 */
		ctor: function (instance) {
			this._super(instance);
		},
		/**
		 * Allows the filtering component to extend the {@link FooTable.Column} constructor.
		 * @instance
		 * @param {FooTable.Column} column - The column being constructed.
		 * @param {object} definition - The definition to populate the column with.
		 */
		ctor_column: function(column, definition){
			column.sorter = typeof definition.sorter == 'function' ? definition.sorter : $.noop;
			column.direction = typeof definition.direction == 'string' ? definition.direction : null;
			column.sortable = typeof definition.sortable == 'boolean' ? definition.sortable : true;
			column.sorted = typeof definition.sorted == 'boolean' ? definition.sorted : false;
			if (column.sortable) column.$headerCell.addClass('footable-sortable');
		},
		/**
		 * Initializes the sorting component for the plugin using the supplied table and options.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Sorting#sorting_init
		 */
		init: function (table, options) {
			if (this.instance.options.sorting.enabled == false) return;
			this._generate(options);
			/**
			 * The sorting_init event is raised after its UI is generated.
			 * @event FooTable.Sorting#sorting_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('sorting_init');
		},
		/**
		 * Reinitializes the sorting component for the plugin using the supplied table and options.
		 * @instance
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Sorting#sorting_reinit
		 */
		reinit: function (table, options) {
			this.destroy();
			if (this.instance.options.sorting.enabled == false) return;
			this._generate(options);
			/**
			 * The sorting_reinit event is raised after its UI is regenerated.
			 * @event FooTable.Sorting#sorting_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.instance.raise('sorting_reinit');
		},
		/**
		 * Destroys the sorting component removing any UI generated from the table.
		 * @instance
		 */
		destroy: function () {
			if (this.instance.options.sorting.enabled == false) return;
			this.instance.$table.off('click.footable', '.footable-sortable', this._onSortClicked);
			this.instance.$table.children('thead').children('tr.footable-header')
				.children('.footable-sortable').removeClass('footable-sortable')
				.find('span.direction').remove();
		},
		/**
		 * Appends or updates any sorting specific properties on the {@link FooTable.RequestData} object.
		 * @instance
		 * @param {FooTable.RequestData} data - The {@link FooTable.RequestData} object about to passed to the {@link FooTable.Defaults#ajax} method.
		 */
		preajax: function (data) {
			if (this.instance.options.sorting.enabled == false) return;
			data.sorting.column = this.instance.options.sorting.column;
			data.sorting.direction = this.instance.options.sorting.direction;
		},
		/**
		 * Performs the actual sorting against the {@link FooTable.Rows#array}.
		 * @instance
		 */
		predraw: function () {
			if (this.instance.options.sorting.enabled == false || this.instance.options.ajaxEnabled == true || !this.instance.options.sorting.column || !this.instance.options.sorting.direction) return;
			var self = this;
			self.instance.rows.array.sort(function (a, b) {
				return self.instance.options.sorting.direction == 'ASC'
					? self.instance.options.sorting.column.sorter(a.cells[self.instance.options.sorting.column.index].value, b.cells[self.instance.options.sorting.column.index].value)
					: self.instance.options.sorting.column.sorter(b.cells[self.instance.options.sorting.column.index].value, a.cells[self.instance.options.sorting.column.index].value);
			});
		},
		/**
		 * Updates the sorting UI setting the state of the sort buttons.
		 * @instance
		 */
		draw: function () {
			if (this.instance.options.sorting.enabled == false || !this.instance.options.sorting.column || !this.instance.options.sorting.direction) return;
			var $sortable = this.instance.$table.children('thead').children('tr.footable-header').children('.footable-sortable'),
				$active = $sortable.eq(this.instance.options.sorting.column.index);

			$sortable.removeClass('footable-asc footable-desc').children('.glyphicon').removeClass('glyphicon-sort glyphicon-sort-by-attributes glyphicon-sort-by-attributes-alt');
			$sortable.not($active).children('.glyphicon').addClass('glyphicon-sort');
			$active.addClass(this.instance.options.sorting.direction == 'ASC' ? 'footable-asc' : 'footable-desc')
				.children('.glyphicon').addClass(this.instance.options.sorting.direction == 'ASC' ? 'glyphicon-sort-by-attributes' : 'glyphicon-sort-by-attributes-alt');
		},
		/**
		 * Generates the sorting UI from the supplied options.
		 * @instance
		 * @param {object} options - The options to use to generate UI.
		 * @private
		 */
		_generate: function (options) {
			var self = this;
			options.sorting.column = self.instance.columns.getColumn(options.sorting.column) || self.instance.columns.first(function (col) { return col.sorted; });
			options.sorting.direction = options.sorting.column == null
				? null
				: (options.sorting.direction == null
				? (options.sorting.column.direction == null
				? 'ASC'
				: options.sorting.column.direction)
				: options.sorting.direction);
			self.instance.$table.addClass('footable-sorting').children('thead').children('tr.footable-header').children('th,td').filter(function (i) {
				return self.instance.columns.array[i].sortable == true;
			}).append($('<span/>', {'class': 'glyphicon glyphicon-sort'}));
			self.instance.$table.on('click.footable', '.footable-sortable', { self: self }, self._onSortClicked);
		},
		/**
		 * Handles the sort button clicked event.
		 * @instance
		 * @param {jQuery.Event} e - The event object for the event.
		 * @private
		 */
		_onSortClicked: function (e) {
			e.preventDefault();
			var self = e.data.self, $header = $(this).closest('th,td'), direction = 'ASC';
			self.instance.options.sorting.column = self.instance.columns.array[$header.index()];
			self.instance.options.sorting.direction = $header.is('.footable-asc, .footable-desc') ? ($header.hasClass('footable-desc') ? 'ASC' : 'DESC') : direction;
			self.instance.update();
		}
	});

})(jQuery, FooTable = window.FooTable || {});