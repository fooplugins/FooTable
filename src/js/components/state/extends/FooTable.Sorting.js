(function(F){

	if (!F.Sorting) return;

	/**
	 * Allows the sorting component to retrieve its' stored state.
	 */
	F.Sorting.prototype.readState = function(){
		if (this.ft.state.sorting) {
			var state = this.ft.state.get('sorting');
			if (F.is.hash(state)) {
				var column = this.ft.columns.get(state.column);
				if (column instanceof F.Column) {
					this.column = column;
					this.column.direction = state.direction;
				}
			}
		}
	};

	/**
	 * Allows the sorting component to write its' current state to the store.
	 */
	F.Sorting.prototype.writeState = function(){
		if (this.ft.state.sorting && this.column instanceof F.Column){
			this.ft.state.set('sorting', {
				column: this.column.name,
				direction: this.column.direction
			});
		}
	};

	/**
	 * Allows the sorting component to clear any stored state.
	 */
	F.Sorting.prototype.clearState = function(){
		if (this.ft.state.sorting) {
			this.ft.state.remove('sorting');
		}
	};

})(FooTable);