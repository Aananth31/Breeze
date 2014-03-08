var cmds = {
	   e4desher: 'desher',
   iamdesher: 'desher',
   desher: function(target,room,user) {
		if(!this.canBroadcast()) return;
		this.sendReply('|html|<center><img src=http://i.imgur.com/TeHZZw7.png>');
},
    megaeevee: 'megaeeveex',
    megaeeveex: function(target,room,user) {
		if(!this.canBroadcast()) return;
		this.sendReply('|html|<center><img src=http://pokecharms.com/data/attachment-files/2014/02/56613_trainercard-Mega_Eevee_X.png>');
},
  aananth: function(target, room, user) {
	    	if (!this.canBroadcast()) return;
	    	this.sendReplyBox('<center><img src=http://play.pokemonshowdown.com/sprites/xyani/charizard-mega-x.gif width="150" length="150"><img src=http://i.imgur.com/afSRAAO.png width="250"><img src=http://play.pokemonshowdown.com/sprites/xyani/charizard-mega-y.gif img width="150" length="150"></center>');
},

};

for (var i in cmds) CommandParser.commands[i] = cmds[i];