(function(dr){

	/**
	 * Instead of auto-generating rows we use this for all demos when possible to provide a consistent experience when it comes to demo'ing sorting, filtering, etc.
	 * @type {{id: number, firstName: string, lastName: string, jobTitle: string, started: number, dob: number}[]}
	 */
	dr.rows = [
		{"id":1,"firstName":"Dennise","lastName":"Fuhrman","jobTitle":"High School History Teacher","started":1320727711718,"dob":-297779282564},
		{"id":2,"firstName":"Elodia","lastName":"Weisz","jobTitle":"Wallpaperer Helper","started":1287148515499,"dob":386361738424},
		{"id":3,"firstName":"Raeann","lastName":"Haner","jobTitle":"Internal Medicine Nurse Practitioner","started":1385672673653,"dob":-121381229537},
		{"id":4,"firstName":"Junie","lastName":"Landa","jobTitle":"Offbearer","started":1288482333666,"dob":-118671236561},
		{"id":5,"firstName":"Solomon","lastName":"Bittinger","jobTitle":"Roller Skater","started":1325146876463,"dob":-166494946257},
		{"id":6,"firstName":"Bar","lastName":"Lewis","jobTitle":"Clown","started":1352715262259,"dob":681327722833},
		{"id":7,"firstName":"Usha","lastName":"Leak","jobTitle":"Ships Electronic Warfare Officer","started":1344942030997,"dob":311915605299},
		{"id":8,"firstName":"Lorriane","lastName":"Cooke","jobTitle":"Technical Services Librarian","started":1285073570115,"dob":-23179960450},
		{"id":9,"firstName":"Bar","lastName":"Lewis","jobTitle":"Accounts Collector","started":1285722439841,"dob":-139809161790},
		{"id":10,"firstName":"Jacqulyn","lastName":"Sprouse","jobTitle":"Childrens Pastor","started":1362708770614,"dob":-161197675898},
		{"id":11,"firstName":"Bernie","lastName":"Guilford","jobTitle":"Union Representative","started":1371752280231,"dob":579576546945},
		{"id":12,"firstName":"Humbero","lastName":"Dauenhauer","jobTitle":"Airline Transport Pilot","started":1302658642054,"dob":651575530017},
		{"id":13,"firstName":"Usha","lastName":"Bonk","jobTitle":"Propeller-Driven Airplane Mechanic","started":1361205029957,"dob":-92203556131},
		{"id":14,"firstName":"Charles","lastName":"Roling","jobTitle":"Photocopying Equipment Repairer","started":1301040631479,"dob":478041319332},
		{"id":15,"firstName":"Eddy","lastName":"Yingst","jobTitle":"Body Shop Supervisor","started":1323557521465,"dob":-31781174041},
		{"id":16,"firstName":"Renea","lastName":"Yaple","jobTitle":"Electrical Engineering Director","started":1352615817780,"dob":250091538430},
		{"id":17,"firstName":"Elodia","lastName":"Maxton","jobTitle":"Industrial Waste Treatment Technician","started":1269420820726,"dob":217360673489},
		{"id":18,"firstName":"Maple","lastName":"Yingst","jobTitle":"Serials Librarian","started":1296068846291,"dob":359994209154},
		{"id":19,"firstName":"Doy","lastName":"Goyette","jobTitle":"LAN Systems Administrator","started":1276889267792,"dob":-1345396555},
		{"id":20,"firstName":"Marline","lastName":"Yingst","jobTitle":"Photocopying Equipment Repairer","started":1266253453154,"dob":-160576465448},
		{"id":21,"firstName":"Ami","lastName":"Wadkins","jobTitle":"Strawberry Sorter","started":1384452674028,"dob":685666507167},
		{"id":22,"firstName":"Whiney","lastName":"Dauenhauer","jobTitle":"Dog Trainer","started":1367406754013,"dob":62341480230},
		{"id":23,"firstName":"Usha","lastName":"Carasco","jobTitle":"Scale Clerk","started":1385753992601,"dob":-270627874563},
		{"id":24,"firstName":"Usha","lastName":"Dauenhauer","jobTitle":"Childcare Center Administrator","started":1317361470737,"dob":-179027659903},
		{"id":25,"firstName":"Shenia","lastName":"Landers","jobTitle":"Animal Husbandry Manager","started":1338778426255,"dob":-215317919599},
		{"id":26,"firstName":"Phoebe","lastName":"Wadkins","jobTitle":"Pulpwood Cutter","started":1270625077640,"dob":70157642899},
		{"id":27,"firstName":"Jack","lastName":"Branco","jobTitle":"Body Shop Supervisor","started":1381656926646,"dob":607809460105},
		{"id":28,"firstName":"Lakeshia","lastName":"Han","jobTitle":"Internal Medicine Nurse Practitioner","started":1368424979406,"dob":534497270215},
		{"id":29,"firstName":"Consuelo","lastName":"Ortego","jobTitle":"Garment Presser","started":1278361527052,"dob":320626180696},
		{"id":30,"firstName":"Claudine","lastName":"Cooke","jobTitle":"Fresco Artist","started":1344010584331,"dob":180599147902},
		{"id":31,"firstName":"Granville","lastName":"Badgett","jobTitle":"Union Representative","started":1338690359469,"dob":184514938293},
		{"id":32,"firstName":"Muriel","lastName":"Ates","jobTitle":"Work Ticket Distributor","started":1285164325997,"dob":-117984133068},
		{"id":33,"firstName":"Junie","lastName":"Wohlwend","jobTitle":"Fresco Artist","started":1373178437624,"dob":562337406588},
		{"id":34,"firstName":"Cyndy","lastName":"Hayton","jobTitle":"Obstetrician/Gynecologist","started":1286100919258,"dob":-211811189012},
		{"id":35,"firstName":"Usha","lastName":"Leister","jobTitle":"Telephone Lines Repairer","started":1292955054336,"dob":-26201701612},
		{"id":36,"firstName":"Annea","lastName":"Sluss","jobTitle":"Biology Laboratory Assistant","started":1289176786080,"dob":229289217429},
		{"id":37,"firstName":"Rayna","lastName":"Mosher","jobTitle":"Business Services Sales Representative","started":1318247721432,"dob":349569293916},
		{"id":38,"firstName":"Renea","lastName":"Guilford","jobTitle":"Dog Trainer","started":1363556517952,"dob":106672130909},
		{"id":39,"firstName":"Sephnie","lastName":"Edwin","jobTitle":"Broadcast Maintenance Engineer","started":1330800620569,"dob":421547906791},
		{"id":40,"firstName":"Junie","lastName":"Shumpert","jobTitle":"Traffic Court Referee","started":1357606672898,"dob":180887809265},
		{"id":41,"firstName":"Lashanda","lastName":"Lewis","jobTitle":"Scene and Lighting Design Lecturer","started":1264778115318,"dob":107030145927},
		{"id":42,"firstName":"Velve","lastName":"Ortego","jobTitle":"Gaming Cage Cashier","started":1271164051224,"dob":302119595953},
		{"id":43,"firstName":"Nikia","lastName":"Marco","jobTitle":"Union Representative","started":1355632868812,"dob":101827537764}
	];

	dr.columns = {
		0: { name: 'id', title: 'ID', width: 80, type: 'number' },
		1: { name: 'firstName', title: 'First Name', sorted: true, direction: 'ASC' },
		2: { name: 'lastName', title: 'Last Name', hide: 'phone' },
		3: { name: 'jobTitle', title: 'Job Title', hide: 'phone', maxWidth: 200, ellipsis: true },
		4: { name: 'started', title: 'Started', hide: 'phone tablet' },
		5: { name: 'dob', title: 'DOB', hide: 'phone tablet' }
	};

	dr.write = function(num){
		num = typeof num === 'number' && num < dr.rows.length ? num : dr.rows.length;
		for (var i = 0; i < dr.rows.length; i++){
			var data = dr.rows[i],
				row = '<tr>';
			row += '<td>' + data.id + '</td>';
			row += '<td>' + data.firstName + '</td>';
			row += '<td>' + data.lastName + '</td>';
			row += '<td>' + data.jobTitle + '</td>';
			row += '<td>' + data.started + '</td>';
			row += '<td>' + data.dob + '</td>';
			row += '</tr>';
			document.write(row);
			if (i == num) break;
		}
	};

})(window.DemoRows = window.DemoRows || {});