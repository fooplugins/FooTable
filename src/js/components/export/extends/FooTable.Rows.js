(function(F){
	/**
	 * @summary Return the rows as simple JavaScript objects in an array.
	 * @memberof FooTable.Rows#
	 * @function toArray
	 * @param {boolean} [filtered=false] - Whether or not to exclude filtered rows from the result.
	 * @returns {Object[]}
	 */
	F.Rows.prototype.toArray = function(filtered){
		return this.ft.use(F.Export).rows(filtered);
	};

})(FooTable);