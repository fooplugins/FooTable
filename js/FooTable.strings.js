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