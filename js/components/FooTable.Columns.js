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