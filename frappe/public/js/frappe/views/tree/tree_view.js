frappe.provide('frappe.views');

frappe.views.ListTreeView = class TreeView extends frappe.views.ListView {
	get view_name() {
		return 'Tree';
	}

	setup_defaults() {
		super.setup_defaults();
		this.view = 'Tree';
	}

	get_or_filters_for_args() {
		return [
			[this.doctype, "is_group", "is", "set"],
			[this.doctype, this.meta.nsm_parent_field, "is", "not set"]
		];
	}

	get_fields() {
		// convert [fieldname, Doctype] => tabDoctype.fieldname
		let fields = [];
		let has_is_group = false;
		this.fields.forEach(f => {
			if (f[0] === "is_group") has_is_group = true;

			fields.push(frappe.model.get_full_column_name(f[0], f[1]));
		});

		if (!has_is_group) {
			fields.push(frappe.model.get_full_column_name("is_group", this.doctype));
		}

		return fields;
	}

	get_call_args_for_nodes(filters) {
		return {
			method: this.method,
			args: {
				doctype: this.doctype,
				fields: this.get_fields(),
				filters: filters,
				order_by: this.sort_selector.get_sql_string(),
				start: this.start,
				page_length: this.page_length,
				view: this.view,
				with_comment_count: true
			},
			freeze: this.freeze_on_refresh || false,
			freeze_message: this.freeze_message || (__('Loading') + '...')
		};
	}

	setup_events() {
		super.setup_events();
		this.setup_tree_dropdown();
		this.setup_create_new();
	}

	setup_tree_dropdown() {
		this.$result.on('click', '.btn-collapsible', (e) => {
			e.stopPropagation();

			let el = e.currentTarget;
			let target = unescape(el.getAttribute("data-name"));
			let $el = $(el);

			$el.find(".fa").removeClass("fa-folder").addClass("fa-folder-open active");
			this.render_nodes(target, $el);
		});
	}

	setup_create_new() {
		let me = this;

		this.$result.on('click', '.create-new', (e) => {
			let doctype = unescape(e.currentTarget.getAttribute("data-doctype"));
			let name = unescape(e.currentTarget.getAttribute("data-name"));

			let doc = frappe.model.get_new_doc(doctype);
			doc[me.meta.nsm_parent_field] = name;

			frappe.ui.form.make_quick_entry(doctype, null, null, doc);
		});
	}

	prepare_nested_data(r) {
		let data = r.message || {};
		data = !Array.isArray(data) ? frappe.utils.dict(data.keys, data.values) : data;

		return data.uniqBy(d => d.name);
	}

	render_nodes(target, $el) {
		let $row = this.$result.find(`.list-container[data-name="${encodeURIComponent(target)}"]`);
		if (!$row || !$row.length) return;

		let list = $row.find(`.list-nested-row-container`);
		let level = parseInt($row[0].getAttribute("data-level")) + 1;

		let $list = $(list);

		$row.toggleClass("opened");
		$list.toggleClass("hide");

		if ($list[0].classList.contains("hide")) {
			$list.find(`.nested-result`).remove();
			$el.find(".fa").removeClass("fa-folder-open").addClass("fa-folder");
			return;
		}

		frappe.call(this.get_call_args_for_nodes([[this.doctype, this.meta.nsm_parent_field, "=", target]])).then(r => {
			// render
			let data = this.prepare_nested_data(r);
			let $nested_result = $(`<div class="nested-result">`);

			list.append($nested_result);

			$nested_result.append(
				data.map((doc, i) => {
					doc._idx = i;
					return this.get_nested_list_row_html(doc, level, data.length-1 == i);
				}).join('')
			);
		});
	}

	setup_list_click() {
		this.$result.on('click', '.list-row, .image-view-header', (e) => {
			const $target = $(e.target);
			// tick checkbox if Ctrl/Meta key is pressed
			if (e.ctrlKey || e.metaKey && !$target.is('a')) {
				const $list_row = $(e.currentTarget);
				const $check = $list_row.find('.list-row-checkbox');
				$check.prop('checked', !$check.prop('checked'));
				e.preventDefault();
				this.on_row_checked();
				return;
			}
			// don't open form when checkbox, like, filterable are clicked
			if ($target.hasClass('filterable') ||
				$target.hasClass('octicon-heart') ||
				$target.is(':checkbox') ||
				$target.is('a')) {
				return;
			}
		});
	}

	render_list() {
		// clear rows
		this.$result.find('.list-container').remove();
		if (this.data.length > 0) {
			// append rows
			this.$result.append(
				this.data.map((doc, i) => {
					doc._idx = i;
					return this.get_list_row_html(doc);
				}).join('')
			);
		}
	}

	get_list_row_html(doc) {
		return this.get_list_row_html_skeleton(this.get_left_html(doc), this.get_right_html(doc), doc, 0);
	}

	get_nested_list_row_html(doc, level, last_node) {
		return this.get_list_row_html_skeleton(this.get_left_html(doc, level), this.get_right_html(doc), doc, level, last_node);
	}

	get_list_row_html_skeleton(left = '', right = '', doc = {}, level = 0, last_node) {
		return `
			<div class="list-container ${last_node ? "last-node" : ""}" data-doctype="${escape(this.doctype)}" data-name="${escape(doc.name)}" data-level="${level}">
				<div class="list-row-container collapsed" tabindex="1">
					<div class="level list-row small">
						<div class="level-left ellipsis">
							${left}
						</div>
						<div class="level-right text-muted ellipsis">
							${right}
						</div>
					</div>
				</div>
				<div class="list-nested-row-container hide" style="--level:${level}">
				</div>
			</div>
		`;
	}

	get_left_html(doc, level) {
		return this.columns.map(col => this.get_column_html(col, doc, level)).join('');
	}

	get_column_html(col, doc, level) {
		if (col.type === 'Status') {
			return `
				<div class="list-row-col hidden-xs ellipsis">
					${this.get_indicator_html(doc)}
				</div>
			`;
		}

		const df = col.df || {};
		const label = df.label;
		const fieldname = df.fieldname;
		const value = doc[fieldname] || '';

		const format = () => {
			if (df.fieldtype === 'Code') {
				return value;
			} else if (df.fieldtype === 'Percent') {
				return `<div class="progress level m-0">
						<div class="progress-bar progress-bar-success" role="progressbar"
							aria-valuenow="${value}"
							aria-valuemin="0" aria-valuemax="100" style="width: ${Math.round(value)}%;">
						</div>
					</div>`;
			} else {
				return frappe.format(value, df, null, doc);
			}
		};

		const field_html = () => {
			let html;
			let _value;
			// listview_setting formatter
			if (this.settings.formatters && this.settings.formatters[fieldname]) {
				_value = this.settings.formatters[fieldname](value, df, doc);
			} else {
				let strip_html_required = df.fieldtype == 'Text Editor'
					|| (df.fetch_from && ['Text', 'Small Text'].includes(df.fieldtype));
				if (strip_html_required) {
					_value = strip_html(value);
				} else {
					_value = typeof value === 'string' ? frappe.utils.escape_html(value) : value;
				}
			}

			if (df.fieldtype === 'Image') {
				html = df.options ?
					`<img src="${doc[df.options]}" class="w-100">`:
					`<div class="missing-image small">
						<span class="octicon octicon-circle-slash"></span>
					</div>`;
			} else if (df.fieldtype === 'Select') {
				html = `<span class="filterable indicator ${frappe.utils.guess_colour(_value)} ellipsis"
					data-filter="${fieldname},=,${value}">
					${__(_value)}
				</span>`;
			} else if (df.fieldtype === 'Link') {
				html = `<a class="filterable text-muted ellipsis"
					data-filter="${fieldname},=,${value}">
					${_value}
				</a>`;
			} else if (['Text Editor', 'Text', 'Small Text', 'HTML Editor'].includes(df.fieldtype)) {
				html = `<span class="text-muted ellipsis">
					${_value}
				</span>`;
			} else {
				html = `<a class="filterable text-muted ellipsis"
					data-filter="${fieldname},=,${value}">
					${format()}
				</a>`;
			}

			return `<span class="ellipsis"
				title="${__(label)}: ${escape(_value)}">
				${html}
			</span>`;
		};

		const class_map = {
			Subject: 'list-subject level',
			Field: 'hidden-xs'
		};
		const css_class = [
			'list-row-col ellipsis',
			class_map[col.type],
			frappe.model.is_numeric_field(df) ? 'text-right' : ''
		].join(' ');

		const html_map = {
			Subject: this.get_subject_html(doc, level),
			Field: field_html()
		};
		const column_html = html_map[col.type];

		return `
			<div class="${css_class}">
				${column_html}
			</div>
		`;
	}

	get_subject_html(doc, level=0) {
		let user = frappe.session.user;
		let subject_field = this.columns[0].df;
		let value = doc[subject_field.fieldname] || doc.name;
		let subject = strip_html(value.toString());
		let escaped_subject = frappe.utils.escape_html(subject);

		const liked_by = JSON.parse(doc._liked_by || '[]');
		let heart_class = liked_by.includes(user) ? 'liked-by' : 'text-extra-muted not-liked';

		const seen = JSON.parse(doc._seen || '[]').includes(user) ? '' : 'bold';

		let subject_html = `
			<input class="level-item list-row-checkbox hidden-xs" type="checkbox" data-name="${escape(doc.name)}">
			<span class="level-item">
				<i class="octicon octicon-heart like-action ${heart_class}"
					data-name="${doc.name}" data-doctype="${this.doctype}"
					data-liked-by="${encodeURI(doc._liked_by) || '[]'}">
				</i>
				<span class="likes-count">
					${ liked_by.length > 99 ? __("99") + '+' : __(liked_by.length || '')}
				</span>
			</span>
			<span class="level-item ${seen} ellipsis" title="${escaped_subject}" style="padding-left: ${20*level}px;">
				${this.get_node_icon(doc)}
				${this.get_subject_link(doc, subject, escaped_subject)}
			</span>
		`;

		return subject_html;
	}

	get_subject_link(doc, subject, escaped_subject) {
		return `<a href="${this.get_form_link(doc)}" class="ellipsis" title="${escaped_subject}" data-doctype="${doc.doctype}" data-name="${doc.name}">
			${subject}
		</a>`;
	}

	get_node_icon(doc) {
		let icon = doc.is_group ? 'fa fa-fw fa-folder node-parent' : 'octicon octicon-primitive-dot node-leaf';
		let collapsible = doc.is_group ? 'btn-collapsible' : 'text-extra-muted';

		return `
			<a class="btn btn-xs ${collapsible} tree-node text-muted" data-doctype="${escape(this.doctype)}" data-name="${escape(doc.name)}" style="width:28px">
				<i class="${icon}" />
			</a>
		`;
	}

	get_meta_html(doc) {
		const modified = comment_when(doc.modified, true);

		const last_assignee = JSON.parse(doc._assign || '[]').slice(-1)[0];
		const assigned_to = last_assignee ?
			`<span class="filterable"
				data-filter="_assign,like,%${last_assignee}%">
				${frappe.avatar(last_assignee)}
			</span>` :
			`<span class="avatar avatar-small avatar-empty"></span>`;

		const comment_count =
			`<span class="${!doc._comment_count ? 'text-extra-muted' : ''} comment-count">
				<i class="octicon octicon-comment-discussion"></i>
				${doc._comment_count > 99 ? "99+" : doc._comment_count}
			</span>`;

		return `
			${this.get_add_child_button(doc)}
			<div class="level-item hidden-xs list-row-activity">
				${modified}
				${assigned_to}
				${comment_count}
			</div>
			<div class="level-item visible-xs text-right">
				${this.get_indicator_dot(doc)}
			</div>
		`;
	}

	get_add_child_button(doc) {
		if (!doc.is_group) {
			return ``;
		}

		return `
			<div class="level-item hidden-xs">
				<button class="btn create-new btn-default btn-xs"
					data-doctype="${this.doctype}" data-name="${escape(doc.name)}">
					${__("Add Child")}
				</button>
			</div>
		`;
	}
};
