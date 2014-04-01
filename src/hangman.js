exports.hangman = function(hang) {
	if (typeof hang != 'undefined') var hangman = hang; else var hangman = new Object();
	var basic = {
		reset: function(rid) {
			hangman[rid]: {
				word: new Array(),
				host: new Array(),
				guesses: 8,
				hangman: true,
				guessletters: new Array();
				guessedletters: new Array();
				guessedwords: new Array();
				correctletters: new Array();
				underscores: new Array();
				clue: new Array;
			}
		}
	}
	cmds = {
		hangman: function(target,room,user) {
		if (room.id !== 'hangman') return this.sendReplyBox('onnly in the hangman room :)');
		if (!this.can('broadcast')) return false;
		if (!target) return this.sendReply('/hangman word,clue - starts hangman');
		var targets = target.split(',');
		if (targets[0].length > 8) return this.sendReply('only 8 guesses are given so try to make the word shorter');
		if(targets[0].indexOf(' ') != -1) {
		return this.sendReply('Please don\'t put spaces in the word.');
		}
		hangman.reset(room.id);
		hangman[room.id].hangman = true;
		hangman[room.id].host.push(user.userid);
		word = targets[0].toLowerCase();
		hangman[room.id].word.push(word);
		for(var i = 0; i < targets[0].length; i++) {
				hangman[room.id].guessletters.push(word[i]);
				hangman[room.id].underscores.push('_');
				hangman[room.id].clue[0] = targets[1];
			}
		this.add('|html|<div class=infobox style="background: #00f"><center><font size = 3><b>Hangman!</font><font size=2>Letters: ' + targets[0].length +'</center><center>'+ hangman[room.id].spaces.join(" ") + '<br>The clue: ' + hangman[room.id].hangmantopic[0] + '</font></center></div></div>')
		}
	}
};	
