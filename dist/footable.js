(function($, FooTable){
	// add in console we use in case it's missing
	window.console = window.console || { log:function(){}, error:function(){} };

	/**
	 * The jQuery plugin initializer.
	 * @function jQuery.fn.footable
	 * @param {(object|FooTable.Defaults)} [options] - The options to initialize the plugin with.
	 * @param {function} [ready] - A callback function to execute for each initialized plugin.
	 * @returns {jQuery}
	 */
	$.fn.footable = function (options, ready) {
		options = options || {};
		// make sure we only work with tables
		return this.filter('table').each(function (i, tbl) {
			if (FooTable.exists(tbl)){
				FooTable.get(tbl).reinit(options, ready);
			} else {
				FooTable.init(tbl, options, ready);
			}
		});
	};

	/**
	 * An array containing all registered components for the plugin.
	 * @type {Array.<FooTable.Component>}
	 * @protected
	 * @readonly
	 */
	FooTable.registered = [];

	/**
	 * Registers the specified component enabling a new instance of it to be created for each new {@link FooTable.Instance}.
	 * @param {FooTable.Component} component - The component to register with the plugin.
	 * @throws {TypeError} The component parameter must be a pointer to a class that inherits from {@link FooTable.Component}.
	 */
	FooTable.register = function(component){
		if (!FooTable.is.fn(component))
			throw new TypeError('The component parameter must be a pointer to a class that inherits from FooTable.Component.');
		FooTable.registered.push(component);
	};

	// The jQuery div object used to convert a JSON object to cssText.
	var _$json2css = $('<div/>');

	/**
	 * Converts the supplied JSON object into a cssText string.
	 * @param {object} obj - An object containing CSS properties and values.
	 * @returns {string}
	 * @protected
	 */
	FooTable.json2css = function(obj){
		return _$json2css.removeAttr('style').css(obj).get(0).style.cssText;
	};

	/**
	 * Retrieves the specified URL parameters' value.
	 * @param {string} name - The name of the parameter to retrieve.
	 * @param {*} [def] - The default value to be returned for the parameter.
	 * @returns {(string|*|undefined)}
	 */
	FooTable.getURLParameter = function (name, def) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])[1].replace(/\+/g, '%20')) || def;
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
		return $(table).eq(0).data('__FooTable__');
	};

	/**
	 * Initializes a new instance of FooTable on the supplied table.
	 * @param {(jQuery|jQuery.selector|HTMLTableElement)} table - The jQuery table object, selector or the HTMLTableElement to initialize FooTable on.
	 * @param {object} options - The options to initialize FooTable with.
	 * @param {function} [ready] - A callback function to execute once the plugin is initialized.
	 * @returns {FooTable.Instance}
	 */
	FooTable.init = function(table, options, ready){
		var $tbl = $(table).eq(0), footable = new FooTable.Instance($tbl.get(0), options, ready);
		$tbl.data('__FooTable__', footable);
		return footable;
	};

	/**
	 * Used to exit early from chained jQuery.Deferred without outputting anything to the console.
	 * @param {string} [message] - The message for the error.
	 * @returns {FooTable.ExitEarly}
	 * @constructor
	 * @ignore
	 */
	FooTable.ExitEarly = function(message) {
		if (!(this instanceof FooTable.ExitEarly)) return new FooTable.ExitEarly(message);
		this.name = 'EarlyExit';
		this.message = message || 'Used to exit early from chained jQuery.Deferred without outputting anything to the console.';
	};
	FooTable.ExitEarly.prototype = new Error();
	FooTable.ExitEarly.prototype.constructor = FooTable.ExitEarly;

	/**
	 * Whether or not we are currently on a mobile device.
	 * @type {boolean}
	 * @protected
	 * @readonly
	 */
	FooTable.isMobile = (function(a){
		return (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)
		||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)));
	})(navigator.userAgent||navigator.vendor||window.opera);

	// The below are external type definitions mainly used as pointers to jQuery docs for important information
	/**
	 * jQuery is a fast, small, and feature-rich JavaScript library. It makes things like HTML document traversal and manipulation, event handling, animation, and Ajax much simpler with an easy-to-use API
	 * that works across a multitude of browsers. With a combination of versatility and extensibility, jQuery has changed the way that millions of people write JavaScript.
	 * @name jQuery
	 * @constructor
	 * @returns {jQuery}
	 * @see {@link http://api.jquery.com/}
	 */

	/**
	 * This object provides a subset of the methods of the Deferred object (then, done, fail, always, pipe, and state) to prevent users from changing the state of the Deferred.
	 * @typedef {object} jQuery.Promise
	 * @see {@link http://api.jquery.com/Types/#Promise}
	 */

	/**
	 * As of jQuery 1.5, the Deferred object provides a way to register multiple callbacks into self-managed callback queues, invoke callback queues as appropriate,
	 * and relay the success or failure state of any synchronous or asynchronous function.
	 * @typedef {object} jQuery.Deferred
	 * @see {@link http://api.jquery.com/Types/#Deferred}
	 */

	/**
	 * jQuery's event system normalizes the event object according to W3C standards. The event object is guaranteed to be passed to the event handler. Most properties from
	 * the original event are copied over and normalized to the new event object.
	 * @typedef {object} jQuery.Event
	 * @see {@link http://api.jquery.com/category/events/event-object/}
	 */

	/**
	 * Provides a way to execute callback functions based on one or more objects, usually Deferred objects that represent asynchronous events.
	 * @memberof jQuery
	 * @function when
	 * @param {...jQuery.Deferred} deferreds - Any number of deferred objects to wait for.
	 * @returns {jQuery.Promise}
	 * @see {@link http://api.jquery.com/jQuery.when/}
	 */

	/**
	 * The jQuery.fn namespace used to register plugins with jQuery.
	 * @memberof jQuery
	 * @namespace fn
	 * @see {@link http://learn.jquery.com/plugins/basic-plugin-creation/}
	 */
})(
	jQuery,
	/**
	 * The core FooTable namespace containing all the plugin code.
	 * @namespace
	 */
	FooTable = window.FooTable || {}
);
(function (FooTable) {

	/**
	 * The is namespace contains commonly used check methods that return boolean values.
	 * @namespace
	 */
	FooTable.is = {};

	/**
	 * Checks if the type of the value is the same as that supplied.
	 * @param {*} value - The value to check the type of.
	 * @param {string} type - The type to check for.
	 * @returns {boolean}
	 */
	FooTable.is.type = function (value, type) {
		return typeof value === type;
	};

	/**
	 * Checks if the value is defined.
	 * @param {*} value - The value to check is defined.
	 * @returns {boolean}
	 */
	FooTable.is.defined = function (value) {
		return typeof value !== 'undefined';
	};

	/**
	 * Checks if the value is undefined.
	 * @param {*} value - The value to check is undefined.
	 * @returns {boolean}
	 */
	FooTable.is.undef = function (value) {
		return typeof value === 'undefined';
	};

	/**
	 * Checks if the value is an array.
	 * @param {*} value - The value to check.
	 * @returns {boolean}
	 */
	FooTable.is.array = function (value) {
		return '[object Array]' === Object.prototype.toString.call(value);
	};

	/**
	 * Checks if the value is a boolean.
	 * @param {*} value - The value to check.
	 * @returns {boolean}
	 */
	FooTable.is.boolean = function (value) {
		return '[object Boolean]' === Object.prototype.toString.call(value);
	};

	/**
	 * Checks if the value is a function.
	 * @param {*} value - The value to check.
	 * @returns {boolean}
	 */
	FooTable.is.fn = function (value) {
		var isAlert = typeof window !== 'undefined' && value === window.alert;
		return isAlert || '[object Function]' === Object.prototype.toString.call(value);
	};

	/**
	 * Checks if the value is an object.
	 * @param {*} value - The value to check.
	 * @returns {boolean}
	 */
	FooTable.is.object = function (value) {
		return '[object Object]' === Object.prototype.toString.call(value);
	};

	/**
	 * Checks if the value is a hash.
	 * @param {*} value - The value to check.
	 * @returns {boolean}
	 */
	FooTable.is.hash = function (value) {
		return FooTable.is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
	};

	/**
	 * Checks if the supplied object is an HTMLElement
	 * @param {object} obj - The object to check.
	 * @returns {boolean}
	 */
	FooTable.is.element = function (obj) {
		return typeof HTMLElement === 'object'
			? obj instanceof HTMLElement
			: obj && typeof obj === 'object' && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === 'string';
	};

	/**
	 * Checks if the supplied string is a CSS selector.
	 * @param {string} str - The string to check.
	 * @returns {boolean}
	 */
	FooTable.is.selector = function (str) {
		try {
			document.querySelector(str);
			return true;
		} catch (e) {
			return false;
		}
	};

	/**
	 * Checks if the supplied string contains HTML and should be interpreted as an HTMLString.
	 * @param {string} str - The string to check.
	 * @returns {boolean}
	 */
	FooTable.is.html = function (str) {
		try {
			return /<(br|basefont|hr|input|source|frame|param|area|meta|!--|col|link|option|base|img|wbr|!DOCTYPE).*?>|<(a|abbr|acronym|address|applet|article|aside|audio|b|bdi|bdo|big|blockquote|body|button|canvas|caption|center|cite|code|colgroup|command|datalist|dd|del|details|dfn|dialog|dir|div|dl|dt|em|embed|fieldset|figcaption|figure|font|footer|form|frameset|head|header|hgroup|h1|h2|h3|h4|h5|h6|html|i|iframe|ins|kbd|keygen|label|legend|li|map|mark|menu|meter|nav|noframes|noscript|object|ol|optgroup|output|p|pre|progress|q|rp|rt|ruby|s|samp|script|section|select|small|span|strike|strong|style|sub|summary|sup|table|tbody|td|textarea|tfoot|th|thead|time|title|tr|track|tt|u|ul|var|video).*?<\/\2>/i.test(str);
		} catch (e) {
			return false;
		}
	};

	/**
	 * Checks if the supplied value is a member or value depending on if the target is an object or an array.
	 * @param {(string|*)} value - The member or value to check for.
	 * @param {(Object|Array)} target - The object or array to check.
	 * @returns {boolean}
	 */
	FooTable.is.any = function (value, target) {
		if (FooTable.is.array(target)) {
			var l = target.length + 1;
			while (l -= 1) if (target[l - 1] === value) return true;
		} else if (FooTable.is.object(target)) {
			return value in target;
		}
		return false;
	};

})(FooTable = window.FooTable || {});
(function ($, FooTable) {
	/**
	 * The strings namespace contains commonly used string utility methods such as {@link FooTable.strings.startsWith} and {@link FooTable.strings.endsWith}.
	 * @namespace
	 */
	FooTable.strings = {
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
	};

})(jQuery, FooTable = window.FooTable || {});
(function (FooTable) {
	"use strict";

	if (!FooTable.is.fn(Object.create)) {
		Object.create = (function () {
			var Object = function () {};
			return function (prototype) {
				if (arguments.length > 1)
					throw Error('Second argument not supported');

				if (!FooTable.is.object(prototype))
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
			proto[name] = FooTable.is.fn(props[name]) && FooTable.is.fn(_super[name]) && fnTest.test(props[name]) ?
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
		var newClass = FooTable.is.fn(proto.ctor) ?
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
			this.ft = instance;
		},
		/**
		 * The construct method called from within the {@link FooTable.Cell} constructor.
		 * @instance
		 * @param {FooTable.Cell} cell - The cell object being constructed.
		 * @protected
		 */
		ctor_cell: function(cell){},
		/**
		 * The construct method called from within the {@link FooTable.Column} constructor.
		 * @instance
		 * @param {FooTable.Column} column - The column object being constructed.
		 * @param {object} definition - The definition object used to populate the column.
		 * @protected
		 */
		ctor_column: function(column, definition){},
		/**
		 * The construct method called from within the {@link FooTable.Row} constructor.
		 * @instance
		 * @param {FooTable.Row} row - The row object being constructed.
		 * @protected
		 */
		ctor_row: function(row){},
		/**
		 * The initialize method is called during the parent {@link FooTable.Instance}'s constructor call.
		 * @instance
		 * @param {HTMLElement} element - The element the parent instance is initializing on.
		 * @param {object} options - The options the parent instance is using to initialize. See {@link FooTable.Defaults} for more information.
		 * @protected
		 */
		preinit: function (element, options) {},
		/**
		 * The initialize method is called during the parent {@link FooTable.Instance} constructor call.
		 * @instance
		 * @param {HTMLElement} element - The element the parent instance is initializing on.
		 * @param {object} options - The options the parent instance is using to initialize. See {@link FooTable.Defaults} for more information.
		 * @protected
		 */
		init: function (element, options) {},
		/**
		 * The reinitialize method called from the {@link FooTable.Instance#reinit} method.
		 * @instance
		 * @param {object} options - The options the parent instance is using to initialize. See {@link FooTable.Defaults} for more information.
		 * @protected
		 */
		reinit: function (options) {},
		/**
		 * This method is called from the {@link FooTable.Instance#destroy} method.
		 * @instance
		 * @protected
		 */
		destroy: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#ajax} method.
		 * @instance
		 * @protected
		 */
		preajax: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#ajax} method.
		 * @instance
		 * @protected
		 */
		postajax: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#draw} method.
		 * @instance
		 * @protected
		 */
		predraw: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#draw} method.
		 * @instance
		 * @protected
		 */
		draw: function () {},
		/**
		 * This method is called from the {@link FooTable.Instance#draw} method.
		 * @instance
		 * @protected
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
		 * Whether or not events raised using the {@link FooTable.Instance#raise} method are propagated up the DOM. By default this is set to true and all events can only be listened for on the
		 * table itself. The reason for this if you have nested tables, the parent table would receive all the events raised by it's children and any handlers bound to both the parent and child
		 * would be triggered which is not the desired behavior.
		 * @type {boolean}
		 * @default true
		 */
		this.stopPropagation = true;
		/**
		 * The namespace appended to all events raised by the plugin.
		 * @type {string}
		 * @default NULL
		 */
		this.namespace = null;
		/**
		 * An object in which the string keys represent one or more space-separated event types and optional namespaces, and the values represent a handler function to be called for the event(s).
		 * @type {object.<string, function>}
		 * @default NULL
		 * @example <caption>This example shows how to pass an object containing the events and handlers.</caption>
		 * on: {
		 * 	click: function(e){
		 * 		// do something whenever the table is clicked
		 * 	},
		 * 	"init": function(e, instance){
		 * 		// do something when FooTable initializes
		 * 	},
		 * 	"init reinit": function(e, instance){
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

	FooTable.Breakpoint = FooTable.Class.extend(/** @lends FooTable.Breakpoint */{
		/**
		 * The breakpoint class containing the name and maximum width for the breakpoint.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {string} name - The name of the breakpoint. Must contain no spaces or special characters.
		 * @param {number} width - The width of the breakpoint in pixels.
		 * @returns {FooTable.Breakpoint}
		 */
		ctor: function(name, width){
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
			this.ft = instance;
			/**
			 * The parent {@link FooTable.Row} for the cell.
			 * @type {FooTable.Row}
			 */
			this.row = row;
			/**
			 * The jQuery table cell object this instance wraps.
			 * @type {jQuery}
			 */
			this.$el = $(cell);
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
			 * The display value of the cell, this can be HTML.
			 * @type {string}
			 */
			this.display = FooTable.is.fn(column.formatter) ? column.formatter(value) : value;

			this.ft.execute('ctor_cell', this);

			// set the cells' html to the display value
			this.$el.html(this.display);
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	FooTable.Column = FooTable.Class.extend(/** @lends FooTable.Column */{
		/**
		 * The column class containing all the properties for columns. All members marked as "set by the plugin" should not be used when defining {@link FooTable.Defaults#columns}.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {FooTable.Instance} instance -  The parent {@link FooTable.Instance} this component belongs to.
		 * @param {HTMLElement} cell - The column header cell element.
		 * @param {object} definition - An object containing all the properties to set for the column.
		 * @returns {FooTable.Column}
		 */
		ctor: function(instance, cell, definition){
			/**
			 * The {@link FooTable.Instance} for the column. This is set by the plugin during initialization.
			 * @type {FooTable.Instance}
			 */
			this.ft = instance;
			/**
			 * The jQuery cell object for the column header. This is set by the plugin during initialization.
			 * @type {jQuery}
			 */
			this.$el = $(cell);
			/**
			 * The index of the column in the table. This is set by the plugin during initialization.
			 * @type {number}
			 * @default -1
			 */
			this.index = FooTable.is.type(definition.index, 'number') ? definition.index : -1;
			/**
			 * Whether or not this column is hidden from view and appears in the details row. This is set by the plugin during initialization.
			 * @type {boolean}
			 * @default false
			 */
			this.hidden = FooTable.is.boolean(definition.hidden) ? definition.hidden : false;
			/**
			 * Whether or not this column is completely hidden from view and will not appear in the details row.
			 * @type {boolean}
			 * @default true
			 */
			this.visible = FooTable.is.boolean(definition.visible) ? definition.visible : true;
			/**
			 * The parse function for this column. This is set by the plugin during initialization.
			 * @type {function}
			 * @default jQuery.noop
			 */
			this.parser = FooTable.is.fn(definition.parser) ? definition.parser : $.noop;
			/**
			 * Whether or not to force a column to hide overflow with an ellipsis.
			 * @type {boolean}
			 * @default false
			 */
			this.ellipsis = FooTable.is.boolean(definition.ellipsis) ? definition.ellipsis : false;
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
			this.formatter = FooTable.is.fn(definition.formatter) ? definition.formatter : null;
			/**
			 * Specifies the maximum width for the column.
			 * @type {number}
			 * @default null
			 */
			this.maxWidth = FooTable.is.type(definition.maxWidth, 'number') ? definition.maxWidth : null;
			/**
			 * Specifies the minimum width for the column.
			 * @type {number}
			 * @default null
			 */
			this.minWidth = FooTable.is.type(definition.minWidth, 'number') ? definition.minWidth : null;
			/**
			 * The name of the column. This name must correspond to the property name of the JSON row data.
			 * @type {string}
			 * @default null
			 */
			this.name = FooTable.is.type(definition.name, 'string') ? definition.name : null;
			/**
			 * Whether or not the column is the primary key for the row.
			 * @type {boolean}
			 * @default false
			 */
			this.pk = FooTable.is.boolean(definition.pk) ? definition.pk : false;
			/**
			 * The title to display in the column header, this can be HTML.
			 * @type {string}
			 * @default null
			 */
			this.title = FooTable.is.type(definition.title, 'string') ? definition.title : null;
			/**
			 * The type of data displayed by the column.
			 * @type {string}
			 * @default "text"
			 */
			this.type = FooTable.is.type(definition.type, 'string') ? definition.type : 'text';
			/**
			 * Specifies the width for the column.
			 * @type {number}
			 * @default null
			 */
			this.width = FooTable.is.type(definition.width, 'number') ? definition.width : null;
			/**
			 * Whether or not to force a column to wrap overflow onto a new line. Takes precedence over the {@link FooTable.Column#ellipsis} option.
			 * @type {boolean}
			 * @default false
			 */
			this.wrap = FooTable.is.boolean(definition.wrap) ? definition.wrap : false;

			this.ft.execute('ctor_column', this, definition);

			// set the header cell's title
			this.$el.html(this.title);
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
			this.ft = instance;
			/**
			 * The jQuery row object.
			 * @type {jQuery}
			 */
			this.$el = $(row);
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

			this.ft.execute('ctor_row', this);

			// add this object to the row
			this.$el.data('__FooTableRow__', this);
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	FooTable.Filter = FooTable.Class.extend(/** @lends FooTable.Filter */{
		/**
		 * The filter object contains the query to filter by and the columns to apply it to.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {string} query - The query for the filter.
		 * @param {Array.<FooTable.Column>} columns - The columns to apply the query to.
		 * @returns {FooTable.Filter}
		 */
		ctor: function(query, columns){
			/**
			 * The query for the filter.
			 * @type {string}
			 */
			this.query = query;
			/**
			 * The columns to apply the query to.
			 * @type {Array.<FooTable.Column>}
			 */
			this.columns = columns;
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	FooTable.Sorter = FooTable.Class.extend(/** @lends FooTable.Sorter */{
		/**
		 * The sorter object contains the column and direction to sort by.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {FooTable.Column} column - The column to sort.
		 * @param {string} direction - The direction to sort by.
		 * @returns {FooTable.Sorter}
		 */
		ctor: function(column, direction){
			/**
			 * The column to sort.
			 * @type {FooTable.Column}
			 */
			this.column = column;
			/**
			 * The direction to sort by.
			 * @type {string}
			 */
			this.direction = direction;
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	FooTable.Pager = FooTable.Class.extend(/** @lends FooTable.Pager */{
		/**
		 * The pager object contains the page number and direction to page to.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {number} page - The page number to goto.
		 * @param {boolean} forward - The boolean indicating the direction of paging, TRUE = forward, FALSE = back.
		 * @returns {FooTable.Pager}
		 */
		ctor: function(page, forward){
			/**
			 * The page number to goto.
			 * @type {number}
			 */
			this.page = page;
			/**
			 * A boolean indicating the direction of paging, TRUE = forward, FALSE = back.
			 * @type {boolean}
			 */
			this.forward = forward;
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function ($, FooTable) {

	/**
	 * An array of all currently loaded instances of the plugin.
	 * @protected
	 * @readonly
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
		 * @param {function} [ready] - A callback function to execute once the plugin is initialized.
		 * @returns {FooTable.Instance}
		 */
		ctor: function (element, options, ready) {
			var self = this;
			//BEGIN MEMBERS
			/**
			 * The timeout ID for the resize event.
			 * @instance
			 * @private
			 * @type {?number}
			 */
			this._resizeTimeout = null;
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
			 * The components for this instance of the plugin. These are executed in the order they appear in the array for the initialize phase and in reverse order for the destroy phase of the plugin.
			 * @instance
			 * @protected
			 * @type {object}
			 * @prop {Array.<FooTable.Component>} internal - The internal components for the plugin. These are executed either before all other components in the initialize phase or after them in the destroy phase of the plugin.
			 * @prop {Array.<FooTable.Component>} core - The core components for the plugin. These are executed either after the internal components in the initialize phase or before them in the destroy phase of the plugin.
			 * @prop {Array.<FooTable.Component>} custom - The custom components for the plugin. These are executed either after the core components in the initialize phase or before them in the destroy phase of the plugin.
			 */
			this.components = {
				internal: [self.breakpoints, self.columns, self.rows],
				core: [new FooTable.Filtering(self), new FooTable.Sorting(self), new FooTable.Paging(self)],
				custom: []
			};
			// load all registered components
			$.each(FooTable.registered, function(i, addOn){
				self.components.custom.push(new addOn(self));
			});

			//END MEMBERS
			self._init(element, self.options, ready);
		},
		/**
		 * Initializes this instance of the plugin with the supplied element and options.
		 * @instance
		 * @private
		 * @param {HTMLElement} element - The table element to initialize the plugin on.
		 * @param {object} options - The options to initialize the plugin with.
		 * @param {function} [callback] - A callback function to execute once the plugin is initialized.
		 * @return {jQuery.Promise}
		 * @fires FooTable.Instance#preinit
		 * @fires FooTable.Instance#init
		 */
		_init: function(element, options, callback){
			var self = this;
			callback = FooTable.is.fn(callback) ? callback : $.noop;
			if (FooTable.is.hash(options.on)) self.$table.on(options.on);
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
					callback.call(self, self);
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
		 * @param {function} [callback] - A callback function to execute once the plugin is reinitialized.
		 * @return {jQuery.Promise}
		 * @fires FooTable.Instance#reinit
		 */
		reinit: function (options, callback) {
			var self = this;
			callback = FooTable.is.fn(callback) ? callback : $.noop;
			self.initialized = false;
			self.$loader.remove();
			self.clearCSSRules();
			// cleanup any previously bound events before we merge the new options with the old
			if (FooTable.is.hash(self.options.on)) self.$table.off(self.options.on);
			$.extend(true, self.options, options);

			if (FooTable.is.hash(options.on)) self.$table.on(self.options.on);
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
				callback.call(self, self);
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
				if (FooTable.is.hash(self.options.on)) self.$table.off(self.options.on);
			});
		},
		/**
		 * Raises an event on this instance supplying the args array as additional parameters to the handlers.
		 * @instance
		 * @param {string} eventName - The name of the event to raise, this can include namespaces.
		 * @param {Array} [args] - An array containing additional parameters to be passed to any bound handlers.
		 * @returns {jQuery.Event}
		 */
		raise: function (eventName, args) {
			args = args || [];
			args.unshift(this);
			if (!FooTable.strings.isNullOrEmpty(this.options.namespace) && !FooTable.strings.contains(eventName, '.')) {
				eventName = FooTable.strings.join('.', eventName, this.options.namespace);
			}
			var evt = $.Event(eventName);
			if (this.options.stopPropagation == true){
				this.$table.one(eventName, function (e) {e.stopPropagation();});
			}
			this.$table.trigger(evt, args);
			return evt;
		},
		/**
		 * Attempts to retrieve the instance of the supplied component type for this instance.
		 * @instance
		 * @param {object} type - The content type to retrieve for this instance.
		 * @returns {(*|null)}
		 */
		use: function(type){
			var components = this.components.internal.concat(this.components.core, this.components.custom);
			for (var i = 0, len = components.length; i < len; i++){
				if (components[i] instanceof type) return components[i];
			}
			return null;
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
		 * Executes the ajax function and loads the response into the plugin.
		 * @instance
		 * @protected
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
		 * @protected
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
		 * Executes the specified method with the optional number of parameters on all components.
		 * @instance
		 * @protected
		 * @param {string} methodName - The name of the method to execute.
		 * @param {*} [param1] - The first parameter for the method.
		 * @param {...*} [paramN] - Any number of additional parameters for the method.
		 * @returns {jQuery.Promise}
		 */
		execute: function (methodName, param1, paramN) {
			var self = this,
				args = Array.prototype.slice.call(arguments),
				components = self.components.internal.concat(self.components.core, self.components.custom);
			methodName = args.shift();
			$.each(components, function(i, component){
				if (FooTable.is.fn(component[methodName])) {
					component[methodName].apply(component, args);
				}
			});
		},
		/**
		 * Executes the specified method with the optional number of parameters on all components and waits for all promises to be resolved.
		 * @instance
		 * @protected
		 * @param {boolean} reverse - Whether or not to execute the component methods in the reverse order to what they were registered in.
		 * @param {boolean} chain - Whether or not to chain all the method calls waiting for the result of the first before calling the second and so on.
		 * @param {string} methodName - The name of the method to execute.
		 * @param {*} [param1] - The first parameter for the method.
		 * @param {...*} [paramN] - Any number of additional parameters for the method.
		 * @returns {jQuery.Promise}
		 */
		when: function(reverse, chain, methodName, param1, paramN){
			var self = this, args = Array.prototype.slice.call(arguments);
			reverse = args.shift();
			chain = args.shift();
			var exec = chain ? self._chain : self._when;
			args.unshift(reverse ? self.components.custom.slice(0).reverse() : self.components.internal.slice(0));
			return exec.apply(self, args).then(function(){
				args.shift();
				args.unshift(reverse ? self.components.core.slice(0).reverse() : self.components.core.slice(0));
				return exec.apply(self, args).then(function(){
					args.shift();
					args.unshift(reverse ? self.components.internal.slice(0).reverse() : self.components.custom.slice(0));
					return exec.apply(self, args);
				});
			});
		},
		/**
		 * Clears all rules from this instances' {@link FooTable.Instance#$styles} tag.
		 * @instance
		 * @protected
		 */
		clearCSSRules: function(){
			this.$styles.html('');
		},
		/**
		 * Adds the supplied selector and cssText to this instances' {@link FooTable.Instance#$styles} tag.
		 * @instance
		 * @protected
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
		 * Executes the specified method with the optional number of parameters on all supplied components.
		 * @instance
		 * @private
		 * @param {Array.<FooTable.Component>} components - The components to call the method on.
		 * @param {string} methodName - The name of the method to execute
		 * @param {*} [param1] - The first parameter for the method.
		 * @param {...*} [paramN] - Any additional parameters for the method.
		 * @returns {jQuery.Promise}
		 */
		_when: function (components, methodName, param1, paramN) {
			if (!components || !components.length) return $.when();
			var args = Array.prototype.slice.call(arguments),
				methods = [];
			components = args.shift();
			methodName = args.shift();
			$.each(components, function(i, component){
				if (FooTable.is.fn(component[methodName])) {
					methods.push(component[methodName].apply(component, args));
				}
			});
			return $.when.apply($, methods);
		},
		/**
		 * Executes the specified method with the optional number of parameters on all supplied components waiting for the result of each before executing the next.
		 * @instance
		 * @private
		 * @param {Array.<FooTable.Component>} components - The components to call the method on.
		 * @param {string} methodName - The name of the method to execute
		 * @param {*} [param1] - The first parameter for the method.
		 * @param {...*} [paramN] - Any additional parameters for the method.
		 * @returns {jQuery.Promise}
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
	 * An object containing the column definitions for the table. The name of each of the properties on this object must match the zero based index of each column in the table.
	 * @type {object.<number, object>}
	 * @default {}
	 * @example <caption>The below shows the column definitions for a simple row defined as <code>{ id: Number, name: String, age: Number }</code>. The ID column has a fixed width, the table is initially sorted on the Name column and the Age column will be hidden on phones.</caption>
	 * columns: {
	 * 	0: { name: 'id', title: 'ID', width: 80, type: 'number' },
	 *	1: { name: 'name', title: 'Name', sorted: true, direction: 'ASC' }
	 *	2: { name: 'age', title: 'Age', type: 'number', hide: 'phone' }
	 * }
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

			/* PROTECTED */
			/**
			 * This provides a shortcut to the {@link FooTable.Instance#options} object.
			 * @protected
			 * @type {FooTable.Instance#options}
			 */
			this.o = instance.options;

			/* PUBLIC */
			/**
			 * An array of {@link FooTable.Column} objects created from parsing the options and/or DOM.
			 * @type {Array.<FooTable.Column>}
			 */
			this.array = [];

			// call the base class constructor
			this._super(instance);
		},

		/* PROTECTED */
		/**
		 * Initializes the columns creating the table header if required.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Columns#columns_init
		 */
		init: function(table, options){
			if (this.ft.$table.children('thead').length == 0) this.ft.$table.prepend('<thead/>');
			var last = this.ft.$table.children('thead').children('tr').not('.footable-filtering,.footable-paging').last().get(0);
			this.array = (last instanceof HTMLTableRowElement) ? this.fromDOM(last) : this.fromJSON(options.columns);
			this._generateCSS();
			/**
			 * The columns_init event is raised after the header row is created/parsed for column data.
			 * @event FooTable.Columns#columns_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Column>} columns - The array of {@link FooTable.Column} objects parsed from the options and/or DOM.
			 */
			this.ft.raise('columns_init', [ this.array ]);
		},
		/**
		 * Reinitializes the columns creating the table header if required.
		 * @instance
		 * @protected
		 * @param {object} options - The options the plugin was reinitialized with.
		 * @fires FooTable.Columns#columns_reinit
		 */
		reinit: function(options){
			if (this.ft.$table.children('thead').length == 0) this.ft.$table.prepend('<thead/>');
			var last = this.ft.$table.children('thead').children('tr').not('.footable-filtering,.footable-paging').last().get(0);
			this.array = (last instanceof HTMLTableRowElement) ? this.fromDOM(last) : this.fromJSON(options.columns);
			this._generateCSS();
			/**
			 * The columns_reinit event is raised after the header row is created/parsed for column data.
			 * @event FooTable.Columns#columns_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Column>} columns - The array of {@link FooTable.Column} objects parsed from the options and/or DOM.
			 */
			this.ft.raise('columns_reinit', [ this.array ]);
		},
		/**
		 * The predraw method called from within the {@link FooTable.Instance#draw} method.
		 * @instance
		 * @protected
		 */
		predraw: function(){
			var self = this;
			$.each(self.array, function(i, col){
				col.hidden = FooTable.strings.contains(col.hide, self.ft.breakpoints.current) || FooTable.strings.contains(col.hide, 'all');
			});
		},
		/**
		 * The postdraw method called from within the {@link FooTable.Instance#draw} method.
		 * @instance
		 * @protected
		 */
		postdraw: function(){
			var self = this;
			$.each(self.array, function(i, col){
				self.toggle(col.index, !col.hidden);
			});
		},
		/**
		 * Parses the supplied rows' cells to produce an array of {@link FooTable.Column}s.
		 * @instance
		 * @protected
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
				}, self.o.columns[i] || {}, $cell.data(), { index: i });
				definition.sorter = self.o.sorters[definition.type] || self.o.sorters.text;
				definition.parser = self.o.parsers[definition.type] || self.o.parsers.text;
				column = new FooTable.Column(self.ft, $cell, definition);
				columns.push(column);
			}
			return columns;
		},
		/**
		 * Parses the supplied JSON object to produce an array of {@link FooTable.Column}s and generates the table header.
		 * @instance
		 * @protected
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
					definition.sorter = self.o.sorters[definition.type] || self.o.sorters.text;
					definition.parser = self.o.parsers[definition.type] || self.o.parsers.text;
					column = new FooTable.Column(self.ft, document.createElement('th'), definition);
					column.$el.appendTo($row);
					columns.push(column);
				}
			}
			self.ft.$table.children('thead').append($row);
			return columns;
		},

		/* PUBLIC */
		/**
		 * Toggles the visibility of the supplied column.
		 * @instance
		 * @param {(FooTable.Column|string|number)} column - The column to toggle.
		 * @param {boolean} hidden - Whether or not to hide the column.
		 * @example <caption>This example shows how to hide the second column in a table. The <code>columns</code> object is an instance of {@link FooTable.Columns}.</caption>
		 * columns.toggle(1, true); // the index for the second column is 1 as it is zero based
		 */
		toggle: function(column, hidden) {
			column = this.get(column);
			this.ft.$table.children('thead,tbody,tfoot').children('tr').not('.footable-detail-row,.footable-paging,.footable-filtering').each(function(i, row){
				if (column.index >= 0 && column.index < row.cells.length) {
					row.cells[column.index].style.display = hidden ? 'table-cell' : 'none';
				}
			});
		},
		/**
		 * Attempts to return a {@link FooTable.Column} instance when passed the {@link FooTable.Column} instance, the {@link FooTable.Column#name} string or the {@link FooTable.Column#index} number.
		 * @instance
		 * @param {(FooTable.Column|string|number)} column - The column to retrieve.
		 * @returns {(FooTable.Column|null)} The column if one is found otherwise it returns NULL.
		 * @example <caption>This example shows retrieving a column by name assuming a column called "id" exists. The <code>columns</code> object is an instance of {@link FooTable.Columns}.</caption>
		 * var column = columns.get('id');
		 * if (column instanceof FooTable.Column){
		 * 	// found the "id" column
		 * } else {
		 * 	// no column with a name of "id" exists
		 * }
		 */
		get: function(column){
			if (column instanceof FooTable.Column) return column;
			if (FooTable.is.type(column, 'string')) return this.first(function (col) { return col.name == column; });
			if (FooTable.is.type(column, 'number')) return this.first(function (col) { return col.index == column; });
			return null;
		},
		/**
		 * Translate all items in the {@link FooTable.Columns#array} to a new array of items.
		 * @instance
		 * @param {function} callback - The function to process each column with.
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
			if (!FooTable.is.fn(callback)) { return result; }
			for (var i = 0, len = this.array.length; i < len; i++) {
				if ((returned = callback(this.array[i])) != null) result.push(returned);
			}
			return result;
		},
		/**
		 * Returns the first instance of {@link FooTable.Column} that matches the supplied where function.
		 * @instance
		 * @param {function} where - The function to process each column with. The first argument to the function is the {@link FooTable.Column} object. The function must return a boolean value.
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
		 * @param {function} where - The function to process each column with. The first argument to the function is the {@link FooTable.Column} object. The function must return a boolean value.
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
		 * Checks if there are any columns that match the supplied where function.
		 * @instance
		 * @param {function} where - The function to process each column with. The first argument to the function is the {@link FooTable.Column} object. The function must return a boolean value.
		 * @returns {boolean}
		 */
		any: function(where){
			var self = this;
			where = where || function () { return self.array.length > 0; };
			return self.first(where) instanceof FooTable.Column;
		},
		/**
		 * Takes an array of column names, index's or actual {@link FooTable.Column} and ensures that an array of only {@link FooTable.Column} is returned.
		 * @instance
		 * @param {(Array.<string>|Array.<number>|Array.<FooTable.Column>)} columns - The array of column names, index's or {@link FooTable.Column} to check.
		 * @returns {Array.<FooTable.Column>}
		 */
		ensure: function(columns){
			var self = this, result = [];
			if (!FooTable.is.array(columns)) return result;
			$.each(columns, function(i, name){
				result.push(self.get(name));
			});
			return result;
		},

		/* PRIVATE */
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
				this.ft.addCSSRule(this._generateCSSSelector(col.index), FooTable.json2css(style));
			}
		},
		/**
		 * Creates a CSS selector to target the specified column index for this instance of the plugin.
		 * @instance
		 * @private
		 * @param {number} index - The column index to create the selector for.
		 * @returns {string}
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
					rules.push(FooTable.strings.format(selectors[i], this.ft.id) + td);
					rules.push(FooTable.strings.format(selectors[i], this.ft.id) + th);
				}
				return rules.join(',');
			} else {
				// anything else we can use the nth-child selector
				var formatString = 'table.footable-{0} > thead > tr > td:nth-child({1}),table.footable-{0} > thead > tr > th:nth-child({1}),table.footable-{0} > tbody > tr > td:nth-child({1}),table.footable-{0} > tbody > tr > th:nth-child({1}),table.footable-{0} > tfoot > tr > td:nth-child({1}),table.footable-{0} > tfoot > tr > th:nth-child({1})';
				return FooTable.strings.format(formatString, this.ft.id, index + 1);
			}
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
	 * A string to display when there are no rows in the table.
	 * @type {string}
	 * @default "No results"
	 */
	FooTable.Defaults.prototype.empty = 'No results';

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
			 * This provides a shortcut to the {@link FooTable.Instance#options} object.
			 * @protected
			 * @type {FooTable.Instance#options}
			 */
			this.o = instance.options;
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

			/**
			 * The jQuery object that contains the empty row control.
			 * @type {jQuery}
			 */
			this.$empty = null;

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
			self.$empty = $('<tr/>', { 'class': 'footable-empty' }).append($('<td/>').text(options.empty));
			if (self.ft.$table.children('tbody').length == 0) self.ft.$table.append('<tbody/>');
			self.ft.$table.on('click.footable', '> tbody > tr:has(td > span.footable-toggle)', { self: self }, self._onToggleClicked);
			self._array = (self.o.ajaxEnabled == false && self.o.rows.length == 0)
				? self.fromDOM(self.ft.$table.children('tbody').get(0).rows)
				: self.fromJSON(options.rows);
			/**
			 * The rows_init event is raised after the the rows are parsed from either the DOM or the options.
			 * @event FooTable.Columns#rows_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Row>} rows - The array of {@link FooTable.Row} objects parsed from the DOM or the options.
			 */
			self.ft.raise('rows_init', [self._array]);
		},
		/**
		 * Reinitializes the rows class using the supplied options.
		 * @instance
		 * @param {object} options - The options the plugin was reinitialized with.
		 * @fires FooTable.Columns#rows_reinit
		 */
		reinit: function (options) {
			var self = this;
			self.$empty = $('<tr/>', { 'class': 'footable-empty' }).append($('<td/>').text(options.empty));
			if (self.ft.$table.children('tbody').length == 0) self.ft.$table.append('<tbody/>');
			self.ft.$table.off('click.footable', '> tbody > tr:has(td > span.footable-toggle)', self._onToggleClicked)
				.on('click.footable', '> tbody > tr:has(td > span.footable-toggle)', { self: self }, self._onToggleClicked);
			self._array = (self.o.ajaxEnabled == false && self.o.rows.length == 0)
				? self.fromDOM(self.ft.$table.children('tbody').get(0).rows)
				: self.fromJSON(options.rows);
			/**
			 * The rows_reinit event is raised after the the rows are parsed from either the DOM or the options.
			 * @event FooTable.Columns#rows_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {Array.<FooTable.Row>} rows - The array of {@link FooTable.Row} objects parsed from the DOM or the options.
			 */
			self.ft.raise('rows_reinit', [self._array]);
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
				row = new FooTable.Row(self.ft, rows[i], self.ft.columns.array);
				for (var j = 0, len2 = row.columns.length; j < len2; j++) {
					column = row.columns[j];
					cell = new FooTable.Cell(self.ft, row, rows[i].cells[column.index], column, column.parser(rows[i].cells[column.index]));
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
				row = new FooTable.Row(self.ft, document.createElement('tr'), self.ft.columns.array);
				for (var j = 0, len2 = row.columns.length; j < len2; j++) {
					column = row.columns[j];
					cell = new FooTable.Cell(self.ft, row, document.createElement('td'), column, rows[i][column.name]);
					row.cells.push(cell);
					row.$el.append(cell.$el);
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
			this.restore();
			this.array = this._array.slice(0);
		},
		/**
		 * Performs the actual drawing of the table rows.
		 * @instance
		 */
		draw: function(){
			var self = this, $tbody = self.ft.$table.children('tbody');
			self.$empty.detach();
			$tbody.find('> tr > td > span.footable-toggle').remove();
			// use detach to remove the rows to preserve jQuery data and any events.
			$tbody.children('tr').detach();

			// loop through the table and append the main rows
			for (var i = 0, len = self.array.length; i < len; i++){
				$tbody.append(self.array[i].$el);
			}
			if (self.array.length == 0){
				self.$empty.children('td').attr('colspan', self.ft.columns.colspan());
				$tbody.append(self.$empty);
			}

			if (!self.ft.columns.any(function(c){ return c.hidden && c.visible; })) return;

			// update or create details for any rows with the footable-detail-show class
			self.refresh();
			// add the row toggle to the first visible column
			var index = (self.ft.columns.first(function (c) { return !c.hidden && c.visible; }) || {}).index;
			if (typeof index !== 'number') return;
			$tbody.find('> tr > td:nth-child(' + (index + 1) + '):not(tr.footable-detail-row > td, tr.footable-loader > td)').prepend($('<span/>', {'class': 'footable-toggle glyphicon glyphicon-plus'}));
		},
		/**
		 * This method restores the detail row cells to there original row position but does not remove the expanded class.
		 * @instance
		 * @protected
		 */
		restore: function(){
			var self = this, $detail, $el;
			self.ft.$table.children('tbody').children('tr.footable-detail-row').each(function () {
				$detail = $(this);
				$detail.children('td').first()
					.find('.footable-details > tbody > tr').each(function (i, el) {
						$el = $(el);
						$el.data('footable_detail').$el.append($el.children('td').first().contents());
					});
				$detail.remove();
			});
		},
		/**
		 * Gets the detail row for the supplied row if one exists.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to retrieve the details for.
		 * @returns {(jQuery|null)}
		 */
		details: function(row){
			var $row = $(row), $next;
			if ($row.hasClass('footable-detail-show')){
				$next = $row.next();
				if ($next.is('.footable-detail-row')) return $next;
			}
			return null;
		},
		/**
		 * Displays the details for the supplied row.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to display the details for.
		 */
		expand: function(row){
			var self = this,
				data = $(row).data('__FooTableRow__'),
				hidden = $.map(data.cells, function(cell){
					return cell.column.hidden && cell.column.visible ? cell : null;
				});

			if (hidden.length > 0){
				var i, len, $tr, $th, $td,
					$cell = $('<td/>', { colspan: self.ft.columns.colspan() }),
					$table = $('<table/>', { 'class': 'footable-details table table-bordered table-condensed table-hover' }).appendTo($cell),
					$tbody = $('<tbody/>').appendTo($table);

				for (i = 0, len = hidden.length; i < len; i++){
					$tr = $('<tr/>').data('footable_detail', hidden[i]).appendTo($tbody);
					$th = $('<th/>', { text: hidden[i].column.title }).appendTo($tr);
					$td = $('<td/>').appendTo($tr).append(hidden[i].$el.contents());
				}
				data.$el.addClass('footable-detail-show').find('td > span.footable-toggle').removeClass('glyphicon-plus').addClass('glyphicon-minus');
				$('<tr/>', { 'class': 'footable-detail-row' }).append($cell).insertAfter(data.$el);
			}
		},
		/**
		 * Hides the details for the supplied row.
		 * @instance
		 * @param {HTMLTableRowElement} row - The row to hide the details on.
		 */
		collapse: function(row){
			var self = this,
				data = $(row).data('__FooTableRow__'),
				$details = self.details(data.$el.get(0)),
				$el;

			if ($details != null){
				data.$el.removeClass('footable-detail-show').find('td > span.footable-toggle').removeClass('glyphicon-minus').addClass('glyphicon-plus');
				$details.children('td').first()
					.find('.footable-details > tbody > tr').each(function(i, el){
						$el = $(el);
						$el.data('footable_detail').$el.append($el.children('td').first().contents());
					});
				$details.remove();
			}
		},
		/**
		 * Refresh the details for all active rows or for a single specified row.
		 * @instance
		 * @param {HTMLTableRowElement} [row] - A specific row to refresh the details for.
		 */
		refresh: function(row){
			var self = this;
			if (FooTable.is.undef(row)){
				self.ft.$table.children('tbody').children('tr.footable-detail-show').each(function(i, row){
					self.collapse(row);
					self.expand(row);
				});
			} else {
				self.collapse(row);
				self.expand(row);
			}
		},
		/**
		 * Handles the toggle click event for rows.
		 * @instance
		 * @param {jQuery.Event} e - The jQuery.Event object for the click event.
		 * @private
		 */
		_onToggleClicked: function (e) {
			var self = e.data.self;
			if (self.ft.columns.any(function(c){ return c.hidden && c.visible; }) && $(e.target).is('tr,td,span.footable-toggle')){ // only execute the toggle code if the event.target matches our check selector
				var $row = $(this), exists = $row.hasClass('footable-detail-show');
				if (exists) self.collapse($row.get(0));
				else self.expand($row.get(0));
			}
		}
	});

})(jQuery, FooTable = window.FooTable || {});
(function($, FooTable){

	/**
	 * A comma separated string of breakpoint names that specify when the column will be hidden. You can also specify "all" to make a column permanently display in an expandable detail row.
	 * @type {string}
	 * @default null
	 * @example
	 * hide: "phone tablet"
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

			/* PROTECTED */
			/**
			 * This provides a shortcut to the {@link FooTable.Instance#options} object.
			 * @protected
			 * @type {FooTable.Instance#options}
			 */
			this.o = instance.options;

			/* PUBLIC */
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

			/* PRIVATE */
			/**
			 * Used when performing a {@link FooTable.Breakpoints#check} this stores the previous breakpoint value to compare to the current.
			 * @type {string}
			 * @private
			 */
			this._previous = null;

			// call the base class constructor
			this._super(instance);
		},

		/* PROTECTED */
		/**
		 * Provides access to the {@link FooTable.Column} constructor allowing components to modify the object on creation.
		 * @instance
		 * @protected
		 * @param {FooTable.Column} column - The column object being constructed.
		 * @param {object} definition - The definition object used to populate the column.
		 */
		ctor_column: function(column, definition){
			column.hide = FooTable.is.type(definition.hide, 'string') ? definition.hide : null;
		},
		/**
		 * Initializes the class parsing the options into a sorted array of {@link FooTable.Breakpoint} objects.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Breakpoints#breakpoints_init
		 */
		init: function(table, options){
			this._generate(options.breakpoints);
			this.current = this.calculate();
			/**
			 * The breakpoints_init event raised after the breakpoints have been parsed.
			 * @event FooTable.Breakpoints#breakpoints_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('breakpoints_init');
		},
		/**
		 * Reinitializes the class parsing the options into a sorted array of {@link FooTable.Breakpoint} objects.
		 * @instance
		 * @protected
		 * @param {object} options - The options the plugin was reinitialized with.
		 * @fires FooTable.Breakpoints#breakpoints_reinit
		 */
		reinit: function(options){
			this._generate(options.breakpoints);
			this.current = this.calculate();
			/**
			 * The breakpoints_init event raised after the breakpoints have been parsed.
			 * @event FooTable.Breakpoints#breakpoints_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('breakpoints_reinit');
		},

		/* PUBLIC */
		/**
		 * Calculates the current breakpoint from the {@link FooTable.Breakpoints#array} and returns its name.
		 * @instance
		 * @returns {string}
		 */
		calculate: function(){
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
		 * Performs a check between the current breakpoint and the previous breakpoint and performs a redraw if they differ.
		 * @instance
		 * @fires FooTable.Breakpoints#breakpoints_changed
		 */
		check: function(){
			var self = this;
			self.current = self.calculate();
			if (self.current == self._previous) return;
			self.ft.draw();
			self._previous = self.current;
			/**
			 * The breakpoints_changed event is raised when a call to {@link FooTable.Breakpoints#check} determines that the breakpoint has changed.
			 * @event FooTable.Breakpoints#breakpoints_changed
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} ft - The instance of FooTable raising the event.
			 * @param {string} current - The current breakpoint name.
			 * @param {string} previous - The previous breakpoint name.
			 */
			self.ft.raise('breakpoints_changed', [ self.current, self._previous ]);
		},
		/**
		 * Gets the width used to determine breakpoints whether it be from the viewport, parent or a custom function.
		 * @instance
		 * @returns {number}
		 */
		getWidth: function(){
			if (FooTable.is.fn(this.o.getWidth)) return this.o.getWidth(this.ft);
			if (this.o.useParentWidth == true) return this.ft.$table.parent().width();
			return this.getViewportWidth();
		},
		/**
		 * Gets the current viewport width.
		 * @instance
		 * @returns {number}
		 */
		getViewportWidth: function(){
			var ratio = FooTable.is.defined(window.devicePixelRatio) && FooTable.isMobile ? window.devicePixelRatio : 1;
			return (window.innerWidth || (document.body ? document.body.offsetWidth : 0)) / ratio;
		},

		/* PRIVATE */
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
				self.array.push(new FooTable.Breakpoint(name, breakpoints[name]));
				self.names += (name + ' ');
			}

			// Sort the breakpoints so the smallest is checked first
			self.array.sort(function (a, b) {
				return a.width - b.width;
			});
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
	 * @prop {(Array.<FooTable.Column>|Array.<string>|Array.<number>)} columns - The columns to apply the query to.
	 * @prop {number} delay=500 - The delay in milliseconds before the query is auto applied after a change.
	 * @prop {number} min=3 - The minimum number of characters allowed before a filter is applied.
	 * @prop {object} strings - An object containing the strings used by the filtering component.
	 * @prop {string} strings.placeholder="Search" - The string used as the placeholder for the filter input.
	 */
	FooTable.Defaults.prototype.filtering = {
		enabled: false,
		query: null,
		columns: [],
		delay: 500,
		min: 3,
		strings: {
			placeholder: 'Search'
		}
	};

	/**
	 * The query to filter the rows by. Rows that match this query are included in the result. Added by the {@link FooTable.Filtering} component.
	 * @type {string}
	 * @default NULL
	 */
	FooTable.RequestData.prototype.filterQuery = null;

	/**
	 * The columns to apply the {@link FooTable.RequestData#filterQuery} to. Added by the {@link FooTable.Filtering} component.
	 * @type {Array.<string>}
	 * @default []
	 */
	FooTable.RequestData.prototype.filterColumns = [];

	FooTable.Filtering = FooTable.Component.extend(/** @lends FooTable.Filtering */{
		/**
		 * The filtering component adds a search input and column selector dropdown to the table allowing users to filter the using space delimited queries.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @returns {FooTable.Filtering}
		 */
		ctor: function (instance) {

			/* PROTECTED */
			/**
			 * This provides a shortcut to the {@link FooTable.Instance#options}.[filtering]{@link FooTable.Defaults#filtering} object.
			 * @protected
			 * @type {object}
			 */
			this.o = instance.options.filtering;

			/* PUBLIC */
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
			 * The jQuery object of the column selector dropdown.
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

			/* PRIVATE */
			/**
			 * The timeout ID for the filter changed event.
			 * @private
			 * @type {?number}
			 */
			this._filterTimeout = null;
			/**
			 * Sets a flag indicating whether or not the filter has changed. When set to true the {@link FooTable.Filtering#filtering_changing} and {@link FooTable.Filtering#filtering_changed} events
			 * will be raised during the drawing operation.
			 * @private
			 * @type {boolean}
			 */
			this._changed = false;

			// call the constructor of the base class
			this._super(instance);
		},

		/* PROTECTED */
		/**
		 * Allows the filtering component to extend the {@link FooTable.Column} constructor.
		 * @instance
		 * @protected
		 * @param {FooTable.Column} column - The column being constructed.
		 * @param {object} definition - The definition to populate the column with.
		 */
		ctor_column: function(column, definition){
			column.filterable = FooTable.is.boolean(definition.filterable) ? definition.filterable : true;
		},
		/**
		 * Initializes the filtering component for the plugin using the supplied table and options.
		 * @instance
		 * @protected
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
			this.ft.raise('filtering_init');
		},
		/**
		 * Reinitializes the filtering component for the plugin using the supplied options.
		 * @instance
		 * @protected
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
			this.ft.raise('filtering_reinit');
		},
		/**
		 * Destroys the filtering component removing any UI generated from the table.
		 * @instance
		 * @protected
		 */
		destroy: function () {
			if (this.o.enabled == false) return;
			var $thead = this.ft.$table.children('tfoot');
			$thead.children('.footable-filtering').remove();
			if ($thead.children().length == 0) $thead.remove();
		},
		/**
		 * Appends or updates any filtering specific properties on the {@link FooTable.RequestData} object.
		 * @instance
		 * @protected
		 * @param {FooTable.RequestData} data - The {@link FooTable.RequestData} object about to passed to the {@link FooTable.Defaults#ajax} method.
		 */
		preajax: function(data){
			if (this.o.enabled == false) return;
			if (this._changed == true) this.raiseChanging();
			data.filterQuery = this.o.query;
			data.filterColumns = $.map(this.o.columns, function(col){
				return col.name;
			});
		},
		/**
		 * Performs the filtering of rows before they are appended to the page.
		 * @instance
		 * @protected
		 */
		predraw: function(){
			if (this.o.enabled == false
				|| this.ft.options.ajaxEnabled == true)
				return;

			var self = this;
			if (self._changed == true) self.raiseChanging();

			if (FooTable.strings.isNullOrEmpty(self.o.query)) return;

			var i, text, len = self.ft.rows.array.length, remove = [];
			for (i = 0; i < len; i++){
				text = '';
				for (var j = 0, column; j < self.o.columns.length; j++){
					column = self.o.columns[j];
					text += ' ' + self.ft.rows.array[i].cells[column.index].display;
				}
				if (self.isFiltered(self.o.query, text)){
					remove.push(i);
				}
			}
			remove.sort(function(a, b){ return a - b; });
			len = remove.length - 1;
			for (i = len; i >= 0; i--){
				self.ft.rows.array.splice(remove[i],1);
			}
		},
		/**
		 * As the rows are drawn by the {@link FooTable.Rows#draw} method this simply updates the colspan for the UI.
		 * @instance
		 * @protected
		 */
		draw: function(){
			if (this.o.enabled == false) return;
			var self = this;
			self.$container.children('td').first().attr('colspan', self.ft.columns.colspan());
			if (FooTable.strings.isNullOrEmpty(self.o.query)){
				self.$search_button.children('.glyphicon').removeClass('glyphicon-remove').addClass('glyphicon-search');
			} else {
				self.$search_button.children('.glyphicon').removeClass('glyphicon-search').addClass('glyphicon-remove');
			}
			self.$search_input.val(self.o.query);
		},
		/**
		 * Performs any post draw operations required for filtering.
		 * @instance
		 * @protected
		 */
		postdraw: function(){
			if (this.o.enabled == false) return;
			if (this._changed == true) this.raiseChanged();
			this._changed = false;
		},
		/**
		 * Checks if the supplied text is filtered by the query.
		 * @instance
		 * @protected
		 * @param {string} query - The query to filter by.
		 * @param {string} text - The text to check.
		 * @returns {boolean}
		 */
		isFiltered: function(query, text){
			var queries = query.split(' '), count = queries.length;
			for (var i = 0, len = queries.length; i < len; i++){
				if (text.toUpperCase().indexOf(queries[i].toUpperCase()) >= 0) count--;
			}
			return count > 0;
		},
		/**
		 * Raises the filtering_changing event using the current filter and columns to generate a {@link FooTable.Filter} object for the event and merges changes made by any listeners back into the current state.
		 * @instance
		 * @protected
		 * @fires FooTable.Filtering#filtering_changing
		 */
		raiseChanging: function(){
			var filter = new FooTable.Filter(this.o.query, this.o.columns);
			/**
			 * The filtering_changing event is raised before a filter is applied and allows listeners to modify the filter or cancel it completely by calling preventDefault on the jQuery.Event object.
			 * @event FooTable.Filtering#filtering_changing
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Filter} filter - The filter that is about to be applied.
			 */
			if (this.ft.raise('filtering_changing', [filter]).isDefaultPrevented()) return;
			this.o.query = filter.query;
			this.o.columns = FooTable.is.array(filter.columns) ? this.ft.columns.ensure(filter.columns) : this.columns();
		},
		/**
		 * Raises the filtering_changed event using the filter and columns to generate a {@link FooTable.Filter} object for the event.
		 * @instance
		 * @protected
		 * @fires FooTable.Filtering#filtering_changed
		 */
		raiseChanged: function(){
			/**
			 * The filtering_changed event is raised after a filter has been applied.
			 * @event FooTable.Filtering#filtering_changed
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Filter} filter - The filter that has been applied.
			 */
			this.ft.raise('filtering_changed', [new FooTable.Filter(this.o.query, this.o.columns)]);
		},

		/* PUBLIC */
		/**
		 * Sets the filtering options and calls the {@link FooTable.Instance#update} method to perform the actual filtering.
		 * @instance
		 * @param {string} query - The query to filter the rows by.
		 * @param {(Array.<string>|Array.<number>|Array.<FooTable.Column>)} [columns] - The columns to apply the filter to in each row.
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Filtering#filtering_changing
		 * @fires FooTable.Filtering#filtering_changed
		 */
		filter: function(query, columns){
			this.o.query = query;
			this.o.columns = FooTable.is.array(columns) ? this.ft.columns.ensure(columns) : this.columns();
			this._changed = true;
			return this.ft.update();
		},
		/**
		 * Clears the current filter.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Filtering#filtering_changing
		 * @fires FooTable.Filtering#filtering_changed
		 */
		clear: function(){
			return this.filter(null, []);
		},
		/**
		 * Gets an array of all selected {@link FooTable.Column}s to apply the filter to.
		 * @instance
		 * @param {boolean} [all=false] - Overrides returning only selected columns and instead returns all available filterable columns.
		 * @returns {Array.<FooTable.Column>}
		 */
		columns: function(all){
			var selector = 'input:checked';
			if (FooTable.is.defined(all) && all === true) selector = 'input[type=checkbox]';
			return this.$dropdown.find(selector).map(function(){
				return $(this).data('footable_column');
			}).get();
		},
		/**
		 * Gets the query entered into filter input.
		 * @instance
		 * @returns {string}
		 */
		query: function(){
			return $.trim(this.$search_input.val() || '');
		},

		/* PRIVATE */
		/**
		 * Generates the filtering UI from the supplied options.
		 * @instance
		 * @private
		 * @param {object} options - The options to use to generate the filtering UI.
		 */
		_generate: function (options) {
			var self = this;
			// parse the options into actual FooTable.Columns if they are names or indexes.
			options.filtering.columns = self.ft.columns.ensure(options.filtering.columns);
			// if no options for filterable columns exists generate a default array using the column.filterable property.
			if (options.filtering.columns.length == 0) {
				options.filtering.columns = self.ft.columns.map(function (col) {
					return col.filterable ? col : null;
				});
			}
			// add a header if none exists
			if (self.ft.$table.children('thead').length == 0) self.ft.$table.prepend('<thead/>');
			// generate the cell that actually contains all the UI.
			var $cell = $('<th/>').attr('colspan', self.ft.columns.colspan());
			// add it to a row and then populate it with the search input and column selector dropdown.
			self.$container = $('<tr/>', {'class': 'footable-filtering'}).append($cell).prependTo(self.ft.$table.children('thead'));
			$('<div/>', {'class': 'input-group'})
				.append(
				(self.$search_input = $('<input/>', {type: 'text', 'class': 'form-control', placeholder: options.filtering.strings.placeholder}).on('keyup', { self: self }, self._onFilterChanged)),
				(self.$dropdown_container = $('<div/>', {'class': 'input-group-btn'})
					.append(
					(self.$search_button = $('<button/>', {type: 'button', 'class': 'btn btn-primary'}).on('click', { self: self }, self._onFilterClicked)
						.append($('<span/>', {'class': 'glyphicon glyphicon-search'}))),
					$('<button/>', {type: 'button', 'class': 'btn btn-default dropdown-toggle'}).on('click', { self: self }, self._onDropdownClicked)
						.append($('<span/>', {'class': 'caret'})),
					(self.$dropdown = $('<ul/>', {'class': 'dropdown-menu dropdown-menu-right'})
						.append(
						self.ft.columns.map(function (col) {
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
		 * Handles the change event for the {@link FooTable.Filtering#$search_input}.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onFilterChanged: function (e) {
			e.preventDefault();
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);

			var query = self.query(),
				alpha = String.fromCharCode(e.keyCode).match(/\w/),
				ctrl = (e.keyCode == 8 || e.keyCode == 46); // backspace & delete

			// if alphanumeric characters or specific control characters
			if(alpha || ctrl) {
				self._filterTimeout = setTimeout(function(){
					self._filterTimeout = null;
					if (query.length >= self.o.min) self.filter(query, self.columns());
					else if (FooTable.strings.isNullOrEmpty(query)) self.clear();
				}, self.o.delay);
			}
		},
		/**
		 * Handles the click event for the {@link FooTable.Filtering#$search_button}.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onFilterClicked: function (e) {
			e.preventDefault();
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			if (self.$search_button.children('.glyphicon').hasClass('glyphicon-search')) self.filter(self.query(), self.columns());
			else self.clear();
		},
		/**
		 * Handles the click event for the column checkboxes in the {@link FooTable.Filtering#$dropdown}.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onColumnClicked: function (e) {
			var self = e.data.self;
			if (self._filterTimeout != null) clearTimeout(self._filterTimeout);
			self._filterTimeout = setTimeout(function(){
				self._filterTimeout = null;
				var $icon = self.$search_button.children('.glyphicon');
				if ($icon.hasClass('glyphicon-remove')){
					$icon.removeClass('glyphicon-remove').addClass('glyphicon-search');
					self.filter(self.query(), self.columns());
				}
			}, self.o.delay);
		},
		/**
		 * Handles the click event for the {@link FooTable.Filtering#$dropdown} toggle.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
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
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
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

	// Below are methods exposed on the core FooTable.Instance object for easy access

	/**
	 * Filter the table using the supplied query and columns. Added by the {@link FooTable.Filtering} component.
	 * @instance
	 * @param {string} query - The query to filter the rows by.
	 * @param {(Array.<string>|Array.<number>|Array.<FooTable.Column>)} [columns] - The columns to apply the filter to in each row.
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Filtering#filtering_changing
	 * @fires FooTable.Filtering#filtering_changed
	 * @see FooTable.Filtering#filter
	 */
	FooTable.Instance.prototype.applyFilter = function(query, columns){
		return this.use(FooTable.Filtering).filter(query, columns);
	};

	/**
	 * Clear the current filter from the table. Added by the {@link FooTable.Filtering} component.
	 * @instance
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Filtering#filtering_changing
	 * @fires FooTable.Filtering#filtering_changed
	 * @see FooTable.Filtering#clear
	 */
	FooTable.Instance.prototype.clearFilter = function(){
		return this.use(FooTable.Filtering).clear();
	};

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
	 * The page number to display. Added by the {@link FooTable.Paging} component.
	 * @type {number}
	 * @default 1
	 */
	FooTable.RequestData.prototype.currentPage = 1;

	/**
	 * The number of rows to display per page. Added by the {@link FooTable.Paging} component.
	 * @type {number}
	 * @default 10
	 */
	FooTable.RequestData.prototype.pageSize = 10;

	/**
	 * The total number of rows available. Added by the {@link FooTable.Paging} component.
	 * @type {number}
	 * @default NULL
	 */
	FooTable.ResponseData.prototype.totalRows = null;

	FooTable.Paging = FooTable.Component.extend(/** @lends FooTable.Paging */{
		/**
		 * The paging component adds a pagination control to the table allowing users to navigate table rows via pages.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @returns {FooTable.Filtering}
		 */
		ctor: function(instance){

			/* PROTECTED */
			/**
			 * This provides a shortcut to the {@link FooTable.Instance#options}.[paging]{@link FooTable.Defaults#paging} object.
			 * @protected
			 * @type {object}
			 */
			this.o = instance.options.paging;

			/* PUBLIC */
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

			/* PRIVATE */
			/**
			 * A boolean indicating the direction of paging, TRUE = forward, FALSE = back.
			 * @private
			 * @type {boolean}
			 */
			this._forward = false;

			// call the base constructor
			this._super(instance);
		},

		/* PROTECTED */
		/**
		 * Initializes the paging component for the plugin using the supplied table and options.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Paging#paging_init
		 */
		init: function(table, options){
			if (this.o.enabled == false) return;
			this._generate(options);
			/**
			 * The paging_init event is raised after its UI is generated.
			 * @event FooTable.Paging#paging_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('paging_init');
		},
		/**
		 * Reinitializes the paging component for the plugin using the supplied table and options.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Paging#paging_reinit
		 */
		reinit: function(table, options){
			this.destroy();
			if (this.o.enabled == false) return;
			this._generate(options);
			/**
			 * The paging_reinit event is raised after its UI is regenerated.
			 * @event FooTable.Paging#paging_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('paging_reinit');
		},
		/**
		 * Destroys the paging component removing any UI generated from the table.
		 * @instance
		 * @protected
		 */
		destroy: function () {
			if (this.o.enabled == false) return;
			var $tfoot = this.ft.$table.children('tfoot');
			$tfoot.children('.footable-paging').remove();
			if ($tfoot.children().length == 0) $tfoot.remove();
		},
		/**
		 * Appends or updates any filtering specific properties on the {@link FooTable.RequestData} object.
		 * @instance
		 * @protected
		 * @param {FooTable.RequestData} data - The {@link FooTable.RequestData} object about to passed to the {@link FooTable.Defaults#ajax} method.
		 */
		preajax: function(data){
			if (this.o.enabled == false) return;
			if (this._changed == true) this.raiseChanging();
			data.currentPage = this.o.current;
			data.pageSize = this.o.size;
		},
		/**
		 * Parses the ajax response object and sets the current page, size and total if they exists.
		 * @instance
		 * @protected
		 * @param {object} response - The response object that contains the paging options.
		 */
		postajax: function(response){
			if (this.o.enabled == false) return;
			this.o.total = FooTable.is.type(response.totalRows, 'number') ? response.totalRows : this.o.total;
			this.o.current = this.current();
		},
		/**
		 * Performs the actual paging against the {@link FooTable.Rows#array} removing all rows that are not on the current visible page.
		 * @instance
		 * @protected
		 */
		predraw: function(){
			if (this.o.enabled == false || this.ft.options.ajaxEnabled == true) return;

			var self = this;
			if (self._changed == true) self.raiseChanging();

			self.o.total = self.ft.rows.array.length == 0 ? 1 : self.ft.rows.array.length;
			self.o.current = self.current();
			var start = (self.o.current - 1) * self.o.size;
			if (self.o.total > self.o.size) self.ft.rows.array = self.ft.rows.array.splice(start, self.o.size);
		},
		/**
		 * Updates the paging UI setting the state of the pagination control.
		 * @instance
		 * @protected
		 */
		draw: function(){
			if (this.o.enabled == false) return;
			this.$container.children('td').first().attr('colspan', this.ft.columns.colspan());
			this._generateLinks();
		},
		/**
		 * Performs any post draw operations required for paging.
		 * @instance
		 * @protected
		 */
		postdraw: function(){
			if (this.o.enabled == false) return;
			if (this._changed == true) this.raiseChanged();
			this._changed = false;
		},
		/**
		 * Raises the paging_changing event using the page number and direction to generate a {@link FooTable.Pager} object for the event and merges changes made by any listeners back into the current state.
		 * @instance
		 * @protected
		 * @fires FooTable.Paging#paging_changing
		 */
		raiseChanging: function(){
			var pager = new FooTable.Pager(this.current(), this._forward);
			/**
			 * The paging_changing event is raised before a sort is applied and allows listeners to modify the sorter or cancel it completely by calling preventDefault on the jQuery.Event object.
			 * @event FooTable.Paging#paging_changing
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Pager} pager - The pager that is about to be applied.
			 */
			if (this._changed == true && this.ft.raise('paging_changing', [pager]).isDefaultPrevented()) return $.when();
			this.o.current = pager.page;
			this._forward = pager.forward;
		},
		/**
		 * Raises the paging_changed event using the page number and direction to generate a {@link FooTable.Pager} object for the event.
		 * @instance
		 * @protected
		 * @fires FooTable.Paging#paging_changed
		 */
		raiseChanged: function(){
			/**
			 * The paging_changed event is raised after a pager has been applied.
			 * @event FooTable.Paging#paging_changed
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Pager} pager - The pager that has been applied.
			 */
			this.ft.raise('paging_changed', [new FooTable.Pager(this.current(), this._forward)]);
		},

		/* PUBLIC */
		/**
		 * Returns the maximum number of pages taking into account the total number of rows and the page size.
		 * @instance
		 * @returns {number}
		 */
		total: function(){
			return Math.ceil(this.o.total / this.o.size);
		},
		/**
		 * Returns the current page number taking into account the total number of rows and page size to ensure a valid number.
		 * @instance
		 * @returns {number}
		 */
		current: function(){
			var current = this.o.current * this.o.size > this.o.total
				? this.total()
				: this.o.current;
			return current < 1 ? 1 : current;
		},
		/**
		 * Pages to the first page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		first: function(){
			return this._set(1, false);
		},
		/**
		 * Pages to the previous page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		prev: function(){
			var page = this.o.current - 1 > 0 ? this.o.current - 1 : 1;
			return this._set(page, false);
		},
		/**
		 * Pages to the next page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		next: function(){
			var total = this.total(),
				page = this.o.current + 1 < total ? this.o.current + 1 : total;
			return this._set(page, true);
		},
		/**
		 * Pages to the last page.
		 * @instance
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		last: function(){
			return this._set(this.total(), true);
		},
		/**
		 * Pages to the specified page.
		 * @instance
		 * @param {number} page - The page number to go to.
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		goto: function(page){
			var total = this.total();
			page = page > total ? total : page;
			if (this.o.current == page) return $.when();
			var forward = page > this.o.current;
			return this._set(page, forward);
		},
		/**
		 * Shows the previous X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value.
		 * @instance
		 */
		prevX: function(){
			var page = this.$pagination.children('li.footable-page.visible:first').data('page') - 1;
			this._setVisible(page, false, true);
			this._setNavigation(false);
		},
		/**
		 * Shows the next X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value.
		 * @instance
		 */
		nextX: function(){
			var page = this.$pagination.children('li.footable-page.visible:last').data('page') + 1;
			this._setVisible(page, false, false);
			this._setNavigation(false);
		},

		/* PRIVATE */
		/**
		 * Used by the paging functions to set the actual page, direction and then trigger the {@link FooTable.Instance#update} method.
		 * @instance
		 * @private
		 * @param {number} page - The page to set.
		 * @param {boolean} forward - Whether or not to set the direction as forward.
		 * @returns {jQuery.Promise}
		 * @fires FooTable.Paging#paging_changing
		 * @fires FooTable.Paging#paging_changed
		 */
		_set: function(page, forward){
			if (this.o.current == page) return;
			this.o.current = page;
			this._forward = forward;
			this._changed = true;
			return this.ft.update();
		},
		/**
		 * Generates the paging UI from the supplied options.
		 * @instance
		 * @private
		 * @param {object} options - The options to use to generate the paging UI.
		 */
		_generate: function(options){
			options.paging.total = options.paging.total == -1
				? this.ft.rows.array.length
				: options.paging.total;

			if (this.ft.$table.children('tfoot').length == 0) this.ft.$table.append('<tfoot/>');
			var $cell = $('<td/>').attr('colspan', this.ft.columns.colspan());
			this.$pagination = $('<ul/>', { 'class': 'pagination' }).on('click.footable', 'a.footable-page-link', { self: this }, this._onPageClicked);
			this.$count = $('<span/>', { 'class': 'label label-default' });
			this._generateLinks();
			$cell.append(this.$pagination, $('<div/>', {'class': 'divider'}), this.$count);
			this.$container = $('<tr/>', { 'class': 'footable-paging' }).append($cell).appendTo(this.ft.$table.children('tfoot'));
		},
		/**
		 * Generates all page links for the pagination control.
		 * @instance
		 * @private
		 */
		_generateLinks: function(){
			var total = this.total(),
				multiple = total > 1,
				changed = this.$pagination.children('li.footable-page').length != total;
			if (total == 0 || total == 1){
				this.$pagination.empty();
				this.$count.text(total + ' of ' + total);
				return;
			}
			if (!changed && this.$pagination.children('li.footable-page[data-page="'+this.o.current+'"]').hasClass('visible')){
				this._setNavigation(true);
				return;
			}
			this.$pagination.empty();
			if (multiple) this.$pagination.append(this._createLink('first', this.o.strings.first, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('prev', this.o.strings.prev, 'footable-page-nav'));
			if (multiple && this.o.limit.size > 0 && this.o.limit.size < total) this.$pagination.append(this._createLink('prev-limit', this.o.limit.prev, 'footable-page-nav'));

			for (var i = 0, $li; i < total; i++){
				$li = this._createLink(i + 1, i + 1, 'footable-page');
				this.$pagination.append($li);
			}

			if (multiple && this.o.limit.size > 0 && this.o.limit.size < total) this.$pagination.append(this._createLink('next-limit', this.o.limit.next, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('next', this.o.strings.next, 'footable-page-nav'));
			if (multiple) this.$pagination.append(this._createLink('last', this.o.strings.last, 'footable-page-nav'));

			this._setVisible((this.o.current = this.o.current > total ? (total == 0 ? 1 : total) : this.o.current), this._forward);
			this._setNavigation(true);
		},
		/**
		 * Generates an individual page link for the pagination control using the supplied parameters.
		 * @instance
		 * @private
		 * @param {string} attr - The value for the data-page attribute for the link.
		 * @param {string} html - The inner HTML for the link created.
		 * @param {string} klass - A CSS class or class names (space separated) to add to the link.
		 */
		_createLink: function(attr, html, klass){
			return $('<li/>', { 'class': klass }).attr('data-page', attr).append($('<a/>', { 'class': 'footable-page-link', href: '#' }).data('page', attr).html(html));
		},
		/**
		 * Sets the state for the navigation links of the pagination control and optionally sets the active class state on the individual page links.
		 * @instance
		 * @private
		 * @param {boolean} active - Whether or not to set the active class state on the individual page links.
		 */
		_setNavigation: function(active){
			var total = this.total();

			this.$count.text(this.o.current + ' of ' + total);

			if (this.o.current == 1) this.$pagination.children('li[data-page="first"],li[data-page="prev"]').addClass('disabled');
			else this.$pagination.children('li[data-page="first"],li[data-page="prev"]').removeClass('disabled');

			if (this.o.current == total) this.$pagination.children('li[data-page="next"],li[data-page="last"]').addClass('disabled');
			else this.$pagination.children('li[data-page="next"],li[data-page="last"]').removeClass('disabled');

			if ((this.$pagination.children('li.footable-page.visible:first').data('page') || 1) == 1) this.$pagination.children('li[data-page="prev-limit"]').addClass('disabled');
			else this.$pagination.children('li[data-page="prev-limit"]').removeClass('disabled');

			if ((this.$pagination.children('li.footable-page.visible:last').data('page') || this.o.limit.size) == total) this.$pagination.children('li[data-page="next-limit"]').addClass('disabled');
			else this.$pagination.children('li[data-page="next-limit"]').removeClass('disabled');

			if (active) this.$pagination.children('li.footable-page').removeClass('active').filter('li[data-page="' + this.o.current + '"]').addClass('active');
		},
		/**
		 * Sets the visible page using the supplied parameters.
		 * @instance
		 * @private
		 * @param {number} page - The page to make visible.
		 * @param {boolean} forward - The direction the pagination control should scroll to make the page visible. If set to true the supplied page will be the right most visible pagination link.
		 * @param {boolean} [invert=false] - If invert is set to tru the supplied page will be the left most visible pagination link.
		 */
		_setVisible: function(page, forward, invert){
			if (this.$pagination.children('li.footable-page[data-page="'+page+'"]').hasClass('visible')) return;

			var total = this.total();
			if (this.o.limit.size > 0 && total > this.o.limit.size){
				page -= 1;
				var start = 0, end = 0;
				if (forward == true || invert == true){
					end = page > total ? total : page;
					start = end - this.o.limit.size;
				} else {
					start = page < 0 ? 0 : page;
					end = start + this.o.limit.size;
				}
				if (start < 0){
					start = 0;
					end = this.o.limit.size > total ? total : this.o.limit.size;
				}
				if (end > total){
					end = total;
					start = total - this.o.limit.size < 0 ? 0 : total - this.o.limit.size;
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
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
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

	// Below are methods exposed on the core FooTable.Instance object for easy access

	/**
	 * Navigates to the specified page number. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @param {number} num - The page number to go to.
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Paging#paging_changing
	 * @fires FooTable.Paging#paging_changed
	 * @see FooTable.Paging#goto
	 */
	FooTable.Instance.prototype.gotoPage = function(num){
		return this.use(FooTable.Paging).goto(num);
	};

	/**
	 * Navigates to the next page. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Paging#paging_changing
	 * @fires FooTable.Paging#paging_changed
	 * @see FooTable.Paging#next
	 */
	FooTable.Instance.prototype.nextPage = function(){
		return this.use(FooTable.Paging).next();
	};

	/**
	 * Navigates to the previous page. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Paging#paging_changing
	 * @fires FooTable.Paging#paging_changed
	 * @see FooTable.Paging#prev
	 */
	FooTable.Instance.prototype.prevPage = function(){
		return this.use(FooTable.Paging).prev();
	};

	/**
	 * Navigates to the first page. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Paging#paging_changing
	 * @fires FooTable.Paging#paging_changed
	 * @see FooTable.Paging#first
	 */
	FooTable.Instance.prototype.firstPage = function(){
		return this.use(FooTable.Paging).first();
	};

	/**
	 * Navigates to the last page. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Paging#paging_changing
	 * @fires FooTable.Paging#paging_changed
	 * @see FooTable.Paging#last
	 */
	FooTable.Instance.prototype.lastPage = function(){
		return this.use(FooTable.Paging).last();
	};

	/**
	 * Shows the next X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @see FooTable.Paging#nextX
	 */
	FooTable.Instance.prototype.nextPages = function(){
		return this.use(FooTable.Paging).nextX();
	};

	/**
	 * Shows the previous X number of pages in the pagination control where X is the value set by the {@link FooTable.Defaults#paging} - limit.size option value. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @see FooTable.Paging#prevX
	 */
	FooTable.Instance.prototype.prevPages = function(){
		return this.use(FooTable.Paging).prevX();
	};

	/**
	 * Gets the current page number. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {number}
	 * @see FooTable.Paging#current
	 */
	FooTable.Instance.prototype.currentPage = function(){
		return this.use(FooTable.Paging).current();
	};

	/**
	 * Gets the total number of pages. Added by the {@link FooTable.Paging} component.
	 * @instance
	 * @returns {number}
	 * @see FooTable.Paging#total
	 */
	FooTable.Instance.prototype.totalPages = function(){
		return this.use(FooTable.Paging).total();
	};

})(jQuery, FooTable = window.FooTable || {});
(function ($, FooTable) {

	/**
	 * The sort function for this column. This is set by the plugin. Added by the {@link FooTable.Sorting} component.
	 * @type {function}
	 * @default jQuery.noop
	 */
	FooTable.Column.prototype.sorter = null;
	/**
	 * The direction to sort if the {@link FooTable.Column#sorted} property is set to true. Can be "ASC", "DESC" or NULL. Added by the {@link FooTable.Sorting} component.
	 * @type {string}
	 * @default null
	 */
	FooTable.Column.prototype.direction = null;
	/**
	 * Whether or not the column can be sorted. Added by the {@link FooTable.Sorting} component.
	 * @type {boolean}
	 * @default true
	 */
	FooTable.Column.prototype.sortable = true;
	/**
	 * Whether or not the column is sorted. Added by the {@link FooTable.Sorting} component.
	 * @type {boolean}
	 * @default false
	 */
	FooTable.Column.prototype.sorted = false;

	/**
	 * An object containing the sorting options for the plugin. Added by the {@link FooTable.Sorting} component.
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
	 * Added by the {@link FooTable.Sorting} component.
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
	 * The name of the column to sort on. Added by the {@link FooTable.Sorting} component.
	 * @type {string}
	 * @default NULL
	 */
	FooTable.RequestData.prototype.sortColumn = null;

	/**
	 * The direction to sort the column by. Can be "ASC", "DESC" or NULL. Added by the {@link FooTable.Sorting} component.
	 * @type {string}
	 * @default NULL
	 */
	FooTable.RequestData.prototype.sortDirection = null;

	FooTable.Sorting = FooTable.Component.extend(/** @lends FooTable.Sorting */{
		/**
		 * The sorting component adds a small sort button to specified column headers allowing users to sort those columns in the table.
		 * @constructs
		 * @extends FooTable.Component
		 * @param {FooTable.Instance} instance - The parent {@link FooTable.Instance} object for the component.
		 * @returns {FooTable.Sorting}
		 */
		ctor: function (instance) {

			/* PROTECTED */
			/**
			 * This provides a shortcut to the {@link FooTable.Instance#options}.[sorting]{@link FooTable.Defaults#sorting} object.
			 * @protected
			 * @type {object}
			 */
			this.o = instance.options.sorting;

			/* PRIVATE */
			/**
			 * Sets a flag indicating whether or not the sorting has changed. When set to true the {@link FooTable.Sorting#sorting_changing} and {@link FooTable.Sorting#sorting_changed} events
			 * will be raised during the drawing operation.
			 * @private
			 * @type {boolean}
			 */
			this._changed = false;

			// call the constructor of the base class
			this._super(instance);
		},

		/* PROTECTED */
		/**
		 * Allows the filtering component to extend the {@link FooTable.Column} constructor.
		 * @instance
		 * @protected
		 * @param {FooTable.Column} column - The column being constructed.
		 * @param {object} definition - The definition to populate the column with.
		 */
		ctor_column: function(column, definition){
			column.sorter = FooTable.is.fn(definition.sorter) ? definition.sorter : $.noop;
			column.direction = FooTable.is.type(definition.direction, 'string') ? definition.direction : null;
			column.sortable = FooTable.is.boolean(definition.sortable) ? definition.sortable : true;
			column.sorted = FooTable.is.boolean(definition.sorted) ? definition.sorted : false;
			if (column.sortable) column.$el.addClass('footable-sortable');
		},
		/**
		 * Initializes the sorting component for the plugin using the supplied table and options.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Sorting#sorting_init
		 */
		init: function (table, options) {
			if (this.o.enabled == false) return;
			this._generate(options);
			/**
			 * The sorting_init event is raised after its UI is generated.
			 * @event FooTable.Sorting#sorting_init
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('sorting_init');
		},
		/**
		 * Reinitializes the sorting component for the plugin using the supplied table and options.
		 * @instance
		 * @protected
		 * @param {HTMLTableElement} table - The table element the plugin was initialized on.
		 * @param {object} options - The options the plugin was initialized with.
		 * @fires FooTable.Sorting#sorting_reinit
		 */
		reinit: function (table, options) {
			this.destroy();
			if (this.o.enabled == false) return;
			this._generate(options);
			/**
			 * The sorting_reinit event is raised after its UI is regenerated.
			 * @event FooTable.Sorting#sorting_reinit
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 */
			this.ft.raise('sorting_reinit');
		},
		/**
		 * Destroys the sorting component removing any UI generated from the table.
		 * @instance
		 * @protected
		 */
		destroy: function () {
			if (this.o.enabled == false) return;
			this.ft.$table.off('click.footable', '.footable-sortable', this._onSortClicked);
			this.ft.$table.children('thead').children('tr.footable-header')
				.children('.footable-sortable').removeClass('footable-sortable')
				.find('span.direction').remove();
		},
		/**
		 * Appends or updates any sorting specific properties on the {@link FooTable.RequestData} object.
		 * @instance
		 * @protected
		 * @param {FooTable.RequestData} data - The {@link FooTable.RequestData} object about to passed to the {@link FooTable.Defaults#ajax} method.
		 */
		preajax: function (data) {
			if (this.o.enabled == false) return;
			if (this._changed == true) this.raiseChanging();
			data.sortColumn = this.o.column.name;
			data.sortDirection = this.o.direction;
		},
		/**
		 * Performs the actual sorting against the {@link FooTable.Rows#array}.
		 * @instance
		 * @protected
		 */
		predraw: function () {
			if (this.o.enabled == false
				|| this.ft.options.ajaxEnabled == true)
				return;

			var self = this;
			if (self._changed == true) self.raiseChanging();

			if (!self.o.column
				|| !self.o.direction)
				return;

			self.ft.rows.array.sort(function (a, b) {
				return self.o.direction == 'ASC'
					? self.o.column.sorter(a.cells[self.o.column.index].value, b.cells[self.o.column.index].value)
					: self.o.column.sorter(b.cells[self.o.column.index].value, a.cells[self.o.column.index].value);
			});
		},
		/**
		 * Updates the sorting UI setting the state of the sort buttons.
		 * @instance
		 * @protected
		 */
		draw: function () {
			if (this.o.enabled == false || !this.o.column || !this.o.direction) return;
			var self = this,
				$sortable = self.ft.$table.children('thead').children('tr.footable-header').children('.footable-sortable'),
				$active = self.o.column.$el;

			$sortable.removeClass('footable-asc footable-desc').children('.glyphicon').removeClass('glyphicon-sort glyphicon-sort-by-attributes glyphicon-sort-by-attributes-alt');
			$sortable.not($active).children('.glyphicon').addClass('glyphicon-sort');
			$active.addClass(self.o.direction == 'ASC' ? 'footable-asc' : 'footable-desc')
				.children('.glyphicon').addClass(self.o.direction == 'ASC' ? 'glyphicon-sort-by-attributes' : 'glyphicon-sort-by-attributes-alt');
		},
		/**
		 * Performs any post draw operations required for sorting.
		 * @instance
		 * @protected
		 */
		postdraw: function(){
			if (this.o.enabled == false) return;
			if (this._changed == true) this.raiseChanged();
			this._changed = false;
		},
		/**
		 * Raises the sorting_changing event using the column and direction to generate a {@link FooTable.Sorter} object for the event and merges changes made by any listeners back into the current state.
		 * @instance
		 * @protected
		 * @fires FooTable.Sorting#sorting_changing
		 */
		raiseChanging: function(){
			var sorter = new FooTable.Sorter(this.o.column, this.o.direction);
			/**
			 * The sorting_changing event is raised before a sort is applied and allows listeners to modify the sorter or cancel it completely by calling preventDefault on the jQuery.Event object.
			 * @event FooTable.Sorting#sorting_changing
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Sorter} sorter - The sorter that is about to be applied.
			 */
			if (this._changed == true && this.ft.raise('sorting_changing', [sorter]).isDefaultPrevented()) return $.when();
			this.o.column = this.ft.columns.get(sorter.column);
			this.o.direction = FooTable.is.type(sorter.direction, 'string') && (sorter.direction == 'ASC' || sorter.direction == 'DESC') ? sorter.direction : 'ASC';
		},
		/**
		 * Raises the sorting_changed event using the column and direction to generate a {@link FooTable.Sorter} object for the event.
		 * @instance
		 * @protected
		 * @fires FooTable.Sorting#sorting_changed
		 */
		raiseChanged: function(){
			/**
			 * The sorting_changed event is raised after a sorter has been applied.
			 * @event FooTable.Sorting#sorting_changed
			 * @param {jQuery.Event} e - The jQuery.Event object for the event.
			 * @param {FooTable.Instance} instance - The instance of the plugin raising the event.
			 * @param {FooTable.Sorter} sorter - The sorter that has been applied.
			 */
			this.ft.raise('sorting_changed', [new FooTable.Sorter(this.o.column, this.o.direction)]);
		},

		/* PUBLIC */
		/**
		 * Sets the sorting options and calls the {@link FooTable.Instance#update} method to perform the actual sorting.
		 * @instance
		 * @param {(string|number|FooTable.Column)} column - The column name, index or the actual {@link FooTable.Column} object to sort by.
		 * @param {string} [direction="ASC"] - The direction to sort by, either ASC or DESC.
		 * @fires FooTable.Sorting#sorting_changing
		 * @fires FooTable.Sorting#sorting_changed
		 */
		sort: function(column, direction){
			var self = this;
			self.o.column = self.ft.columns.get(column);
			self.o.direction = FooTable.is.type(direction, 'string') && (direction == 'ASC' || direction == 'DESC') ? direction : 'ASC';
			self._changed = true;
			return this.ft.update();
		},

		/* PRIVATE */
		/**
		 * Generates the sorting UI from the supplied options.
		 * @instance
		 * @private
		 * @param {object} options - The options to use to generate UI.
		 */
		_generate: function (options) {
			var self = this;
			options.sorting.column = self.ft.columns.get(options.sorting.column) || self.ft.columns.first(function (col) { return col.sorted; });
			options.sorting.direction = options.sorting.column == null
				? null
				: (options.sorting.direction == null
					? (options.sorting.column.direction == null
						? 'ASC'
						: options.sorting.column.direction)
					: options.sorting.direction);
			self.ft.$table.addClass('footable-sorting').children('thead').children('tr.footable-header').children('th,td').filter(function (i) {
				return self.ft.columns.array[i].sortable == true;
			}).append($('<span/>', {'class': 'glyphicon glyphicon-sort'}));
			self.ft.$table.on('click.footable', '.footable-sortable', { self: self }, self._onSortClicked);
		},
		/**
		 * Handles the sort button clicked event.
		 * @instance
		 * @private
		 * @param {jQuery.Event} e - The event object for the event.
		 */
		_onSortClicked: function (e) {
			e.preventDefault();
			var self = e.data.self, $header = $(this).closest('th,td'),
				direction = $header.is('.footable-asc, .footable-desc')
					? ($header.hasClass('footable-desc') ? 'ASC' : 'DESC')
					: 'ASC';
			self.sort($header.index(), direction);
		}
	});

	// Below are methods exposed on the core FooTable.Instance object for easy access

	/**
	 * Sort the table using the specified column and direction. Added by the {@link FooTable.Sorting} component.
	 * @instance
	 * @param {(string|number|FooTable.Column)} column - The column name, index or the actual {@link FooTable.Column} object to sort by.
	 * @param {string} [direction="ASC"] - The direction to sort by, either ASC or DESC.
	 * @fires FooTable.Sorting#sorting_changing
	 * @fires FooTable.Sorting#sorting_changed
	 * @see FooTable.Sorting#sort
	 */
	FooTable.Instance.prototype.sort = function(column, direction){
		return this.use(FooTable.Sorting).sort(column, direction);
	};

})(jQuery, FooTable = window.FooTable || {});