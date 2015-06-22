(function($, FooTable){

	FooTable.Filter = FooTable.Class.extend(/** @lends FooTable.Filter */{
		/**
		 * The filter object contains the query to filter by and the columns to apply it to.
		 * @constructs
		 * @extends FooTable.Class
		 * @param {string} query - The query for the filter.
		 * @param {Array.<FooTable.Column>} columns - The columns to apply the query to.
		 * @returns {FooTable.Filter}
		 */
		ctor: function(query, columns){
			/**
			 * The query for the filter.
			 * @type {string}
			 */
			this.query = query;
			/**
			 * The columns to apply the query to.
			 * @type {Array.<FooTable.Column>}
			 */
			this.columns = columns;
		}
	});

})(jQuery, FooTable = window.FooTable || {});