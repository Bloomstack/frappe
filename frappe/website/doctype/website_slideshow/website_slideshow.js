// Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
// MIT License. See license.txt

frappe.ui.form.on("Website Slideshow", {
	refresh: (frm) => {
		let intro = frm.doc.__islocal?
			"First set the name and save the record.": "Attach files / urls and add in table.";
		frm.set_intro(intro);
	},
	validate: (frm) => {
		for (var item = 0; item < frm.doc.slideshow_items.length; item++) {
			if (frm.doc.slideshow_items[item].__unsaved == 1 && frm.doc.slideshow_items[item] == null) {
				var  rx = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/)|(?:(?:watch)?\?v(?:i)?=|\&v(?:i)?=))([^#\&\?]*).*/;
				frm.doc.slideshow_items[item].image = "https://img.youtube.com/vi/" + frm.doc.slideshow_items[item].video_link.match(rx)[1] + "/maxresdefault.jpg"
			}
		}
	}
})