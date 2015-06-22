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