(function($, F){

	if (F.is.defined(F.Paging)){
		/**
		 * Holds a shallow clone of the un-paged {@link FooTable.Rows#array} value before paging occurs and superfluous rows are removed. Added by the {@link FooTable.Editing} component.
		 * @instance
		 * @public
		 * @type {Array<FooTable.Row>}
		 */
		F.Paging.prototype.unpaged = [];

		// override the default predraw method with one that sets the unpaged property.
		F.Paging.extend('predraw', function(){
			this.unpaged = this.ft.rows.array.slice(0); // create a shallow clone for later use
			this._super(); // call the original method
		});
	}

})(jQuery, FooTable);