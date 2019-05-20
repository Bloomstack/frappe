// Copyright (c) 2016, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Bulk Update', {
	refresh: function (frm) {
		frm.page.set_primary_action(__('Update'), function () {
			frappe.call({
				method: 'frappe.desk.doctype.bulk_update.bulk_update.update',
				args: {
					doctype: frm.doc.document_type,
					field: frm.doc.field,
					value: frm.doc.update_value,
					condition: frm.doc.condition,
					limit: frm.doc.limit
				},
			}).then(r => {
				let failed = r.message;
				if (!failed) failed = [];

				if (failed.length && !r._server_messages) {
					frappe.throw(__('Cannot update {0}', [failed.map(f => f.bold ? f.bold() : f).join(', ')]));
				}
				frappe.hide_progress();
			});
		});
	},

	document_type: function (frm) {
		// set field options
		if (!frm.doc.document_type) return;

		frappe.model.with_doctype(frm.doc.document_type, function () {
			var options = $.map(frappe.get_meta(frm.doc.document_type).fields,
				function (d) {
					if (d.fieldname && frappe.model.no_value_type.indexOf(d.fieldtype) === -1) {
						return d.fieldname;
					}
					return null;
				}
			);
			frm.set_df_property('field', 'options', options);
		});
	}
});
