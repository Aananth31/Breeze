/**
 * System commands
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * These are system commands - commands required for Pokemon Showdown
 * to run. A lot of these are sent by the client.
 *
 * If you'd like to modify commands, please go to config/commands.js,
 * which also teaches you how to use commands.
 *
 * @license MIT license
 */

var crypto = require('crypto');
var poofeh = true;
var inShop = ['symbol', 'custom', 'animated', 'room', 'trainer', 'fix', 'potd'];
var closeShop = false;
var closedShop = 0;

const MAX_REASON_LENGTH = 300;

var commands = exports.commands = {

	createpoints: function(target, room, user, connection) {
		if(!user.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');
		fs.exists('config/cash.csv', function (exists) {
			if(exists){
			return connection.sendTo(room, 'Since this file already exists, you cannot do this.');
			} else {
				fs.writeFile('config/cash.csv', 'championonyxe,10000', function (err) {
					if (err) throw err;
					console.log('config/cash.csv created.');
					connection.sendTo(room, 'config/cash.csv created.');
				});
			}
		});
	},

	createcoins: function(target, room, user, connection) {
		if (!user.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');
		fs.exists('config/coins.csv', function (exists) {
			if (exists) {
				return connection.sendTo(room, 'This file already exists so you do not need to create it again.')
			} else {
				fs.writeFile('config/coins.csv', 'championonyxe,10000', function (err) {
					if (err) throw err;
					console.log('config/coins.csv created.');
					connection.sendTo(room, 'config/coins.csv created,');
				});
			}
		});
	},
	
	drinks: function(target,room,user) {
		if(!this.canBroadcast()) return;
		this.sendReplyBox('<center><table style="border-collapse:collapse;border-spacing:0;border-color:#999"><tr><th style="font-family:Arial, sans-serif;font-size:14px;font-weight:bold;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#fff;background-color:#26ADE4">Drink</th><th style="font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#fff;background-color:#26ADE4">Price</th><th style="font-family:Arial, sans-serif;font-size:14px;font-weight:normal;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#fff;background-color:#26ADE4">Luck</th></tr><tr><td style="font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#444;background-color:#D2E4FC">Coffee</td><td style="font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#444;background-color:#D2E4FC">2 Bucks</td><td style="font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#444;background-color:#D2E4FC">20%</td></tr><tr><td style="font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#444;background-color:#F7FDFA;font-weight:bold">Cola</td><td style="font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#444;background-color:#F7FDFA">4 Bucks</td><td style="font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#444;background-color:#F7FDFA">40%</td></tr><tr><td style="font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#444;background-color:#D2E4FC;font-weight:bold">Coffee</td><td style="font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#444;background-color:#D2E4FC">5 Bucks</td><td style="font-family:Arial, sans-serif;font-size:14px;padding:10px 5px;border-style:solid;border-width:1px;overflow:hidden;word-break:normal;border-color:#999;color:#444;background-color:#D2E4FC">60%</td></tr></table></center><center>/drink [drink] to drink</center>');
	},
	
	stafflist: function(target, room, user, connection) {
        var buffer = [];
        var admins = [];
        var developers = [];
        var leaders = [];
        var mods = [];
        var drivers = [];
        var voices = [];
        
        admins2 = ''; developers2 = ''; leaders2 = ''; mods2 = ''; drivers2 = ''; voices2 = ''; 
        stafflist = fs.readFileSync('config/usergroups.csv','utf8');
        stafflist = stafflist.split('\n');
        for (var u in stafflist) {
            line = stafflist[u].split(',');
			if (line[1] == '~') { 
                admins2 = admins2 +line[0]+',';
            }
            if (line[1] == '&') { 
                leaders2 = leaders2 +line[0]+',';
            }
            if (line[1] == '@') { 
                mods2 = mods2 +line[0]+',';
            } 
            if (line[1] == '%') { 
                drivers2 = drivers2 +line[0]+',';
            } 
            if (line[1] == '+') { 
                voices2 = voices2 +line[0]+',';
             } 
        }
        admins2 = admins2.split(',');
        leaders2 = leaders2.split(',');
        mods2 = mods2.split(',');
        drivers2 = drivers2.split(',');
        voices2 = voices2.split(',');
        for (var u in admins2) {
            if (admins2[u] != '') admins.push(admins2[u]);
        }
        for (var u in leaders2) {
            if (leaders2[u] != '') leaders.push(leaders2[u]);
        }
        for (var u in mods2) {
            if (mods2[u] != '') mods.push(mods2[u]);
        }
        for (var u in drivers2) {
            if (drivers2[u] != '') drivers.push(drivers2[u]);
        }
        for (var u in voices2) {
            if (voices2[u] != '') voices.push(voices2[u]);
        }
        if (admins.length > 0) {
            admins = admins.join(', ');
        }
        if (leaders.length > 0) {
            leaders = leaders.join(', ');
        }
        if (mods.length > 0) {
            mods = mods.join(', ');
        }
        if (drivers.length > 0) {
            drivers = drivers.join(', ');
        }
        if (voices.length > 0) {
            voices = voices.join(', ');
        }
        connection.popup('Administrators: \n'+admins+'\nLeaders: \n'+leaders+'\nModerators: \n'+mods+'\nDrivers: \n'+drivers+'\nVoices: \n'+voices);
    },
	
	frt: 'forcerenameto',
	forcerenameto: function(target, room, user) {
		if (!target) return this.parse('/help forcerenameto');
		target = this.splitTarget(target);
		var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (!target) {
			return this.sendReply('No new name was specified.');
		}
		if (!this.can('forcerenameto', targetUser)) return false;

		if (targetUser.userid === toUserid(this.targetUser)) {
			var entry = ''+targetUser.name+' was forcibly renamed to '+target+' by '+user.name+'.';
			this.privateModCommand('(' + entry + ')');
			targetUser.forceRename(target, undefined, true);
		} else {
			this.sendReply("User "+targetUser.name+" is no longer using that name.");
		}
	},

	restart: function(target, room, user) {
		if (!this.can('lockdown')) return false;
		try {
			var forever = require('forever'); 
		} catch(e) {
			return this.sendReply('/restart requires the "forever" module.');
		}

		if (!Rooms.global.lockdown) {
			return this.sendReply('For safety reasons, /restart can only be used during lockdown.');
		}

		if (CommandParser.updateServerLock) {
			return this.sendReply('Wait for /updateserver to finish before using /restart.');
		}
		this.logModCommand(user.name + ' used /restart');
		Rooms.global.send('|refresh|');
		forever.restart('app.js');
	},
	
	eating: 'away',
	gaming: 'away',
    	sleep: 'away',
    	work: 'away',
    	working: 'away',
    	sleeping: 'away',
    	busy: 'away',    
	afk: 'away',
	away: function(target, room, user, connection, cmd) {
		if (!this.can('lock')) return false;
		var t = 'Away';
		switch (cmd) {
			case 'busy':
			t = 'Busy';
			break;
			case 'sleeping':
			t = 'Sleeping';
			break;
			case 'sleep':
			t = 'Sleeping';
			break;
			case 'gaming':
			t = 'Gaming';
			break;
			case 'working':
			t = 'Working';
			break;
			case 'work':
			t = 'Working';
			break;
			case 'eating':
			t = 'Eating';
			break;
			default:
			t = 'Away'
			break;
		}

		if (user.name.length > 18) return this.sendReply('Your username exceeds the length limit.');

		if (!user.isAway) {
			user.originalName = user.name;
			var awayName = user.name + ' - '+t;
			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(awayName);
			user.forceRename(awayName, undefined, true);

			if (user.isStaff) this.add('|raw|-- <b><font color="#088cc7">' + user.originalName +'</font color></b> is now '+t.toLowerCase()+'. '+ (target ? " (" + escapeHTML(target) + ")" : ""));

			user.isAway = true;
		}
		else {
			return this.sendReply('You are already set as a form of away, type /back if you are now back.');
		}

		user.updateIdentity();
	},

	back: function(target, room, user, connection) {
		if (!this.can('lock')) return false;

		if (user.isAway) {
			if (user.name === user.originalName) {
				user.isAway = false; 
				return this.sendReply('Your name has been left unaltered and no longer marked as away.');
			}

			var newName = user.originalName;

			//delete the user object with the new name in case it exists - if it does it can cause issues with forceRename
			delete Users.get(newName);

			user.forceRename(newName, undefined, true);

			//user will be authenticated
			user.authenticated = true;

			if (user.isStaff) this.add('|raw|-- <b><font color="#088cc7">' + newName + '</font color></b> is no longer away.');

			user.originalName = '';
			user.isAway = false;
		}
		else {
			return this.sendReply('You are not set as away.');
		}

		user.updateIdentity();
	}, 

	getid: 'showuserid',
	userid: 'showuserid',
	showuserid: function(target, room, user) {
		if (!target) return this.parse('/help showuserid');

		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		if (!this.can('lock')) return false;

		this.sendReply('The ID of the target is: ' + targetUser);
	},

	uui: 'userupdate',
	userupdate: function(target, room, user) {
		if (!target) return this.sendReply('/userupdate [username] OR /uui [username] - Updates the user identity fixing the users shown group.');
		if (!this.can('hotpatch')) return false;

		target = this.splitTarget(target);
		var targetUser = this.targetUser;

		targetUser.updateIdentity();

		this.sendReply(targetUser + '\'s identity has been updated.');
	},

	usersofrank: function(target, room, user) {
		if (!target) return false;
		var name = '';

		for (var i in Users.users){
			if (Users.users[i].group === target) {
				name = name + Users.users[i].name + ', ';
			}
		}
		if (!name) return this.sendReply('There are no users of the rank ' + target);

		this.sendReply('Users of rank ' + target);
		this.sendReply(name);
	},

	userinrooms: function(target, room, user) {
		if (!this.can('permaban')) return false;
		var targetUser = this.targetUserOrSelf(target);
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}

		this.sendReply('User: '+targetUser.name);

		if (user.group === '&' && targetUser.group === '~') return this.sendReply('You cannot check the rooms (private rooms) of an Admin.');

		var output = 'In rooms: ';
		var output2 = 'Private Rooms: ';
		var first = true;

		for (var i in targetUser.roomCount) {
			if (i === 'global') continue;
			if (!first && !Rooms.get(i).isPrivate) output += ' | ';
			if (!first && Rooms.get(i).isPrivate) output2 += ' | ';
			first = false;
			if (Rooms.get(i).isPrivate) {
				output2 += '<a href="/'+i+'" room="'+i+'">'+i+'</a>';
			}
			else if (!Rooms.get(i).isPrivate) {
				output += '<a href="/'+i+'" room="'+i+'">'+i+'</a>';
			}
		}
		this.sendReply('|raw|'+output+'<br />'+output2);
	},

	masspm: 'pmall',
	pmall: function(target, room, user) {
		if (!target) return this.parse('/pmall [message] - Sends a PM to every user in a room.');
		if (!this.can('pmall')) return false;

		var pmName = '~Frost PM';

		for (var i in Users.users) {
			var message = '|pm|'+pmName+'|'+Users.users[i].getIdentity()+'|'+target;
			Users.users[i].send(message);
		}
	},

	pas: 'pmallstaff',
	pmallstaff: function(target, room, user) {
		if (!target) return this.parse('/pmallstaff [message] - Sends a PM to every staff member online.');
		if (!this.can('pmall')) return false;

		for (var u in Users.users) { 
			if (Users.users[u].isStaff) {
				Users.users[u].send('|pm|~Staff PM|'+Users.users[u].group+Users.users[u].name+'|'+target);
			}
		}
	},


	/*********************************************************
	 * Money                                     
	 *********************************************************/

	bp: 'atm',
        wallet: 'atm',
        satchel: 'atm',
        fannypack: 'atm',
        purse: 'atm',
        bag: 'atm',
        atm: function(target, room, user, connection, cmd) {
        if (!this.canBroadcast()) return;
        var cMatch = false;
        var mMatch = false;
        var money = 0;
        var coins = 0;
        var total = '';
        if (!target) {		
        var data = fs.readFileSync('config/cash.csv','utf8')
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toUserid(parts[0]);
                        if (user.userid == userid) {
                        var x = Number(parts[1]);
                        var money = x;
                        mMatch = true;
                        if (mMatch === true) {
                                break;
                        }
                        }
                }
                if (mMatch === true) {
                        var p = 'bucks';
                        if (money < 2) p = 'buck';
                        total += user.name + ' has ' + money + ' ' + p + '.'
                }
                if (mMatch === false || money == 0) {
                        total += 'You have no bucks.<br />';
                }
                user.money = money;
                var data = fs.readFileSync('config/coins.csv','utf8')
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toUserid(parts[0]);
                        if (user.userid == userid) {
                        var x = Number(parts[1]);
                        var coins = x;
                        cMatch = true;
                        if (cMatch === true) {
                                break;
                        }
                        }
                }
                if (cMatch === true) {
                        var p = 'coins';
                        if (coins < 2) p = 'coin';
                        total += user.name + ' has ' + coins + ' ' + p + '.'
                }
                if (cMatch === false) {
                        total += 'You have no coins.'
                }
                user.coins = coins;
        } else {
                var data = fs.readFileSync('config/cash.csv','utf8')
                target = this.splitTarget(target);
                var targetUser = this.targetUser;
                if (!targetUser) {
                        return this.sendReply('User '+this.targetUsername+' not found.');
                }
                var money = 0;
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toUserid(parts[0]);
                        if (targetUser.userid == userid || target == userid) {
                        var x = Number(parts[1]);
                        var money = x;
                        mMatch = true;
                        if (mMatch === true) {
                                break;
                        }
                        }
                }
                if (mMatch === true) {
                        var p = 'bucks';
                        if (money < 2) p = 'buck';
                        total += targetUser.name + ' has ' + money + ' ' + p + '.<br />';
                } 
                if (mMatch === false) {
                        total += targetUser.name + ' has no bucks.<br />';
                }
                targetUser.money = money;
                var data = fs.readFileSync('config/coins.csv','utf8')
                var coins = 0;
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toUserid(parts[0]);
                        if (targetUser.userid == userid || target == userid) {
                        var x = Number(parts[1]);
                        var coins = x;
                        cMatch = true;
                        if (cMatch === true) {
                                break;
                        }
                        }
                }
                if (cMatch === true) {
                        var p = 'coins';
                        if (coins < 2) p = 'coin';
                        total += targetUser.name + ' has ' + coins + ' ' + p + '.<br />';
                } 
                if (cMatch === false) {
                        total += targetUser.name + ' has no coins.<br />';
                }
                targetUser.coins = coins;
        }
        return this.sendReplyBox(total);
        },

        awardbucks: 'givebucks',
        gb: 'givebucks',
        givebucks: function(target, room, user) {
                if(!user.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');
                if(!target) return this.parse('/help givebucks');
                if (target.indexOf(',') != -1) {
                        var parts = target.split(',');
                        parts[0] = this.splitTarget(parts[0]);
                        var targetUser = this.targetUser;
                if (!targetUser) {
                        return this.sendReply('User '+this.targetUsername+' not found.');
                }
                if (isNaN(parts[1])) {
                        return this.sendReply('Very funny, now use a real number.');
                }
                var cleanedUp = parts[1].trim();
                var giveMoney = Number(cleanedUp);
                var data = fs.readFileSync('config/cash.csv','utf8')
                var match = false;
                var money = 0;
                var line = '';
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toUserid(parts[0]);
                        if (targetUser.userid == userid) {
                        var x = Number(parts[1]);
                        var money = x;
                        match = true;
                        if (match === true) {
                                line = line + row[i];
                                break;
                        }
                        }
                }
                targetUser.money = money;
                targetUser.money += giveMoney;
                if (match === true) {
                        var re = new RegExp(line,"g");
                        fs.readFile('config/cash.csv', 'utf8', function (err,data) {
                        if (err) {
                                return console.log(err);
                        }
                        var result = data.replace(re, targetUser.userid+','+targetUser.money);
                        fs.writeFile('config/cash.csv', result, 'utf8', function (err) {
                                if (err) return console.log(err);
                        });
                        });
                } else {
                        var log = fs.createWriteStream('config/cash.csv', {'flags': 'a'});
                        log.write("\n"+targetUser.userid+','+targetUser.money);
                }
                var p = 'bucks';
                if (giveMoney < 2) p = 'buck';
                this.sendReply(targetUser.name + ' was given ' + giveMoney + ' ' + p + '. This user now has ' + targetUser.money + ' bucks.');
                targetUser.send(user.name + ' has given you ' + giveMoney + ' ' + p + '.');
                } else {
                        return this.parse('/help givebucks');
                }
				},
        

		rfc: 'registerfriendcode',
        registerfc: 'registerfriendcode',
        registerfriendcode: function(target, room, user) {
                if(!target) return this.parse('You need to specify a friend code.');
                if (isNaN(target)) {
                        return this.sendReply('Very funny, now use a real number.');
                }
				if (target == 0 || target.length !== 12) {
                        return this.sendReply('That ain\'t a real friendcode, you lazy bum! Check your 3DS!');
                }
                var fc = target;
                var data = fs.readFileSync('config/fc.csv','utf8')
                var match = false;
                var line = '';
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toUserid(parts[0]);
                        if (user.userid == userid) {
                        var x = target
                        var fc = x;
                        match = true;
                        if (match === true) {
                                line = line + row[i];
                                break;
                        }
                        }
                }
                user.fc = fc;
                if (match === true) {
                        var re = new RegExp(line,"g");
                        fs.readFile('config/fc.csv', 'utf8', function (err,data) {
                        if (err) {
                                return console.log(err);
                        }
                        var result = data.replace(re, user.userid+','+user.fc);
                        fs.writeFile('config/fc.csv', result, 'utf8', function (err) {
                                if (err) return console.log(err);
                        });
                        });
                } else {
                        var log = fs.createWriteStream('config/fc.csv', {'flags': 'a'});
                        log.write("\n"+user.userid+','+user.fc);
                }
                user.send('You have successfully registered the friend code '+target+'!');
                
        },

	takebucks: 'removebucks',
	removebucks: function(target, room, user) {
		if(!user.can('hotpatch')) return this.sendReply('You do not have enough authority to do this.');
		if(!target) return this.parse('/help removebucks');
		if (target.indexOf(',') != -1) {
			var parts = target.split(',');
			parts[0] = this.splitTarget(parts[0]);
			var targetUser = this.targetUser;
		if (!targetUser) {
			return this.sendReply('User '+this.targetUsername+' not found.');
		}
		if (isNaN(parts[1])) {
			return this.sendReply('Very funny, now use a real number.');
		}
		var cleanedUp = parts[1].trim();
		var takeMoney = Number(cleanedUp);
		var data = fs.readFileSync('config/cash.csv','utf8')
		var match = false;
		var money = 0;
		var line = '';
		var row = (''+data).split("\n");
		for (var i = row.length; i > -1; i--) {
			if (!row[i]) continue;
			var parts = row[i].split(",");
			var userid = toUserid(parts[0]);
			if (targetUser.userid == userid) {
			var x = Number(parts[1]);
			var money = x;
			match = true;
			if (match === true) {
				line = line + row[i];
				break;
			}
			}
		}
		targetUser.money = money;
		targetUser.money -= takeMoney;
		if (match === true) {
			var re = new RegExp(line,"g");
			fs.readFile('config/cash.csv', 'utf8', function (err,data) {
			if (err) {
				return console.log(err);
			}
			var result = data.replace(re, targetUser.userid+','+targetUser.money);
			fs.writeFile('config/cash.csv', result, 'utf8', function (err) {
				if (err) return console.log(err);
			});
			});
		} else {
			var log = fs.createWriteStream('config/cash.csv', {'flags': 'a'});
			log.write("\n"+targetUser.userid+','+targetUser.money);
		}
		var p = 'bucks';
		if (takeMoney < 2) p = 'buck';
		this.sendReply(targetUser.name + ' has had ' + takeMoney + ' ' + p + ' removed. This user now has ' + targetUser.money + ' bucks.');
		targetUser.send(user.name + ' has removed ' + takeMoney + ' bucks from you.');
		} else {
			return this.parse('/help removebucks');
		}
	},

			fc: 'friendcode',
