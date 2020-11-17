// Copyright (c) 2020, Frappe Technologies and contributors
// For license information, please see license.txt

frappe.ui.form.on('Image Resize Preset', {
	refresh: function(frm) {
		// view document button
		if (!frm.is_new() && !frm.is_dirty()) {
			frm.add_custom_button("Clear Cache", function() {
				frappe.call({
					method: "frappe.website.doctype.image_resize_preset.image_resize_preset.clear_cache",
					args: { name: frm.doc.name },
					freeze: true,
					callback: function() {
						frappe.msgprint(`Cache Cleared for ${frm.doc.name} Preset`)
					}
				})
			});
		}
	}
});
