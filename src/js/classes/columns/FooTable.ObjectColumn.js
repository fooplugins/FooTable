(function($, F){

	F.ObjectColumn = F.Column.extend(/** @lends FooTable.ObjectColumn */{
		/**
		 * @summary A column to handle Object values.
		 * @constructs
		 * @extends FooTable.Column
		 * @param {FooTable.Table} instance -  The parent {@link FooTable.Table} this column belongs to.
		 * @param {object} definition - An object containing all the properties to set for the column.
		 */
		construct: function(instance, definition) {
			this._super(instance, definition, 'object');
		},
		/**
		 * @summary Parses the supplied value or element to retrieve a column value.
		 * @description This is supplied either the cell value or jQuery object to parse. This method will return either the Object containing the values or null.
		 * @instance
		 * @protected
		 * @param {(*|jQuery)} valueOrElement - The value or jQuery cell object.
		 * @returns {(object|null)}
		 */
		parser: function(valueOrElement){
			if (F.is.element(valueOrElement) || F.is.jq(valueOrElement)){ // use jQuery to get the value
				var $el = $(valueOrElement), data = $el.data('value'); // .data() will automatically convert a JSON string to an object
				if (F.is.object(data)) return data;
				data = $el.html();
				try {
					data = JSON.parse(data);
				} catch(err) {
					data = null;
				}
				return F.is.object(data) ? data : null; // if we have an object return it
			}
			if (F.is.object(valueOrElement)) return valueOrElement; // if we have an object return it
			return null; // otherwise we have no value so return null
		},
		/**
		 * @summary Formats the column value and creates the HTML seen within a cell.
		 * @description This is supplied the value retrieved from the {@link FooTable.ObjectColumn#parser} function and must return a string, HTMLElement or jQuery object.
		 * The return value from this function is what is displayed in the cell in the table.
		 * @instance
		 * @protected
		 * @param {*} value - The value to format.
		 * @param {object} options - The current plugin options.
		 * @param {object} rowData - An object containing the current row data.
		 * @returns {(string|HTMLElement|jQuery)}
		 */
		formatter: function(value, options, rowData){
			return F.is.object(value) ? JSON.stringify(value) : '';
		}
	});

	F.columns.register('object', F.ObjectColumn);

})(jQuery, FooTable);