(function(F){
	/**
	 * @summary Return the columns as simple JavaScript objects in an array.
	 * @memberof FooTable.Columns#
	 * @function toArray
	 * @returns {Object[]}
	 */
	F.Columns.prototype.toArray = function(){
		return this.ft.use(F.Export).columns();
	};

})(FooTable);