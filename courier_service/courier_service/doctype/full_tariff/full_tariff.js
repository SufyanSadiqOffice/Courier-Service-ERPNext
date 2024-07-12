// Copyright (c) 2024, Sowaan and contributors
// For license information, please see license.txt

// frappe.ui.form.on("Full Tariff", {
// 	refresh(frm) {

// 	},
// });


frappe.ui.form.on("Buying Rate From Full Tarrif", {
	// refresh(frm) {

	// },

    full_tarrif : function(frm,cdt,cdn)
    {
        let row = locals[cdt][cdn] ;
        let d_a = row.full_tarrif * row.discount_percentage / 100 ;
        let b_r = row.full_tarrif - d_a ;
        frappe.model.set_value(row.doctype , row.name , "discount_amount" , d_a) ;
        frappe.model.set_value(row.doctype , row.name , "buying_rate" , b_r) ;

    },


    discount_percentage : function(frm,cdt,cdn)
    {
        let row = locals[cdt][cdn] ;
        let d_a = row.full_tarrif * row.discount_percentage / 100 ;
        let b_r = row.full_tarrif - d_a ;
        frappe.model.set_value(row.doctype , row.name , "discount_amount" , d_a) ;
        frappe.model.set_value(row.doctype , row.name , "buying_rate" , b_r) ;
    },


});