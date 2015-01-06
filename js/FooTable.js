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