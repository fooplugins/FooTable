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