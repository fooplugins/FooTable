(function($, F){

	F.ArrayColumn = F.Column.extend(/** @lends FooTable.ArrayColumn */{
		/**
		 * @summary A column to handle Array values.
		 * @constructs
		 * @extends FooTable.Column
		 * @param {FooTable.Table} instance -  The parent {@link FooTable.Table} this column belongs to.
		 * @param {object} definition - An object containing all the properties to set for the column.
		 */
		construct: function(instance, definition) {
			this._super(instance, definition, 'array');
		},
		/**
		 * @summary Parses the supplied value or element to retrieve a column value.
		 * @description This is supplied either the cell value or jQuery object to parse. This method will return either the Array containing the values or null.
		 * @instance
		 * @protected
		 * @param {(*|jQuery)} valueOrElement - The value or jQuery cell object.
		 * @returns {(array|null)}
		 */
		parser: function(valueOrElement){
			if (F.is.element(valueOrElement) || F.is.jq(valueOrElement)){ // use jQuery to get the value
				var $el = $(valueOrElement), data = $el.data('value'); // .data() will automatically convert a JSON string to an array
				if (F.is.array(data)) return data;
				data = $el.html();
				try {
					data = JSON.parse(data);
				} catch(err) {
					data = null;
				}
				return F.is.array(data) ? data : null; // if we have an array return it
			}
			if (F.is.array(valueOrElement)) return valueOrElement; // if we have an array return it
			return null; // otherwise we have no value so return null
		},
		/**
		 * @summary Formats the column value and creates the HTML seen within a cell.
		 * @description This is supplied the value retrieved from the {@link FooTable.ArrayColumn#parser} function and must return a string, HTMLElement or jQuery object.
		 * The return value from this function is what is displayed in the cell in the table.
		 * @instance
		 * @protected
		 * @param {?Array} value - The value to format.
		 * @param {object} options - The current plugin options.
		 * @param {object} rowData - An object containing the current row data.
		 * @returns {(string|HTMLElement|jQuery)}
		 */
		formatter: function(value, options, rowData){
			return F.is.array(value) ? JSON.stringify(value) : '';
		}
	});

	F.columns.register('array', F.ArrayColumn);

})(jQuery, FooTable);