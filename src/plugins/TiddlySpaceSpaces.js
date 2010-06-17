/***
|''Requires''|TiddlyWebConfig TiddlySpaceInclusion|
!HTMLForm
<form action="#">
	<fieldset>
		<legend />
		<dl>
			<dt>Name:</dt>
			<dd><input type="text" name="space" /></dd>
		</dl>
		<p>
			<input type="checkbox" name="subscribe" />
			Include the current space in the new space.
		</p>
		<p class="annotation" />
		<input type="submit" />
	</fieldset>
</form>
!Code
***/
//{{{
(function($) {

var host = config.extensions.tiddlyweb.host;

var macro = config.macros.TiddlySpaceSpaces = { // TODO: rename
	formTemplate: store.getTiddlerText(tiddler.title + "##HTMLForm"),
	locale: {
		listError: "error listing spaces: %0",
		addLabel: "Create space",
		addSuccess: "created space %0",
		conflictError: "space <em>%0</em> already exists",
		charError: "error: invalid space name - must be alphanumeric (lowercase)",
		noSpaces: "you have no spaces"
	},

	handler: function(place, macroName, params, wikifier, paramString, tiddler) {
		var container = $("<div />").appendTo(place);
		this.refresh(container);
	},
	refresh: function(container) {
		container.empty().append("<div />").append(this.generateForm());
		$.ajax({ // XXX: DRY; cf. TiddlySpaceInclusion
			url: host + "/spaces?mine=1",
			type: "GET",
			success: function(data, status, xhr) {
				var spaces = $.map(data, function(item, i) {
					var link = $("<a />", {
						href: item.uri,
						text: item.name
					});
					return $("<li />").append(link)[0];
				});
				if(data.length >0){	
					$("div", container).append("<ul/>").append(spaces);
				}
				else{
					$("div", container).append("<span class='noSpacesMessage'>"+macro.locale.noSpaces+"</span>");
				}
			},
			error: function(xhr, error, exc) {
				displayMessage(macro.locale.listError.format([error]));
			}
		});
	},
	generateForm: function() {
		return $(this.formTemplate).submit(this.onSubmit).
			find("legend").text(this.locale.addLabel).end().
			find(".annotation").hide().end().
			find("[type=submit]").val(this.locale.addLabel).end();
	},
	onSubmit: function(ev) {
		var form = $(this).closest("form");
		var container = form.closest("div");
		var space = form.find("[name=space]").val();
		var subscribe = form.find("[name=subscribe]").attr("checked");
		space = new tiddlyweb.Space(space, host);
		var specialChars = space.name.match(/[^0-9a-z]/) ? true : false; // XXX: duplicated from TiddlySpaceRegister
		var displayError = config.macros.TiddlySpaceLogin.displayError;
		var callback = function(resource, status, xhr) {
			if(subscribe) {
				config.macros.TiddlySpaceInclusion.include(
					config.extensions.tiddlyspace.currentSpace.name, space.name);
			}
			macro.refresh(container);
			displayMessage(macro.locale.addSuccess.format([space.name]));
		};
		var errback = function(xhr, error, exc) { // TODO: DRY (cf. TiddlySpaceLogin)
			var ctx = {
				msg: { 409: macro.locale.conflictError.format([space.name]) },
				form: form,
				selector: "[name=space]"
			};
			displayError(xhr, error, exc, ctx);
		};
		if(!specialChars) {
			space.create(callback, errback);
		} else {
			var xhr = { status: 409 }; // XXX: hacky
			var ctx = {
				msg: { 409: macro.locale.charError },
				form: form,
				selector: "[name=space]"
			};
			displayError(xhr, null, null, ctx);
		}
		return false;
	}
};

})(jQuery);
//}}}