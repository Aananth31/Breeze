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
var exec = require('child_process').exec;
var url = require('url');

var plugins = exports.plugins = {
	/**
	 * Scavenger hunts plugin.
	 * This game is meant to show a first hint. Players will find the name of a room with that hint.
	 * When you find a room, it gives you a hint for the next room.
	 * You finish upon reaching the third room.
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
			scavengerstarthunt: function (target, room, user) {
				if (!this.can('scavengers', room)) return false;
				if (room.id !== 'lobby') return this.sendReplyBox('You can only start scavenger hunts on Scavengers room.');
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
				if (Rooms.rooms.lobby) Rooms.rooms.lobby.add(
					'|raw|<div class="char"><strong>A new Scavenger Hunt has been started!'
					+ ' The first hint is: ' + plugins.scavenger.firstHint + '</strong></div>'
				);
				return this.sendReplyBox('Scavenger hunt started.');
			},
			scavengerendhunt: function (target, room, user) {
				if (!this.can('scavengers', room)) return false;
				if (room.id !== 'lobby') return this.sendReplyBox('You can only end scavenger hunts on Scavengers room.');
				if (plugins.scavenger.status !== 'on') return this.sendReplyBox('There is no active scavenger hunt.');
				var result = '';
				var winner = plugins.scavenger.finished[0];
				var second = plugins.scavenger.finished[1];
				var third = plugins.scavenger.finished[2];
				var consolation = plugins.scavenger.finished.slice(3);
				result += '<strong>Winner of Scavenger Hunt: ' + Tools.escapeHTML(winner || 'no one') + '.';
				result += '</strong> Second place: ' + Tools.escapeHTML(second || 'no one') + '.';
				result += ' Third place: ' + Tools.escapeHTML(third || 'no one') + '.';
				result += ' Consolation prize to: ' + Tools.escapeHTML(consolation.join(', ') || 'no one') + '.';
				result += '<br />Solution: ' + plugins.scavenger.roomOne + ', ' 
				+ plugins.scavenger.roomTwo + ', ' + plugins.scavenger.roomThree + '.';
				if (Rooms.rooms.lobby) Rooms.rooms.lobby.add('|raw|<div class="broadcast-blue"><strong>' + result + '</strong></div>');
				this.parse('/scavengerresethunt');
				return this.sendReplyBox('Scavenger hunt finished.');
			},
			scavengerresethunt: function (target, room, user) {
				if (!this.can('scavengers', room)) return false;
				if (room.id !== 'lobby') return this.sendReplyBox('You can only reset scavenger hunts on Scavengers room.');
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
			scavengers: function (target, room, user) {
				return this.parse('/join lobby');
			},
			scavengerhint: function (target, room, user) {
				if (plugins.scavenger.status !== 'on') return this.sendReplyBox('There is no active scavenger hunt right now.');
				if (!plugins.scavenger.participants[user.userid]) return this.sendReplyBox('You are not participating in the current scavenger hunt.');
				if (plugins.scavenger.participants[user.userid].room >= 3) return this.sendReplyBox('You have already finished!');
				return this.sendReplyBox(
					'Your current hint: ' 
					+ plugins.scavenger[{0:'firstHint', 1:'secondHint', 2:'thirdHint'}[plugins.scavenger.participants[user.userid].room]]
					+ '. Type /scavenge [solution] to find out if you are right.'
				);
			},
			scavenge: function (target, room, user) {
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
						var result = 'The user ' + Tools.escapeHTML(user.name) + ' has finished the hunt! (S)he is the '
						+ ((winningPositions[position])? winningPositions[position] : position + 'th') + '!';
						if (Rooms.rooms.lobby) Rooms.rooms.lobby.add(
							'|raw|<div class="broadcast-blue"><strong>' + result + '</strong></div>'
						);
					}
				} else {
					return this.sendReplyBox('Fat luck - that is not the next room!');
				}
			},
			joinhunt: function (target, room, user) {
				if (plugins.scavenger.status !== 'on') return this.sendReplyBox('There is no active scavenger hunt right now.');
				if (plugins.scavenger.participants[user.userid]) return this.sendReplyBox('You are already participating in the current scavenger hunt.');
				plugins.scavenger.participants[user.userid] = {id: user.userid, room: 0};
				return this.sendReplyBox('You joined the scavenger hunt! Type /scavenge name to try to find the room and /scavengerhint to read your current hint.');
			},
			scavengerstatus: function (target, room, user) {
				if (plugins.scavenger.status !== 'on') return this.sendReplyBox('There is no active scavenger hunt right now.');
				if (!plugins.scavenger.participants[user.userid]) return this.sendReplyBox('You are not participating in the current scavenger hunt.');
				var currentHint = {0:'firstHint', 1:'secondHint', 2:'thirdHint'};
				var room = plugins.scavenger.participants[user.userid].room;
				return this.sendReplyBox(
					'Your current hunt status: You are in the room #' + room + ((room < 3)? '. Your current hint is '
					+ plugins.scavenger[currentHint[room]] : '. You have finished') + '.'
				);
			},
			scavengerhelp: function (target, room, user) {
				if (room.id !== 'lobby') return;
				if (!this.canBroadcast()) return;
				this.sendReplyBox(
					'<strong>Player commands:</strong><br />' +
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
				this.parse('/join lobby')
			},
			starthangman: function(target,room,user) {
				if (!user.can('broadcast', null, room)) return this.sendReplyBox('You do not have enough authority to do this.');
				if (room.id !== 'lobby') return this.sendReplyBox('Only in the hangman room');
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
					return this.add('|html|<div class=char><font size=2><center>A new game of hangman has been started by <b>'+ user.name +'</b>. The word is made of '+ word.length +' letters<br><font size=3>'+ plugins.hangman.show +'</font><br><b>Hint:</b> '+ plugins.hangman.hint +'</div></div>');
				}
			},
			vh: 'viewhangman',
			viewhangman: function(target,room,user) {
				if (!this.canBroadcast()) return false;
				if (room.id !== 'lobby') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('There is no hangman going on ;)');
				this.sendReplyBox('|<div class=infobox><div class=hangman><font size=2>'+ plugins.hangman.show +'</font><br><b>Hint:</b> '+ plugins.hangman.hint +'<br><b>Guesses Left:</b> '+ plugins.hangman.guessesleft +'</div></div>');
			},
			changehint: 'edithint',
			edithint: function(target,room,user) {
				if (user.userid !== plugins.hangman.host) return this.sendReplyBox('You do not have enough authority to do this.');
				if (room.id !== 'lobby') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('there is no hangman going on ;)');
				if (!target) return this.sendReplyBox('The correct syntax for this command is /edithint [hint]');
				plugins.hangman.hint = target;
				this.sendReplyBox('You changed the hint to '+ plugins.hangman.hint);
				this.add('|html|The current hangman\'s hint has been changed<br><div class=infobox>'+ plugins.hangman.show +'<br><b>Hint:</b> '+ plugins.hangman.hint +'</div>');
			},
			guess: function(target,room,user) {
				if (!this.canTalk()) return false;
				if (room.id !== 'lobby') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('There is no hangman going on ;)');
				if (!target) return this.sendReplyBox('The correct syntax for this command is /guess [letter]');
				if (target.length > 1) return this.sendReplyBox('You can only guess one letter, do /guessword [word] to guess a word ;)');
				if (user.userid === plugins.hangman.host) return this.sendReplyBox('You cant guess because you are the one hosting hangman :P');
					tlc = target.toLowerCase();
				for(var l = 0; l < 26;l++) {
					if(tlc === plugins.hangman.guessedletters[l]) {
						return this.sendReplyBox('Someone has already guessed the letter \'' + tlc + '\'.');
					}
				}
				var sl = [];
				for(var i = 0;i < plugins.hangman.word.length;i++) {
					if(tlc === plugins.hangman.letters[i]) {
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
				if (room.id !== 'lobby') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status !== 'on') return this.sendReplyBox('there is no hangman going on ;)');
				if (!target) return this.sendReplyBox('The correct syntax for this command is /guess [letter]');
				if (target.length > 10) return this.sendReplyBox('Try a shorter guess, that one is too long');
				if (user.userid === plugins.hangman.host) return this.sendReplyBox('You cant guess cause you are the one hosting hangman :P');
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
				if (room.id !== 'lobby') return this.sendReplyBox('Only in the hangman room');
				if (room.type !== 'chat') return this.sendReplyBox('Only in chatrooms');
				if (plugins.hangman.status === 'off') return this.sendReplyBox('No Hangman is going on');
				plugins.hangman.resethangman();
				this.add('|html|<font size=2><b>'+ user.name +'</b> has forcibily ended the hangman.');
			},
			hangmanhelp: function(target,room,user) {
				if (!this.canBroadcast()) return;
				this.sendReplyBox('<b>Player Help</b><br>' +
						  '<b>/viewhangman</b> - Shows the current state of hangman in the room.<br>' +
						  '<b>/guess [letter]</b> - Lets you guess a letter<br>' +
						  '<b>/guessword [word]</b> - Lets you guess a word<br><br>' +
						  '<b>Admin Help</b><br>' +
						  '<b>/starthangman [word],[hint]</b> - Starts a game of hangman. (Word has to be less than 10 charecters long) Requires: +<br>' +
						  '<b>/endhangman</b> - Ends the current game of hangman. Requires +<br>' +
						  '<b>/changehint</b> - Changes the hint of the current hangman. Requires you to be the host (the one who started the game)');
			}
		}
	},
	
	trivia: {
	/** Trivia plugin
	*Requires a room named "Trivia"
	*/
		status: 'off',
		variable: undefined,
		QNo: undefined,
		answer: undefined,
		question: undefined,
		timer: undefined,

		functions: {
			reset: function() {	
				plugins.trivia.status = 'off';
				plugins.trivia.variable = undefined;
				plugins.trivia.QNo = undefined;
				plugins.trivia.answer = undefined;
				plugins.trivia.question = undefined;
				plugins.trivia.timer = undefined;
				plugins.trivia.checker = undefined;
			},
			readScore: function(user) {
				var data = fs.readFileSync('config/trivia.csv', 'utf8');
				var row = (''+data).split("\n");
				for (var i = row.length; i > -1; i--) {
					if (!row[i]) continue;
					var parts = row[i].split(",");
					var userid = toId(parts[0]);
					if (user.userid == userid) {
						var x = Number(parts[1]);
						var score = x;
					}
				}
				if (score) {
					return score;
				} else {
					return false;
				}
			},
			writeScore: function(user,scorewon) {
				var data = fs.readFileSync('config/trivia.csv', 'utf8');
				var match = false;
				var score = 0;
				var row = (''+data).split("\n");
				var line = '';
				for (var i = row.length; i > -1; i--) {
					if (!row[i]) continue;
					var parts = row[i].split(",");
					var userid = toId(parts[0]);
					if (user.userid == userid) {
						var x = Number(parts[1]);
						var score = x;
						match = true;
						if (match === true) {
							line = line + row[i];
							break;
						}
					}
				}
				user.score = score;
				user.score = user.score + scorewon;
				if (match === true) {
					var re = new RegExp(line,"g");
					fs.readFile('config/trivia.csv', 'utf8', function (err,data) {
					if (err) {
						return console.log(err);
					}
					var result = data.replace(re, user.userid+','+user.score);
					fs.writeFile('config/trivia.csv', result, 'utf8', function (err) {
						if (err) return console.log(err);
					});
					});
				} else {
					var log = fs.createWriteStream('config/trivia.csv', {'flags': 'a'});
					log.write("\n"+user.userid+','+user.score);
				}
			},
			importQuestions: function(file_url) {
				var DOWNLOAD_DIR = 'config/';
				// extract the file name
				var file_name = url.parse(file_url).pathname.split('/').pop();
				// compose the wget command
				var wget = 'wget -P ' + DOWNLOAD_DIR + ' ' + file_url;
				// excute wget using child_process' exec function

				var child = exec(wget, function(err, stdout, stderr) {
					if (err) throw err;
					else console.log(file_name + ' downloaded to ' + DOWNLOAD_DIR);
				});
				if(fs.existsSync('config/triviaQA.csv')) {
					fs.unlinkSync('config/triviaQA.csv');
				}
				setTimeout(function(){fs.renameSync('config/'+file_name,'config/triviaQA.csv');},2000);	
			},
			readQuestions: function() {
				var data = fs.appendFileSync('config/trivia.csv','utf8');
				var row = (''+data).split("\n");
				var buf = ''
				for (var i=0;i < row.length;i++) {
					if (!row[i]) continue;
					var rowNo = i + 1;
					var parts = row[i].split(',');
					if (row[i] !== ' ') {
						buf += rowNo+'. Question: '+parts[0]+' Answer: '+parts[1]+'<br>';
					}
				}
				return buf;
			},
			getRandomQuestion: function() {
				var data = fs.readFileSync('./config/triviaQA.csv');
				var row = (''+data).split("\n");
				var randomness = Math.floor(Math.random()*row.length);
				var parts = row[randomness].split(",");
				plugins.trivia.question = parts[0];
				plugins.trivia.QNo = randomness;
				plugins.trivia.answer = parts[2];
				plugins.trivia.value = parts[1];
				return;
			}
		},
		commands: {
			trivia: function(target,room,user) {
				if (room.id !== 'trivia') return this.sendReplyBox('This command can only be used in the trivia room.');
				var tlc = target.toLowerCase().split(',');
				var targets = target.split(',');
				if (tlc[0] === 'importquestions') {
					if(!this.can('roomdesc')) return this.sendReplyBox('You dont have permissions to use this command');
					if(!targets[1]) return this.sendReplyBox('/trivia importquestions,<em>url</em>.URL must be the download link.');
					plugins.trivia.functions.importQuestions(tlc[1]);
					return this.sendReplyBox('Your questions have been updated');
				}
				else if (tlc[0] === 'new') {
					if(!this.can('broadcast',null,room) && tlc[1] !== 'guess') return this.sendReplyBox('You dont have permissions to use this command');
					if(plugins.trivia.status === 'on') return this.sendReplyBox('There is aldready a trivia game going on');
					if (tlc[1] === 'random') {
						plugins.trivia.functions.getRandomQuestion();
						plugins.trivia.status = 'on';
						return this.add('|html|<div class=broadcast-blue><b>A new trivia game has been started.<br>Points: '+plugins.trivia.value+'<br>Quesion: '+plugins.trivia.question+'. <code>/trivia guess,<i>guess</i></code> to guess.');
					}
					if (tlc[1] === 'randomtimer') {
						plugins.trivia.functions.getRandomQuestion();
							if (isNaN(tlc[2])) {
								return this.sendReply('Very funny, now use a real number.');
	    					}
						plugins.trivia.status = 'on';
						plugins.trivia.timer = setInterval(function(){plugins.trivia.value -= tlc[2]},1000);
						return this.add('|html|<div class=broadcast-blue><b>A new timed trivia game has been started.<br>Points: '+plugins.trivia.value+'<br>Question: '+plugins.trivia.question+'.<br> You would be losing '+tlc[2]+' points per second. <code>/trivia guess,<i>guess</i></code> to guess.');
					}
				}
				else if (tlc[0] === 'guess') {
					if (!this.canTalk()) return this.sendReplyBox('You dont have permissions to use this command');
					if (plugins.trivia.status === 'off') return this.sendReplyBox('There is no trivia game going on');
					var tid = toId(targets[1]);
					var aid = toId(plugins.trivia.answer);
					if (tid === aid) {
						if (plugins.trivia.timer) {
							clearTimer = function(){
								clearInterval(plugins.trivia.timer);
							}
						}
						if(plugins.trivia.value < 1) plugins.trivia.value = 1;
						plugins.trivia.functions.writeScore(user,plugins.trivia.value);
						this.add('|html|User '+user.name+' has successfully completed the trivia game. Congratz!<br>(S)He is also rewarded '+plugins.trivia.value+' points for doing so.');
						return plugins.trivia.functions.reset();
					} else {
						return this.sendReplyBox('Hard Luck! Your guess was wrong.');
					}
				}
				else if (tlc[0] === 'score') {
					if(!this.canBroadcast()) return;
					if(!targets[1]) return this.sendReplyBox('/trivia score,user - Shows the score of <i>User</i>');
					var user = Users.get(toId(targets[1]));
					var score = plugins.trivia.functions.readScore(user);
					if(score !== false) {
					return this.sendReplyBox(user.name+'\'s Trivia Score is '+score);
					} else {
						return this.sendReplyBox(user.name+' hasn\'t won any trivia games.')
					}
				}
				else if	(tlc[0] === 'help') {
					if (!this.canBroadcast()) return;
					return this.sendReplyBox('<b><u><center>Trivia Help</center></u></b><br><br>'+
							  '<code>-/trivia new,random</code> Creates a random trivia game from the databse. Requires +<br>'+
							  '<code>-/trivia new,randomtimer,[points lost per second]</code> Creates a random timed trivia game from the databse. Requires +<br>'+
							  '<code>-/trivia guess,option</code> Guesses the answer for the current trivia game.<br>'+
							  '<code>-/trivia score,username</code> Shows the score of username<br>'+
							  '<code>-/trivia importquestions url</code>. Imports and updates the databse. Please dont use this command if you dont know where you are going (<a href=http://goo.gl/B7V55v>Guide</a>). Requires: #');
				} else {
				this.parse('/trivia help');
				}
			}
		}
	}
};
