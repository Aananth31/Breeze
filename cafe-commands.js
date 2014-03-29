exports.cafecommands = {
  writeMoney: function(uid, amount) {
			var data = fs.readFileSync('config/money.csv','utf8')
			var match = false;
			var money = 0;
			var row = (''+data).split("\n");
			var line = '';
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var parts = row[i].split(",");
				var userid = toUserid(parts[0]);
				if (uid.userid == userid) {
					var x = Number(parts[1]);
					var money = x;
					match = true;
					if (match === true) {
						line = line + row[i];
						break;
					}
				}
			}
			uid.money = money;
			uid.money = uid.money + amount;
			if (match === true) {
				var re = new RegExp(line,"g");
				fs.readFile('config/money.csv', 'utf8', function (err,data) {
				if (err) {
					return console.log(err);
				}
				var result = data.replace(re, uid.userid+','+uid.money);
				fs.writeFile('config/money.csv', result, 'utf8', function (err) {
					if (err) return console.log(err);
				});
				});
			} else {
				var log = fs.createWriteStream('config/money.csv', {'flags': 'a'});
				log.write("\n"+uid.userid+','+uid.money);
			}
		},
		readMoney: function(uid) {
			var data = fs.readFileSync('config/money.csv','utf8')
			var match = false;
			var money = 0;
			var row = (''+data).split("\n");
			var line = '';
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var parts = row[i].split(",");
				var userid = toUserid(parts[0]);
				if (uid.userid == userid) {
					var x = Number(parts[1]);
					var money = x;
					match = true;
					if (match === true) {
						line = line + row[i];
						break;
					}
				}
			}
			uid.money = money;
			return money;
		},
		writeEnergy: function(uid, amount) {
			var data = fs.appendFile('config/energy.csv','utf8')
			var match = false;
			var money = 0;
			var row = (''+data).split("\n");
			var line = '';
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var parts = row[i].split(",");
				var userid = toUserid(parts[0]);
				if (uid.userid == userid) {
					var x = Number(parts[1]);
					var money = x;
					match = true;
					if (match === true) {
						line = line + row[i];
						break;
					}
				}
			}
			uid.money = money;
			uid.money = uid.money + amount;
			if (match === true) {
				var re = new RegExp(line,"g");
				fs.readFile('config/energy.csv', 'utf8', function (err,data) {
				if (err) {
					return console.log(err);
				}
				var result = data.replace(re, uid.userid+','+uid.money);
				fs.writeFile('config/energy.csv', result, 'utf8', function (err) {
					if (err) return console.log(err);
				});
				});
			} else {
				var log = fs.createWriteStream('config/energy.csv', {'flags': 'a'});
				log.write("\n"+uid.userid+','+uid.money);
			}
		},
		readEnergy: function(uid) {
		  var data = fs.appendFile('config/energy.csv','utf8')
			var match = false;
			var money = 0;
			var row = (''+data).split("\n");
			var line = '';
			for (var i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				var parts = row[i].split(",");
				var userid = toUserid(parts[0]);
				if (uid.userid == userid) {
					var x = Number(parts[1]);
					var money = x;
					match = true;
					if (match === true) {
						line = line + row[i];
						break;
					}
				}
			}
			uid.money = money;
			return money;
		},
};
