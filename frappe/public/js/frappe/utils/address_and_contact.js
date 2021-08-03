frappe.provide('frappe.contacts')

$.extend(frappe.contacts, {
	clear_address_and_contact: function (frm) {
		frm.fields_dict['address_html'] && $(frm.fields_dict['address_html'].wrapper).html("");
		frm.fields_dict['contact_html'] && $(frm.fields_dict['contact_html'].wrapper).html("");
		if (frm.layout_for_address.fields_dict['address_html1'] && $(frm.fields_dict['address_html1'].wrapper)) {
			frm.layout_for_address.fields_dict['address_html1'] && $(frm.fields_dict['address_html1'].wrapper).html("");
		}
		if (frm.layout_for_address.fields_dict['contact_html1'] && $(frm.fields_dict['contact_html1'].wrapper)) {
			frm.layout_for_address.fields_dict['contact_html1'] && $(frm.fields_dict['contact_html1'].wrapper).html("");
		}
	},

	paginate: function (total_items, pagination_class, html_class, box_class, pagination_desc_class) {
		let per_page = 5;
		let count = Math.ceil(total_items / per_page);
		if ($('body').has(`.${pagination_class}`).length) {
			$(`.${pagination_class}`).empty();
		} else {
			$(`div[data-fieldname="${html_class}"]`).append(`<div class = "${pagination_class}"></div>`);
			$(`div[data-fieldname="${html_class}"]`).append(`<div class = "text-right text-muted ${pagination_desc_class}"></div>`);
		}
		for (var i = 1; i <= count; i++) {
			$(`.${pagination_class}`).append("<div class='page_number'>" + i + "</div>");
		}
		$(`.${pagination_class} .page_number:first-child`).addClass('active');
		$(`.${pagination_desc_class}`).append(`1 - ${(per_page) > total_items ? total_items : (per_page)} of ${total_items}`);
		$(`div[data-fieldname=${html_class}] .${box_class}`).filter(function (index) {
			return index < per_page;
		}).addClass('active');

		$(`div[data-fieldname=${html_class}]`).on('click', `.${pagination_class} .page_number`, function () {
			$(`.${pagination_desc_class}`).empty();
			var page_index = $(this).index();
			var start = page_index * per_page;
			$(`div[data-fieldname=${html_class}] .${box_class}`).removeClass('active');
			$(`.${pagination_class} .page_number`).removeClass('active');
			$(`.${pagination_class} .page_number`).eq(page_index).addClass('active');
			for (var j = 0; j < per_page; j++) {
				$(`div[data-fieldname=${html_class}] .${box_class}`).eq(start + j).addClass('active');
			}
			$(`.${pagination_desc_class}`).append(`${start + 1} - ${(start + per_page) > total_items ? total_items : (start + per_page)} of ${total_items}`);
		});
	},

	render_address_and_contact: function (frm) {
		let address_fields = [
			{
				fieldtype: "Data",
				label: "Search Address",
				fieldname: "search_address",
			},
			{
				fieldtype: "HTML",
				label: "Address List",
				fieldname: "address_html1",
			}
		];
		frm.layout_for_address = new frappe.ui.FieldGroup({
			body: frm.get_field('address_html').$wrapper,
			fields: address_fields,
		});

		// render address
		if (frm.fields_dict['address_html'] && "addr_list" in frm.doc.__onload) {
			frappe.contacts.clear_address_and_contact(frm);
			frm.layout_for_address.make();
			$(frm.layout_for_address.fields_dict["address_html1"].wrapper)
				.html(frappe.render_template("address_list", frm.doc.__onload))
				.find(".btn-address").on("click", function () {
					frappe.new_doc("Address");
				});

			let $input =  frm.layout_for_address.fields_dict["search_address"].$input;
			$input.on("input", function(e) {
				let addr_list = {
					"addr_list": frm.doc.__onload.addr_list.filter((obj) =>
						JSON.stringify(obj).toLowerCase().includes(e.target.value.toLowerCase()))
				};
				$(frm.layout_for_address.fields_dict["address_html1"].wrapper).html(frappe.render_template("address_list", addr_list));
				let no_of_addresses = addr_list.addr_list.length;
				frappe.contacts.paginate(no_of_addresses, "address_pagination", "address_html1", "address-box", "address_paginate_desc");
			});
		}

		let no_of_addresses = frm.doc.__onload.addr_list.length;
		frappe.contacts.paginate(no_of_addresses, "address_pagination", "address_html1", "address-box", "address_paginate_desc");
		$(frm.layout_for_address.fields_dict["address_html1"].$wrapper).on('click', '.btn-address-link', function () {
			frappe.prompt({
				label: "Link Address",
				fieldname: "address",
				fieldtype: "Link",
				options: "Address",
				reqd: 1,
				get_query: () => {
					let addr_list = frm.doc.__onload.addr_list.map(addr => addr.name);
					return {
						filters: {
							"name": ["not in", addr_list]
						}
					};
				}
			},
			(data) => {
				frappe.call({
					method: "frappe.contacts.address_and_contact.link_address_or_contact",
					args: {
						"ref_doctype": "Address",
						"ref_name": data.address,
						"link_doctype": frm.doctype,
						"link_name": frm.docname
					},
					callback: function () {
						window.location.reload();
					}
				});
			}, __("Select Address"));
		});

		$(frm.layout_for_address.fields_dict["address_html1"].$wrapper).on('click', '.address-box a.unlink_address', function () {
			var name = $(this).attr('data_address_name');
			frappe.confirm(
				`Are you sure you want to unlink this address with ${cur_frm.docname}?`,
				function () {
					frappe.call({
						method: "frappe.contacts.address_and_contact.unlink_address_or_contact",
						args: {
							"ref_doctype": "Address",
							"ref_name": name,
							"doctype": cur_frm.doctype,
							"name": cur_frm.docname
						},
						callback: function () {
							window.location.reload();
						}
					});
				}
			);
		});

		$(frm.layout_for_address.fields_dict["address_html1"].$wrapper).on('click', '.address-box a.delete_address', function () {
			var name = $(this).attr('data_address_name');
			frappe.confirm(
				`If this address is linked to any other entity in the system, it will instead remove the address from ${cur_frm.docname}.<br><br>
					Are you sure you want to delete this address?`,
				function () {
					frappe.call({
						method: "frappe.contacts.address_and_contact.delete_address_or_contact",
						args: {
							"ref_doctype": "Address",
							"ref_name": name,
							"doctype": cur_frm.doctype,
							"name": cur_frm.docname
						},
						callback: function () {
							window.location.reload();
						}
					});
				}
			);
		});

		let contact_fields = [
			{
				fieldtype: "Data",
				label: "Search Contact",
				fieldname: "search_contact",
			},
			{
				fieldtype: "HTML",
				label: "Contact List",
				fieldname: "contact_html1",
			}
		];
		frm.layout_for_contacts = new frappe.ui.FieldGroup({
			body: frm.get_field('contact_html').$wrapper,
			fields: contact_fields,
		});

		// render contact
		if (frm.fields_dict['contact_html'] && "contact_list" in frm.doc.__onload) {
			frm.layout_for_contacts.make();
			$(frm.layout_for_contacts.fields_dict["contact_html1"].wrapper)
				.html(frappe.render_template("contact_list", frm.doc.__onload))
				.find(".btn-contact").on("click", function () {
					frappe.new_doc("Contact");
				});
			let $input =  frm.layout_for_contacts.fields_dict["search_contact"].$input;

			$input.on("input", function(e) {
				let contact_list = {
					"contact_list": frm.doc.__onload.contact_list.filter((obj) =>
						JSON.stringify(obj).toLowerCase().includes(e.target.value.toLowerCase()))
				};
				$(frm.layout_for_contacts.fields_dict["contact_html1"].wrapper).html(frappe.render_template("contact_list", contact_list));
				let no_of_contacts = contact_list.contact_list.length;
				frappe.contacts.paginate(no_of_contacts, "contact_pagination", "contact_html1", "contact-box", "contact_paginate_desc");
			});
		}

		let no_of_contacts = frm.doc.__onload.contact_list.length;
		frappe.contacts.paginate(no_of_contacts, "contact_pagination", "contact_html1", "contact-box", "contact_paginate_desc");
		$(frm.layout_for_contacts.fields_dict["contact_html1"].$wrapper).on('click', '.btn-contact-link', function () {
			frappe.prompt({
				label: "Link Contact",
				fieldname: "contact",
				fieldtype: "Link",
				options: "Contact",
				reqd: 1,
				get_query: () => {
					let contact_list = frm.doc.__onload.contact_list.map(contact => contact.name);
					return {
						filters: {
							"name": ["not in", contact_list]
						}
					};
				}
			},
			(data) => {
				frappe.call({
					method: "frappe.contacts.address_and_contact.link_address_or_contact",
					args: {
						"ref_doctype": "Contact",
						"ref_name": data.contact,
						"link_doctype": frm.doctype,
						"link_name": frm.docname
					},
					callback: function () {
						window.location.reload();
					}
				});
			}, __("Select Contact"));
		});

		$(frm.layout_for_contacts.fields_dict["contact_html1"].$wrapper).on('click', '.contact-box a.unlink_contact', function () {
			var name = $(this).attr('data_contact_name');
			frappe.confirm(
				`Are you sure you want to unlink this contact with ${cur_frm.docname}?`,
				function () {
					frappe.call({
						method: "frappe.contacts.address_and_contact.unlink_address_or_contact",
						args: {
							"ref_doctype": "Contact",
							"ref_name": name,
							"doctype": cur_frm.doctype,
							"name": cur_frm.docname
						},
						callback: function () {
							window.location.reload();
						}
					});
				}
			);
		});

		$(frm.layout_for_contacts.fields_dict["contact_html1"].$wrapper).on('click', '.contact-box a.delete_contact', function () {
			var name = $(this).attr('data_contact_name');
			frappe.confirm(
				`If this contact is linked to any other entity in the system, it will instead remove the contact from ${cur_frm.docname}.<br><br>
							Are you sure you want to delete this contact?`,
				function () {
					frappe.call({
						method: "frappe.contacts.address_and_contact.delete_address_or_contact",
						args: {
							"ref_doctype": "Contact",
							"ref_name": name,
							"doctype": cur_frm.doctype,
							"name": cur_frm.docname
						},
						callback: function () {
							window.location.reload();
						}
					});
				}
			);
		});
	}
})
