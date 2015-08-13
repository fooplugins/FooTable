(function($, F){

	F.NumberColumn = F.Column.extend(/** @lends FooTable.NumberColumn */{
		/**
		 * The number column class is used to handle simple number columns.
		 * @constructs
		 * @extends FooTable.Column
		 * @param {FooTable.Table} instance -  The parent {@link FooTable.Table} this column belongs to.
		 * @param {object} definition - An object containing all the properties to set for the column.
		 * @returns {FooTable.TextColumn}
		 */
		construct: function(instance, definition){
			this._super(instance, definition);
			this.type = 'number';
		},
		/**
		 * This is supplied either the cell value or jQuery object to parse. Any value can be returned from this method and will be provided to the {@link FooTable.DateColumn#format} function
		 * to generate the cell contents.
		 * @instance
		 * @protected
		 * @param {(*|jQuery)} valueOrElement - The value or jQuery cell object.
		 * @returns {(number|null)}
		 * @this FooTable.NumberColumn
		 */
		parser: function(valueOrElement){
			if (F.is.jq(valueOrElement)){
				valueOrElement = valueOrElement.data('value') || valueOrElement.text().replace(/[^0-9.\-]/g, '');
			}
			if (F.is.string(valueOrElement)) valueOrElement = parseFloat(valueOrElement);
			if (F.is.number(valueOrElement)) return valueOrElement;
			return null;
		}
	});

	F.columns.register('number', F.NumberColumn);

})(jQuery, FooTable);