friendcode: function(target, room, user, connection, cmd) {
if (!this.canBroadcast()) return;
        var aMatch = false;
        var fc = 0;
        var total = '';
 var data = fs.readFileSync('config/fc.csv','utf8')
                target = this.splitTarget(target);
                var targetUser = this.targetUser;
                if (!targetUser) {
                        return this.sendReply('User '+this.targetUsername+' not found.');
                }
                var fc = 0;
                var row = (''+data).split("\n");
                for (var i = row.length; i > -1; i--) {
                        if (!row[i]) continue;
                        var parts = row[i].split(",");
                        var userid = toUserid(parts[0]);
                        if (targetUser.userid == userid || target == userid) {
                        var x = Number(parts[1]);
                        var fc = x;
                        aMatch = true;
                        if (aMatch === true) {
                                break;
                        }
                        }
                }
                if (aMatch === true) {
						 var s = fc;
						 /*fc = fc.slice(0,4)+'-'+fc.slice(4,8)+'-'+fc.slice(8,12);*/
						 if (fc <= 0) s = 'unregistered';
						 if (fc.length > 12) s = 'invalid';
						 if (fc.length < 12) s = 'invalid';
						 this.sendReplyBox(targetUser.name+'\'s X/Y Friend Code is '+s+'.');
						 }
               
if (aMatch === false) {
return this.sendReplyBox(targetUser.name +'\'s FC is unregistered');
}
 targetUser.fc = fc;
},

	buy: function(target, room, user) {
		if (!target) return this.parse('/help buy');
		if (closeShop) return this.sendReply('The shop is currently closed and will open shortly.');
		var target2 = target;
		target = target.split(', ');
		var avatar = '';
		var data = fs.readFileSync('config/cash.csv','utf8')
		var match = false;
		var money = 0;
		var line = '';
		var row = (''+data).split("\n");
		for (var i = row.length; i > -1; i--) {
			if (!row[i]) continue;
			var parts = row[i].split(",");
			var userid = toUserid(parts[0]);
			if (user.userid == userid) {
			var x = Number(parts[1]);
			var money = x;
			match = true;
			if (match === true) {
				line = line + row[i];
				break;
			}
			}
		}
		user.money = money;
		var price = 0;
		if (target2 === 'symbol') {
			price = 5;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a custom symbol. You will have this until you log off for more than an hour.');
				this.sendReply('Use /customsymbol [symbol] to change your symbol now!');
				user.canCustomSymbol = true;
				this.add(user.name + ' has purchased a custom symbol!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target[0] === 'custom') {
			price = 20;
			if (price <= user.money) {
				if (!target[1]) return this.sendReply('Please specify the avatar you would like you buy. It has a maximum size of 80x80 and must be in .png format. ex: /buy custom, [url to the avatar]');
       				var filename = target[1].split('.');
				filename = '.'+filename.pop();
				if (filename != ".png") return this.sendReply('Your avatar must be in .png format.');
				user.money = user.money - price;
				this.sendReply('You have purchased a custom avatar. Staff have been notified and it will be added in due time.');
				user.canCustomAvatar = true;
				Rooms.rooms.staff.add(user.name+' has purchased a custom avatar. Image: '+target[1]);
				for (var u in Users.users) {
					if (Users.users[u].group == "~" || Users.users[u].group == "&") {
						Users.users[u].send('|pm|~Server|'+Users.users[u].group+Users.users[u].name+'|'+user.name+' has purchased a custom avatar. Image: '+target[1]);
					}
				}
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target[0] === 'animated') {
			price = 35;
			if (price <= user.money) {
				if (!target[1]) return this.sendReply('Please specify the avatar you would like you buy. It has a maximum size of 80x80 and must be in .gif format. ex: /buy animated, [url to the avatar]');
       				var filename = target[1].split('.');
				filename = '.'+filename.pop();
				if (filename != ".gif") return this.sendReply('Your avatar must be in .gif format.');
				user.money = user.money - price;
				this.sendReply('You have purchased a custom animated avatar. Staff have been notified and it will be added in due time.');
				user.canAnimatedAvatar = true;
				Rooms.rooms.staff.add(user.name+' has purchased a custom animated avatar. Image: '+target[1]);
				for (var u in Users.users) {
					if (Users.users[u].group == "~" || Users.users[u].group == "&") {
						Users.users[u].send('|pm|~Server|'+Users.users[u].group+Users.users[u].name+'|'+user.name+' has purchased a custom animated avatar. Image: '+target[1]);
					}
				}
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target[0] === 'room') {
			price = 80;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a chat room. You need to message an Admin so that the room can be made.');
				user.canChatRoom = true;
				this.add(user.name + ' has purchased a chat room!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'trainer') {
			price = 30;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased a trainer card. You need to message an Admin capable of adding this (Champion OnyxE).');
				user.canTrainerCard = true;
				this.add(user.name + ' has purchased a trainer card!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'fix') {
			price = 10;
			if (price <= user.money) {
				user.money = user.money - price;
				this.sendReply('You have purchased the ability to alter your avatar or trainer card. You need to message an Admin capable of adding this (Champion OnyxE).');
				user.canFixItem = true;
				this.add(user.name + ' has purchased the ability to set alter their card or avatar!');
			} else {
				return this.sendReply('You do not have enough bucks for this. You need ' + (price - user.money) + ' more bucks to buy ' + target + '.');
			}
		}
		if (target2 === 'potd') {
			price = 15;
			if (price <= user.money) {
				user.money = user.
