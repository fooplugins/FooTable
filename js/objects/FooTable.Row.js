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