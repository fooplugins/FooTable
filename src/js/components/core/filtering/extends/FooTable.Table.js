(function(F){
	/**
	 * Filter the table using the supplied query and columns. Added by the {@link FooTable.Filtering} component.
	 * @instance
	 * @param {string} query - The query to filter the rows by.
	 * @param {(Array.<string>|Array.<number>|Array.<FooTable.Column>)} [columns] - The columns to apply the filter to in each row.
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Filtering#before.ft.filtering
	 * @fires FooTable.Filtering#after.ft.filtering
	 * @see FooTable.Filtering#filter
	 */
	F.Table.prototype.applyFilter = function(query, columns){
		return this.use(F.Filtering).filter(query, columns);
	};

	/**
	 * Clear the current filter from the table. Added by the {@link FooTable.Filtering} component.
	 * @instance
	 * @returns {jQuery.Promise}
	 * @fires FooTable.Filtering#before.ft.filtering
	 * @fires FooTable.Filtering#after.ft.filtering
	 * @see FooTable.Filtering#clear
	 */
	F.Table.prototype.clearFilter = function(){
		return this.use(F.Filtering).clear();
	};
})(FooTable);