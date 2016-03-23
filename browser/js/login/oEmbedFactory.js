app.factory('oEmbedFactory', function(){
	return {
		embedSong: function(sub) {
	        return SC.oEmbed("http://api.soundcloud.com/tracks/" + sub.trackID, {
	          element: document.getElementById(sub.trackID + "player"),
	          auto_play: false,
	          maxheight: 150
	        });
		}
	};
});