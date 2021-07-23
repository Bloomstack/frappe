frappe.ui.form.ControlTextEditorAlt = frappe.ui.form.ControlCode.extend({
	make_wrapper() {
		this._super();
		this.$wrapper.find(".like-disabled-input").addClass("editor");
	},

	make_input() {
		this.has_input = true;
		this.make_editor();
	},

	make_editor() {
		let me = this;
		if (me.editor) return;

		me.editor = $("<div>").appendTo(me.input_area);
		me.editor.summernote(me.get_config());
	},

	get_config() {
		let me = this;
		return {
			minHeight: 400,
			airMode: false,
			fontNames: ['Arial', 'Arial Black', 'Comic Sans MS', 'Courier New', 'Merriweather'],
			fontNamesIgnoreCheck: ['Merriweather'],
			dialogsInBody: true,
			dialogsFade: true,
			toolbar: [
				["magic", ["style"]],
				["style", ["bold", "italic", "underline", "clear"]],
				["font", ["strikethrough", "superscript", "subscript"]],
				["fontsize", ["fontsize"]],
				["table", ["table"]],
				["color", ["color"]],
				["para", ["ul", "ol", "paragraph"]],
				["height", ["height"]],
				["misc", ["codeview"]],
				["insert", ["link", "picture", "video"]],
			],
			popover: {
				link: [
					['link', ['linkDialogShow', 'unlink']]
				],
				table: [
					['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
					['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
				],
				image: [
					['custom', ['imageShapes']],
					['imagesize', ['imageSize100', 'imageSize50', 'imageSize25']],
					['float', ['floatLeft', 'floatRight', 'floatNone']],
					['remove', ['removeMedia']]
				],
			},
			lang: 'en-US', // Change to your chosen language
			imageAttributes: {
				icon: '<i class="note-icon-pencil"/>',
				removeEmpty: false,
				disableUpload: true
			},
			icons: me.get_icons(),
			callbacks: {
				onChange: function(value) {
					if (!me.is_summernote_dirty()) return;

					me.parse_validate_and_set_in_model(value);
				}
			}
		};
	},

	is_summernote_dirty() {
		let input_value = this.get_input_value();

		return this.value !== input_value;
	},

	parse(value) {
		if (!value || value == null) value = "";

		return frappe.dom.remove_script_and_style(value);
	},

	set_formatted_input(value) {
		this.editor.summernote("code", value);
	},

	set_input: function(value) {
		if (value !== this.get_value())
			this.editor.summernote('code', value);

		this.last_value = this.value;
		this.value = value;
		this.set_mandatory && this.set_mandatory(value);
	},

	get_input_value() {
		return this.editor.summernote("code");
	},

	set_focus() {
		return this.editor.summernote('focus');
	},

	get_icons() {
		return {
			"align": "fa fa-align fa-lg",
			"alignCenter": "fa fa-align-center fa-lg",
			"alignJustify": "fa fa-align-justify fa-lg",
			"alignLeft": "fa fa-align-left fa-lg",
			"alignRight": "fa fa-align-right fa-lg",
			"indent": "fa fa-indent fa-lg",
			"outdent": "fa fa-outdent fa-lg",
			"arrowsAlt": "fa fa-arrows-alt fa-lg",
			"bold": "fa fa-bold fa-lg",
			"caret": "caret fa-lg",
			"circle": "fa fa-circle fa-lg",
			"close": "fa fa-close fa-lg",
			"code": "fa fa-code fa-lg",
			"eraser": "fa fa-eraser fa-lg",
			"font": "fa fa-font fa-lg",
			"frame": "fa fa-frame fa-lg",
			"italic": "fa fa-italic fa-lg",
			"link": "fa fa-link fa-lg",
			"unlink": "fa fa-chain-broken fa-lg",
			"magic": "fa fa-magic fa-lg",
			"menuCheck": "fa fa-check fa-lg",
			"minus": "fa fa-minus fa-lg",
			"orderedlist": "fa fa-list-ol fa-lg",
			"pencil": "fa fa-pencil fa-lg",
			"picture": "fa fa-picture-o fa-lg",
			"question": "fa fa-question fa-lg",
			"redo": "fa fa-redo fa-lg",
			"square": "fa fa-square fa-lg",
			"strikethrough": "fa fa-strikethrough fa-lg",
			"subscript": "fa fa-subscript fa-lg",
			"superscript": "fa fa-superscript fa-lg",
			"table": "fa fa-table fa-lg",
			"textHeight": "fa fa-text-height fa-lg",
			"trash": "fa fa-trash fa-lg",
			"underline": "fa fa-underline fa-lg",
			"undo": "fa fa-undo fa-lg",
			"unorderedlist": "fa fa-list-ul fa-lg",
			"video": "fa fa-video-camera fa-lg",
			"floatLeft": "fa fa-align-left fa-lg",
			"floatRight": "fa fa-align-right fa-lg",
			"rollback": "fa fa-times fa-lg",
			"rowAbove": "fa fa-arrow-up fa-lg",
			"rowBelow": "fa fa-arrow-down fa-lg",
			"colBefore": "fa fa-arrow-left fa-lg",
			"colAfter": "fa fa-arrow-right fa-lg",
			"rowRemove": "fa fa-times fa-lg",
			"colRemove": "fa fa-times fa-lg"
		};
	}
});
