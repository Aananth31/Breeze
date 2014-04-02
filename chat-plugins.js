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
				if (room.id !== 'scavengers') return this.sendReply('You can only start scavenger hunts on Scavengers room.');
				if (plugins.scavenger.status === 'on') return this.sendReply('There is already an active scavenger hunt.');
				var targets = target.split(',');
				if (!targets[0] || !targets[1] || !targets[2] || !targets[3] || !targets[4] || !targets[5])
					return this.sendReply('You need to add three rooms and three hints in a [room, hint,] format.');
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
				return this.sendReply('Scavenger hunt started.');
			},
			scavengerendhunt: function(target, room, user) {
				if (!this.can('ban', null, room)) return false;
				if (room.id !== 'scavengers') return this.sendReply('You can only end scavenger hunts on Scavengers room.');
				if (plugins.scavenger.status !== 'on') return this.sendReply('There is no active scavenger hunt.');
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
				return this.sendReply('Scavenger hunt finished.');
			},
			scavengerresethunt: function(target, room, user) {
				if (!this.can('ban', null, room)) return false;
				if (room.id !== 'scavengers') return this.sendReply('You can only reset scavenger hunts on Scavengers room.');
				plugins.scavenger.status = 'off';
				plugins.scavenger.roomOne = '';
				plugins.scavenger.roomTwo = '';
				plugins.scavenger.roomThree = '';
				plugins.scavenger.firstHint = '';
				plugins.scavenger.secondHint = '';
				plugins.scavenger.thirdHint = '';
				plugins.scavenger.participants = {};
				plugins.scavenger.finished = [];
				return this.sendReply('Scavenger hunt reset.');
			},
			scavenger: 'scavengers',
			scavengers: function(target, room, user) {
				return this.parse('/join scavengers');
			},
			scavengerhint: function(target, room, user) {
				if (plugins.scavenger.status !== 'on') return this.sendReply('There is no active scavenger hunt right now.');
				if (!plugins.scavenger.participants[user.userid]) return this.sendReply('You are not participating in the current scavenger hunt.');
				if (plugins.scavenger.participants[user.userid].room >= 3) return this.sendReply('You have already finished!');
				return this.sendReply(
					'Your current hint: ' 
					+ plugins.scavenger[{0:'firstHint', 1:'secondHint', 2:'thirdHint'}[plugins.scavenger.participants[user.userid].room]]
					+ '. Type /scavenge [solution] to find out if you are right.'
				);
			},
			scavenge: function(target, room, user) {
				if (plugins.scavenger.status !== 'on') return this.sendReply('There is no active scavenger hunt right now.');
				if (!plugins.scavenger.participants[user.userid]) return this.sendReply('You are not participating in the current scavenger hunt.');
				if (plugins.scavenger.participants[user.userid].room >= 3) return this.sendReply('You have already finished!');
				target = toId(target);
				var room = plugins.scavenger.participants[user.userid].room;
				if (plugins.scavenger[{0:'roomOne', 1:'roomTwo', 2:'roomThree'}[room]] === target) {
					plugins.scavenger.participants[user.userid].room++;
					room++;
					if (room < 3) {
						var currentHint = {1:'secondHint', 2:'thirdHint'};
						return this.sendReply(
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
					return this.sendReply('Fat luck - that is not the next room!');
				}
			},
			joinhunt: function(target, room, user) {
				if (plugins.scavenger.status !== 'on') return this.sendReply('There is no active scavenger hunt right now.');
				if (plugins.scavenger.participants[user.userid]) return this.sendReply('You are already participating in the current scavenger hunt.');
				plugins.scavenger.participants[user.userid] = {id: user.userid, room: 0};
				return this.sendReply('You joined the scavenger hunt! Type /scavenge name to try to find the room and /scavengerhint to read your current hint.');
			},
			scavengerstatus: function(target, room, user) {
				if (plugins.scavenger.status !== 'on') return this.sendReply('There is no active scavenger hunt right now.');
				if (!plugins.scavenger.participants[user.userid]) return this.sendReply('You are not participating in the current scavenger hunt.');
				var currentHint = {0:'firstHint', 1:'secondHint', 2:'thirdHint'};
				var room = plugins.scavenger.participants[user.userid].room;
				return this.sendReply(
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
		guessedletters: new Array(),
		correctletters: new Array(),
		host: '',
		show: new Array(),
		letters: new Array(),
		guessesleft: 8,
		resethangman: function() {
			plugins.hangman.status = 'off';
			plugins.hangman.hint = '';
			plugins.hangman.word = '';
			plugins.hangman.guessedletters = new Array();
			plugins.hangman.correctletters = new Array();
			plugins.hangman.host = '';
			plugins.hangman.show = new Array();
			plugins.hangman.letters = new Array();
			plugins.hangman.guessesleft = 8;
		},
		commands: {
			hangman: function(target,room,user) {
				this.parse('/join hangman')
			},
			starthangman: function(target,room,user) {
				if (!user.can('broadcast', null, room)) return this.sendReply('You do not have enough authority to do this.');
				if (room.id !== 'hangman') return this.sndReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (!target) return this.sendReply('The correct syntax for this command is /starthangman [word], [topic]');
				if (plugins.hangman.status === 'off') {
					var targets = target.split(',');
					if(!targets[1]) return this.sendReply('Make sure you include a hint.');
					if(targets[0].length > 10) return this.sendReply('As there are only 8 given guesses, don\'t make the word too long.');
					if(targets[0].indexOf(' ') != -1) return this.sendReply('Please don\'t put spaces in the word.');
					var word = targets[0].toLowerCase();
					plugins.hangman.status = 'on';
					plugins.hangman.hint = targets[1];
					plugins.hangman.word = word;
					plugins.hangman.host = user.userid;
					for (var s = 0; s < word.length; s++) {
						plugins.hangman.letters.push(word[s]);
						plugins.hangman.show.push('_');
					}
					return this.add('|html|<div class=infobox><div class=broadcast-red><font size=2><center>A new game of hangman has been started by <b>'+ user.name +'</b>. The word is made of '+ word.length +' letters<br><font size=3>'+ plugins.hangman.show +'</font><br><b>Hint:</b> '+ plugins.hangman.hint +'</div></div>');
				}
			},
			vh: 'viewhangman',
			viewhangman: function(target,room,user) {
				if (!this.canBroadcast()) return false;
				if (room.id !== 'hangman') return this.sndReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('there is no hangman going on ;)');
				this.sendReply('|html|<div class=infobox>'+ plugins.hangman.show +'<br><b>Hint:</b> '+ plugins.hangman.hint +'<br><b>Guesses Left:</b> '+ plugins.hangman.guessesleft +'</div>');
			},
			changehint: 'edithint',
			edithint: function(target,room,user) {
				if (!user.can('broadcast', null, room)) return this.sendReply('You do not have enough authority to do this.');
				if (room.id !== 'hangman') return this.sndReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('there is no hangman going on ;)');
				if (!target) return this.sendReply('The correct syntax for this command is /edithint [hint]');
				plugins.hangman.hint = target;
				this.sendReplyBox('You changed the hint to '+ plugins.hangman.hint);
				this.add('|html|The current hangman\'s hint has been changed<br><div class=infobox>'+ plugins.hangman.show +'<br><b>Hint:</b> '+ plugins.hangman.hint +'</div>');
			},
			guess: function(target,room,user) {
				if (!this.canTalk()) return false;
				if (room.id !== 'hangman') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('there is no hangman going on ;)');
				if (!target) return this.sendReply('The correct syntax for this command is /guess [letter]');
				if (target.length > 1) return this.sendReplyBox('You can only guess one letter, do /guessword [word] to guess a word ;)');
				if (user.userid === plugins.hangman.host) return this.sendReplyBox('You cant guess cause you are the one hosting hangman :P');
					tlc = target.toLowerCase();
			for(var y = 0; y < 27; y++) {
				if(tlc === plugins.hangman.guessedletters[y]) {
					return this.sendReply('Someone has already guessed the letter \'' + tlc + '\'.');
				}
			}
			var letterright = new Array();
			for(var a = 0; a < plugins.hangman.word.length; a++) {
				if(tlc === plugins.hangman.letters[a]) {
					var c = a + 1;
					letterright.push(c);
					plugins.hangman.correctletters.push(c);
					plugins.hangman.show[a] = tlc;
				}
			}
			if(letterright[0] === undefined) {
				plugins.hangman.givenguesses = plugins.hangman.givenguesses - 1;
					if(plugins.hangman.givenguesses === 0) {
						plugins.hangman.resethangman();
						return this.add('|html|<b>' + user.name + '</b> guessed the letter \'' + tlc + '\', but it was not in the word. You have failed to guess the word, so the man has been hanged.');
					}
				this.add('|html|<b>' + user.name + '</b> guessed the letter \'' + tlc + '\', but it was not in the word.');
			} else {
				this.add('|html|<b>' + user.name + '</b> guessed the letter \'' + tlc + '\', which was letter(s) ' + letterright.toString() + ' of the word.');
			}
			plugins.hangman.guessedletters.push(tlc);
			if(plugins.hangman.correctletters.length === plugins.hangman.word.length) {
				this.add('|html|Congratulations! You has guessed the word, which was: \'' + plugins.hangman.word + '\'. Congrats to all C:');
				plugins.hangman.resethangman();
			}	
			},
			guessword: function(target,room,user) {
				if (!this.canTalk()) return false;
				if (room.id !== 'hangman') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('there is no hangman going on ;)');
				if (!target) return this.sendReply('The correct syntax for this command is /guess [letter]');
				if (target.length > 10) return this.sendReplyBox('Hmm I dont think the word is more than 10 charecters long, dont waste your guesses ;)');
				if (user.userid === plugins.hangman.host) return this.sendReplyBox('You cant guess cause you are the one hosting hangman :P');
				var tlc = target.toLowerCase();
				if (tlc === plugins.hangman.word) {
					this.add('|html|<b>'+ user.name +' has guessed the word <b>'+ tlc +'</b>. Congrats to him/her');
					plugins.hangman.resethangman();
				} else {
					this.add('|html|<b>'+ user.name +' has guessed the word <b>'+ tlc +'</b>, But it was not the word :(');
					plugins.hangman.guessesleft -= 1;
				}
			},
			endhangman: function(target,room,user) {
				if (!user.can('broadcast', null, room)) return this.sendReply('You do not have enough authority to do this.');
				if (room.id !== 'hangman') return this.sndReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status === 'off') return this.sendReplyBox('No Hangman is going on');
				plugins.hangman.resethangman();
				this.add('|html|<font size=2><b>'+ user.name +'</b> has ended the hangman.');
			},
		},
	}
			
};
	


