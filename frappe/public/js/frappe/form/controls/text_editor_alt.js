import Base64UploadAdapter from "./ckeditor-plugins/Base64UploadAdapter";

frappe.ui.form.ControlTextEditorAlt = frappe.ui.form.ControlCode.extend({
	make_wrapper() {
		this._super();
		this.$wrapper.find(".like-disabled-input").addClass('ck-editor');
	},

	make_input() {
		this.has_input = true;
		this.make_ckeditor();
	},

	make_ckeditor() {
		if (this.ckeditor) return;
		this.ckeditor_container = $('<div class="ckeditor">').appendTo(this.input_area);
		this.ckeditor_toolbar = $('<div class="ckeditor-toolbar">').appendTo(this.ckeditor_container);
		this.ckeditor_content = $('<div class="ckeditor-content">').appendTo(this.ckeditor_container);

		this.ckeditor = null;
		this.set_ckeditor_options();
		DecoupledEditor
			.create( this.ckeditor_content[0] )
			.then( editor => {
				this.ckeditor = editor;
				this.ckeditor_toolbar.append(editor.ui.view.toolbar.element);
				this.bind_events();
			} )
			.catch( error => { console.error(error) } );
	},

	bind_events() {
		let me = this;
		me.ckeditor.model.document.on('change:data', frappe.utils.debounce(() => {
			if (!me.is_ckeditor_dirty()) return;

			frappe.call({
				method: "frappe.utils.html_formatter.format_html",
				args: {
					html: me.get_input_value()
				},
				callback: function(r) {
					const input_value = r.message;
					me.parse_validate_and_set_in_model(input_value);
				}
			});
		}, 300));

		me.ckeditor.plugins.get("FileRepository").createUploadAdapter = loader => new Base64UploadAdapter(loader);
	},

	is_ckeditor_dirty() {
		let input_value = this.get_input_value();
		return this.value !== input_value;
	},

	set_ckeditor_options() {
		// Set default toolbar options as per Decoupled Editor
		DecoupledEditor.defaultConfig = {
			toolbar: {
				items: [
					"heading", "|",
					"fontfamily", "fontsize", "fontColor", "fontBackgroundColor", "|",
					"bold", "italic", "underline", "strikethrough", "|",
					"alignment", "|", "numberedList", "bulletedList", "|",
					"insertTable", "|",
					"outdent", "indent", "|",
					"uploadImage", "link", "blockquote", "|",
					"undo", "redo"
				]
			},
			image: {
				styles: ["full", "alignLeft", "alignRight"],
				toolbar: ["imageStyle:alignLeft", "imageStyle:full", "imageStyle:alignRight", "|", "imageTextAlternative"]
			},
			table: {
				contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"]
			},
			language: "en"
		};
	},

	parse(value) {
		if (value == null) {
			value = "";
		}
		return frappe.dom.remove_script_and_style(value);
	},

	set_formatted_input(value) {
		if (!this.ckeditor) {
			return setTimeout(() => {
				this.ckeditor && this.ckeditor.setData(value);
			});
		};
		if (value === this.get_input_value()) return;
		if (!value) {
			// clear contents for falsy values like '', undefined or null
			this.ckeditor.setData('');
			return;
		}
		this.ckeditor.setData(value);
	},

	get_input_value() {
		let value = this.ckeditor ? this.ckeditor.getData() : '';
		// hack to retain space sequence.
		value = value.replace(/(\s)(\s)/g, ' &nbsp;');
		return value;
	},

	set_focus() {
		this.ckeditor.focus()
	}
});
