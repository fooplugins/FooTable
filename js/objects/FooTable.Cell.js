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