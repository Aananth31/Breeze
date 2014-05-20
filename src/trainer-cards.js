var cmds = {

        chaarizard: 'char',
        charizard: 'char',
        char: function(target,room,user) {
        	if (!this.canBroadcast()) return;
        	this.sendReply('|html|<div class="char"><center><img src=http://play.pokemonshowdown.com/sprites/xyani/charizard-mega-x.gif height=125><img src=http://i.imgur.com/j1hggX6.png height=90><img src=http://play.pokemonshowdown.com/sprites/xyani/charizard-mega-y.gif height=150></center><br><font size=2><center><font color=red><b>Quote:</b></font> Nobody is perfetc</center></font></div>');
        },

};

for (var i in cmds) CommandParser.commands[i] = cmds[i];
