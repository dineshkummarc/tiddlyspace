(function(module, $) {

var _getTaggedTiddlers;
var taggedTiddlers = [];

module("TiddlySpaceFollowing", {
	setup: function() {
		taggedTiddlers = [];
		_getTaggedTiddlers = store.getTaggedTiddlers;
		store.getTaggedTiddlers = function() {
			return taggedTiddlers;
		};
	},
	teardown: function() {
		taggedTiddlers = [];
		store.getTaggedTiddlers = _getTaggedTiddlers;
	}
});


test("_constructBagQuery", function() {
	var followMacro = config.macros.followTiddlers;
	// where foo is the current space..
	var actual = [];
	actual.push(followMacro._constructBagQuery(["foo"]));
	actual.push(followMacro._constructBagQuery(["foo", "bar", "dum"]));
	actual.push(followMacro._constructBagQuery([]));
	same(actual, [false, "(bag:bar_public%20OR%20bag:dum_public)", false]);
});

test("getFollowers (local version)", function() {
	var followMacro = config.macros.followTiddlers;
	var passedTest = false;
	var callback = function(list) {
		if(list.length == 3) {
			passedTest = true;
		}
	};
	var tiddler = new Tiddler("jon");
	tiddler.tags = [followMacro.followTag];
	taggedTiddlers.push(tiddler);
	tiddler = new Tiddler("bob");
	tiddler.tags = [followMacro.followTag];
	taggedTiddlers.push(tiddler);
	tiddler = new Tiddler("fnd");
	tiddler.tags = [followMacro.followTag];
	taggedTiddlers.push(tiddler);
	followMacro.getFollowers(callback, "foo"); // where foo is the current space
	strictEqual(passedTest, true);
});

})(QUnit.module, jQuery);