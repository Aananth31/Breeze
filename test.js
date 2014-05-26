// Bot's Name
global.botName = 'Bot';

var joinAllRooms = true;

exports.bot = function() {

	// Set up fake user connection for bot. Uses a fake ip
  	var path = require("path"),
  				fs = require("fs");
	var worker = new (require(path.join(__dirname, '../', './fake-process')).FakeProcess)();
	Users.socketConnect(worker.server ,undefined, '1', '76.16.23.96');

	// Getting the fake user from the Users list
	for (var i in Users.users) { 
		if(Users.users[i].connections[0].ip === '76.16.23.96') {

			var bot = Users.users[i];

			// Modifying user's properties
			bot.name = botName;
			bot.named = true;
			bot.renamePending = botName;
			bot.authenticated = true;
			bot.userid = toId(botName);
			bot.group = '@';

			// Rooms that bot will join and adding bot user to Users list and
			// removing the fake user created which already filled its purpose
			// of easily filling  in the gaps of all the user's property
			if (joinAllRooms === true) {
				for (var all in Rooms.rooms) {
					if (all != 'global' && all != 'spamroom') {
						bot.roomCount[all] = 1;
					}
				}
				Users.users[bot.userid] = bot;
				for (var allRoom in Rooms.rooms) {
					if (allRoom != 'global' && allRoom != 'spamroom') {
						Rooms.rooms[allRoom].users[Users.users[bot.userid]] = Users.users[bot.userid]; 
					}
				}
			}
			delete Users.users[i];
		}
	}
};
