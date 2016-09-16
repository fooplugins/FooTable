(function(F){

	if (!F.Filtering) return;

	/**
	 * Allows the filtering component to retrieve its' stored state.
	 */
	F.Filtering.prototype.readState = function(){
		if (this.ft.state.filtering){
			var state = this.ft.state.get('filtering');
			if (F.is.hash(state) && !F.is.emptyArray(state.filters)){
				this.filters = this.ensure(state.filters);
			}
		}
	};

	/**
	 * Allows the filtering component to write its' current state to the store.
	 */
	F.Filtering.prototype.writeState = function(){
		if (this.ft.state.filtering) {
			var filters = F.arr.map(this.filters, function (f) {
				return {
					name: f.name,
					query: f.query instanceof F.Query ? f.query.val() : f.query,
					columns: F.arr.map(f.columns, function (c) {
						return c.name;
					}),
					hidden: f.hidden,
					space: f.space,
					connectors: f.connectors,
					ignoreCase: f.ignoreCase
				};
			});
			this.ft.state.set('filtering', {filters: filters});
		}
	};

	/**
	 * Allows the filtering component to clear any stored state.
	 */
	F.Filtering.prototype.clearState = function(){
		if (this.ft.state.filtering) {
			this.ft.state.remove('filtering');
		}
	};

})(FooTable);