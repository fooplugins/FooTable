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