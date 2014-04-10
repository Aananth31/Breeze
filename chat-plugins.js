/**
 * Chat plug-ins
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * These are chat plugins - small programs to enhace the chat rooms on Pokemon Showdown.
 * Plugins are objects inside the plugins object. The objects are expected to have data values and a commands object inside.
 * The data object saves the data relevant to the plugin, like scores.
 * The commands object is used to import the commands onto the chat commands.
 * It's very important that you don't add plug-in commands with the same name as existing commands.
 *
 * @license MIT license
 */

var plugins = exports.plugins = {
	/**
	 * Scanvenger hunts plugin.
	 * This game is meant to show a first hint. Players will find the name of a room with that hint.
	 * When you find a room, it gives you a hint for the next room.
	 * You finish upon reaching the third room.
	 * This plugin requires the server to have a room with the id 'scavengers'.
	 */
	scavenger: {
		status: 'off',
		firstHint: '',
		roomOne: '',
		secondHint: '',
		roomTwo: '',
		thirdHint: '',
		roomThree: '',
		participants: {},
		finished: [],
		commands: {
			scavengerstarthunt: function(target, room, user) {
				if (!this.can('ban', null, room)) return false;
				if (room.id !== 'scavengers') return this.sendReplyBox('You can only start scavenger hunts on Scavengers room.');
				if (plugins.scavenger.status === 'on') return this.sendReplyBox('There is already an active scavenger hunt.');
				var targets = target.split(',');
				if (!targets[0] || !targets[1] || !targets[2] || !targets[3] || !targets[4] || !targets[5])
					return this.sendReplyBox('You need to add three rooms and three hints in a [room, hint,] format.');
				plugins.scavenger.status = 'on';
				plugins.scavenger.roomOne = toId(targets[0]);
				plugins.scavenger.firstHint = targets[1].trim();
				plugins.scavenger.roomTwo = toId(targets[2]);
				plugins.scavenger.secondHint = targets[3].trim();
				plugins.scavenger.roomThree = toId(targets[4]);
				plugins.scavenger.thirdHint = targets[5].trim();
				if (Rooms.rooms.scavengers) Rooms.rooms.scavengers.add(
					'|raw|<div class="broadcast-blue"><strong>A new Scavenger Hunt has been started!' 
					+ ' The first hint is: ' + plugins.scavenger.firstHint + '</strong></div>'
				);
				return this.sendReplyBox('Scavenger hunt started.');
			},
			scavengerendhunt: function(target, room, user) {
				if (!this.can('ban', null, room)) return false;
				if (room.id !== 'scavengers') return this.sendReplyBox('You can only end scavenger hunts on Scavengers room.');
				if (plugins.scavenger.status !== 'on') return this.sendReplyBox('There is no active scavenger hunt.');
				var result = '';
				var winner = plugins.scavenger.finished[0];
				var second = plugins.scavenger.finished[1];
				var third = plugins.scavenger.finished[2];
				var consolation = plugins.scavenger.finished.slice(3);
				result += '<strong>Winner of Scavenger Hunt: ' + ((winner)? winner : 'no one') + '.';
				result += '</strong> Second place: ' + ((second)? second : 'no one') + '.';
				result += ' Third place: ' + ((third)? third : 'no one') + '.';
				result += ' Consolation prize to: ' + ((consolation.length > 0)? consolation.join(', ') : 'no one') + '.';
				result += '<br />Solution: ' + plugins.scavenger.roomOne + ', ' 
				+ plugins.scavenger.roomTwo + ', ' + plugins.scavenger.roomThree + '.';
				if (Rooms.rooms.scavengers) Rooms.rooms.scavengers.add('|raw|<div class="broadcast-blue"><strong>' + result + '</strong></div>');
				this.parse('/scavengerresethunt');
				return this.sendReplyBox('Scavenger hunt finished.');
			},
			scavengerresethunt: function(target, room, user) {
				if (!this.can('ban', null, room)) return false;
				if (room.id !== 'scavengers') return this.sendReplyBox('You can only reset scavenger hunts on Scavengers room.');
				plugins.scavenger.status = 'off';
				plugins.scavenger.roomOne = '';
				plugins.scavenger.roomTwo = '';
				plugins.scavenger.roomThree = '';
				plugins.scavenger.firstHint = '';
				plugins.scavenger.secondHint = '';
				plugins.scavenger.thirdHint = '';
				plugins.scavenger.participants = {};
				plugins.scavenger.finished = [];
				return this.sendReplyBox('Scavenger hunt reset.');
			},
			scavenger: 'scavengers',
			scavengers: function(target, room, user) {
				return this.parse('/join scavengers');
			},
			scavengerhint: function(target, room, user) {
				if (plugins.scavenger.status !== 'on') return this.sendReplyBox('There is no active scavenger hunt right now.');
				if (!plugins.scavenger.participants[user.userid]) return this.sendReplyBox('You are not participating in the current scavenger hunt.');
				if (plugins.scavenger.participants[user.userid].room >= 3) return this.sendReplyBox('You have already finished!');
				return this.sendReplyBox(
					'Your current hint: ' 
					+ plugins.scavenger[{0:'firstHint', 1:'secondHint', 2:'thirdHint'}[plugins.scavenger.participants[user.userid].room]]
					+ '. Type /scavenge [solution] to find out if you are right.'
				);
			},
			scavenge: function(target, room, user) {
				if (plugins.scavenger.status !== 'on') return this.sendReplyBox('There is no active scavenger hunt right now.');
				if (!plugins.scavenger.participants[user.userid]) return this.sendReplyBox('You are not participating in the current scavenger hunt.');
				if (plugins.scavenger.participants[user.userid].room >= 3) return this.sendReplyBox('You have already finished!');
				target = toId(target);
				var room = plugins.scavenger.participants[user.userid].room;
				if (plugins.scavenger[{0:'roomOne', 1:'roomTwo', 2:'roomThree'}[room]] === target) {
					plugins.scavenger.participants[user.userid].room++;
					room++;
					if (room < 3) {
						var currentHint = {1:'secondHint', 2:'thirdHint'};
						return this.sendReplyBox(
							'Well done! You have advanced to the next room! The next hint is: '
							+ plugins.scavenger[currentHint[room]]
						);
					} else {
						// User finished, let's check the result
						plugins.scavenger.finished.push(user.name);
						var winningPositions = {1:'winner', 2:'second', 3:'third'};
						var position = plugins.scavenger.finished.length;
						var result = 'The user ' + user.name + ' has finished the hunt! (S)he is the '
						+ ((winningPositions[position])? winningPositions[position] : position + 'th') + '!';
						if (Rooms.rooms.scavengers) Rooms.rooms.scavengers.add(
							'|raw|<div class="broadcast-blue"><strong>' + result + '</strong></div>'
						);
					}
				} else {
					return this.sendReplyBox('Fat luck - that is not the next room!');
				}
			},
			joinhunt: function(target, room, user) {
				if (plugins.scavenger.status !== 'on') return this.sendReplyBox('There is no active scavenger hunt right now.');
				if (plugins.scavenger.participants[user.userid]) return this.sendReplyBox('You are already participating in the current scavenger hunt.');
				plugins.scavenger.participants[user.userid] = {id: user.userid, room: 0};
				return this.sendReplyBox('You joined the scavenger hunt! Type /scavenge name to try to find the room and /scavengerhint to read your current hint.');
			},
			scavengerstatus: function(target, room, user) {
				if (plugins.scavenger.status !== 'on') return this.sendReplyBox('There is no active scavenger hunt right now.');
				if (!plugins.scavenger.participants[user.userid]) return this.sendReplyBox('You are not participating in the current scavenger hunt.');
				var currentHint = {0:'firstHint', 1:'secondHint', 2:'thirdHint'};
				var room = plugins.scavenger.participants[user.userid].room;
				return this.sendReplyBox(
					'Your current hunt status: You are in the room #' + room + ((room < 3)? '. Your current hint is '
					+ plugins.scavenger[currentHint[room]] : '. You have finished') + '.'
				);
			},
			scavengerhelp: function(target, room, user) {
				if (room.id !== 'scavengers') return;
				if (!this.canBroadcast()) return;
				this.sendReplyBox(
					'<strong>Player commands:</strong><br />' +
					'- /scavengers: Join the scavengers room<br />' +
					'- /joinhunt: Join the current hunt<br />' +
					'- /scavengerhint: Get your current hint<br />' +
					'- /scavengerstatus: Get your current game status<br />' +
					'- /scavenge <em>name</em>: Test the [name] to find a room<br />' +
					'<br />' +
					'<strong>Admin commands:</strong><br />' +
					'- /scavengerstarthunt <em>room one, hint, room two, hint, room three, hint</em>: Start a new hunt<br />' +
					'- /scavengerendhunt: Finish current hunt and announce winners<br />' +
					'- /scavengerresethunt: Reset the current hunt to mint status'
				);
			}
		}
	},
	hangman: {
		status: 'off',
		hint: '',
		word: '',
		guessedletters: [],
		correctletters: [],
		host: '',
		show: [],
		letters: [],
		guessesleft: 8,
		guessers: [],
		resethangman: function() {
			plugins.hangman.status = 'off';
			plugins.hangman.hint = '';
			plugins.hangman.word = '';
			plugins.hangman.guessedletters = [];
			plugins.hangman.correctletters = [];
			plugins.hangman.host = '';
			plugins.hangman.show = [];
			plugins.hangman.letters = [];
			plugins.hangman.guessesleft = 8;
			plugins.hangman.guessers = [];
		},
		commands: {
			hangman: function(target,room,user) {
				this.parse('/join hangman')
			},
			starthangman: function(target,room,user) {
				if (!user.can('broadcast', null, room)) return this.sendReplyBox('You do not have enough authority to do this.');
				if (room.id !== 'hangman') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (!target) return this.sendReplyBox('The correct syntax for this command is /starthangman [word], [topic]');
				if (plugins.hangman.status === 'off') {
					var targets = target.split(',');
					if(!targets[1]) return this.sendReplyBox('Make sure you include a hint.');
					if(targets[0].length > 10) return this.sendReplyBox('As there are only 8 given guesses, don\'t make the word longer than 10 letters.');
					if(targets[0].indexOf(' ') != -1) return this.sendReplyBox('Please don\'t put spaces in the word.');
					var word = targets[0].toLowerCase();
					plugins.hangman.status = 'on';
					plugins.hangman.hint = targets[1];
					plugins.hangman.word = word;
					plugins.hangman.host = user.userid;
					for (var s = 0; s < word.length; s++) {
						plugins.hangman.letters.push(word[s]);
						plugins.hangman.show.push('_');
					}
					return this.add('|html|<div class=infobox><div class="hangman"><font size=2><center>A new game of hangman has been started by <b>'+ user.name +'</b>. The word is made of '+ word.length +' letters<br><font size=3>'+ plugins.hangman.show +'</font><br><b>Hint:</b> '+ plugins.hangman.hint +'</div></div>');
				}
			},
			vh: 'viewhangman',
			viewhangman: function(target,room,user) {
				if (!this.canBroadcast()) return false;
				if (room.id !== 'hangman') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('There is no hangman going on ;)');
				this.sendReplyBox('|<div class=infobox><div class=hangman><font size=2>'+ plugins.hangman.show +'</font><br><b>Hint:</b> '+ plugins.hangman.hint +'<br><b>Guesses Left:</b> '+ plugins.hangman.guessesleft +'</div></div>');
			},
			changehint: 'edithint',
			edithint: function(target,room,user) {
				if (user.userid !== plugins.hangman.host) return this.sendReplyBox('You do not have enough authority to do this.');
				if (room.id !== 'hangman') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('there is no hangman going on ;)');
				if (!target) return this.sendReplyBox('The correct syntax for this command is /edithint [hint]');
				plugins.hangman.hint = target;
				this.sendReplyBox('You changed the hint to '+ plugins.hangman.hint);
				this.add('|html|The current hangman\'s hint has been changed<br><div class=infobox>'+ plugins.hangman.show +'<br><b>Hint:</b> '+ plugins.hangman.hint +'</div>');
			},
			guess: function(target,room,user) {
				if (!this.canTalk()) return false;
				if (room.id !== 'hangman') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('There is no hangman going on ;)');
				if (!target) return this.sendReplyBox('The correct syntax for this command is /guess [letter]');
				if (target.length > 1) return this.sendReplyBox('You can only guess one letter, do /guessword [word] to guess a word ;)');
				if (user.userid === plugins.hangman.host) return this.sendReplyBox('You cant guess because you are the one hosting hangman :P');
				var t = 0;
				for (var i=0;i<plugins.hangman.guessers.length;i++) {
				if (plugins.hangman.guessers[i] === user.userid){
					t += 1;
				}
				}
				if (t === 2) return this.sendReplyBox('You have aldready made 2 wrong guesses so aren\'t allowed to guess in this game');
					tlc = target.toLowerCase();
				for(var l = 0; l < 26;l++) {
					if(tlc === plugins.hangman.guessedletters[l]) {
						return this.sendReplyBox('Someone has already guessed the letter \'' + tlc + '\'.');
					}
				}
				var sl = [];
				for(var i = 0;i < plugins.hangman.word.length;i++) {
					if(tlc === plugins.hangman.letters[a]) {
						var temp = i + 1;
						sl.push(temp);
						plugins.hangman.correctletters.push(temp);
						plugins.hangman.show[i] = tlc;
					}
				}
				if(sl[0] === undefined) {
					plugins.hangman.givenguesses = plugins.hangman.givenguesses - 1;
						if(plugins.hangman.givenguesses === 0) {
							plugins.hangman.resethangman();
							return this.add('|html|<b>' + user.name + '</b> guessed the letter \'' + tlc + '\', but it was not in the word. You have failed to guess the word, so the man has been hanged.');
						}
					this.add('|html|<b>' + user.name + '</b> guessed the letter \'' + tlc + '\', but it was not in the word.');
					plugins.hangman.guessers.push(user.userid);
				} else {
					this.add('|html|<b>' + user.name + '</b> guessed the letter \'' + tlc + '\', which was ' + sl.toString() + ' letter(s) of the word.');
				}
				plugins.hangman.guessedletters.push(tlc);
				if(plugins.hangman.correctletters.length === plugins.hangman.word.length) {
					this.add('|html|The word was guessed, which was: \'' + plugins.hangman.word + '\'. Congrats to all!');
					plugins.hangman.resethangman();
				}	
			},
			guessword: function(target,room,user) {
				if (!this.canTalk()) return false;
				if (room.id !== 'hangman') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('there is no hangman going on ;)');
				if (!target) return this.sendReplyBox('The correct syntax for this command is /guess [letter]');
				if (target.length > 10) return this.sendReplyBox('Try a shorter guess, that one is too long');
				if (user.userid === plugins.hangman.host) return this.sendReplyBox('You cant guess cause you are the one hosting hangman :P');
				var t = 0;
				for (var i=0;i<plugins.hangman.guessers.length;i++) {
				if (plugins.hangman.guessers[i] === user.userid){
					t += 1;
				}
				}
				if (t === 2) return this.sendReplyBox('You have aldready made 2 wrong guesses so aren\'t allowed to guess in this game');
				var tlc = target.toLowerCase();
				if (tlc === plugins.hangman.word) {
					this.add('|html|<b>'+ user.name +'</b> has guessed the word <b>'+ tlc +'</b>. Congrats!');
					plugins.hangman.resethangman();
				} else {
					this.add('|html|<b>'+ user.name +'</b> has guessed the word <b>'+ tlc +'</b>, But it was not the word :(');
					plugins.hangman.guessesleft -= 1;
					plugins.hangman.guessers.push(user.userid);
				}
				if(plugins.hangman.givenguesses === 0) {
						plugins.hangman.resethangman();
						return this.add('|html|<b>'+ user.name +'</b> guessed the word \'' + tlc + '\', but it was not the word. You have failed to guess the word, so the man has been hanged.');
				}
			},
			endhangman: function(target,room,user) {
				if (!user.can('broadcast', null, room)) return this.sendReplyBox('You do not have enough authority to do this.');
				if (room.id !== 'hangman') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status === 'off') return this.sendReplyBox('No Hangman is going on');
				plugins.hangman.resethangman();
				this.add('|html|<font size=2><b>'+ user.name +'</b> has forcibily ended the hangman.');
			},
			hangmanhelp: function(target,room,user) {
				if (!this.canBroadcast()) return;
				this.sendReplyBox('<b>Player Help</b><br>' +
						  '<b>/hangman</b> - Takes you to the hangman room<br>' +
						  '<b>/viewhangman</b> - Shows the current state of hangman in the room.<br>' +
						  '<b>/guess [letter]</b> - Lets you guess a letter<br>' +
						  '<b>/guessword [word]</b> - Lets you guess a word<br><br>' +
						  '<b>Admin Help</b><br>' +
						  '<b>/starthangman [word],[hint]</b> - Starts a game of hangman. (Word has to be less than 10 charecters long) Requires: +<br>' +
						  '<b>/endhangman</b> - Ends the current game of hangman. Requires +<br>' +
						  '<b>/changehint</b> - Changes the hint of the current hangman. Requires you to be the host (the one who started the game)');
			}
		}
	}

};
