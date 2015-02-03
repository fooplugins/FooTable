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
			this.instance = instance;
			/**
			 * The jQuery cell object for the column header. This is set by the plugin during initialization.
			 * @type {jQuery}
			 */
			this.$headerCell = $(cell);
			/**
			 * The index of the column in the table. This is set by the plugin during initialization.
			 * @type {number}
			 * @default -1
			 */
			this.index = typeof definition.index === 'number' ? definition.index : -1;
			/**
			 * Whether or not this column is hidden from view and appears in the details row. This is set by the plugin during initialization.
			 * @type {boolean}
			 * @default false
			 */
			this.hidden = typeof definition.hidden === 'boolean' ? definition.hidden : false;
			/**
			 * Whether or not this column is completely hidden from view and will not appear in the details row.
			 * @type {boolean}
			 * @default true
			 */
			this.visible = typeof definition.visible === 'boolean' ? definition.visible : true;
			/**
			 * The parse function for this column. This is set by the plugin during initialization.
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