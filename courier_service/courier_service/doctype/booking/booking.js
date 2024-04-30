// Copyright (c) 2024, Sowaan and contributors
// For license information, please see license.txt

frappe.ui.form.on("Booking", {
	

    onload : async function(frm)
    {
        if (frm.doc.customer && frm.doc.company && (frm.doc.docstatus !=1 && frm.doc.docstatus !=2) ) {
            booking_list = await frappe.db.get_list('Booking', {
                filters: {
                    'customer': frm.doc.customer,
                    'company': frm.doc.company,
                    'docstatus': 1
                },
                fields: ['name', 'amount_after_discount']
            });
            let total_credit_limit = 0;
            let credit_limit_used = 0;
            let balance_before_ship = 0;
            let balance_after_ship = 0;
            if (booking_list)
            {
                for (let booking of booking_list )
                {
                    credit_limit_used += booking.amount_after_discount;
                }
            }
            cust_doc = await frappe.db.get_doc('Customer',frm.doc.customer);
            if (cust_doc.credit_limits)
            {
                for (let row of cust_doc.credit_limits)
                {
                    if (row.company == frm.doc.company)
                    {
                        total_credit_limit = row.credit_limit ;
                        break;
                    }
                }
            }
            balance_before_ship = total_credit_limit - credit_limit_used ;
            if (balance_before_ship <= 0)
            {
                frappe.throw("Customer's Balance Credit Limit is zero." );
            }
            else 
            {    
                if ( frm.doc.balance_credit_limit_before_shipment != balance_before_ship)
                {
                    frm.set_value('balance_credit_limit_before_shipment',balance_before_ship);
                }
                if(frm.doc.amount_after_discount)
                {
                    balance_after_ship = balance_before_ship - frm.doc.amount_after_discount ;
                    if ( frm.doc.balance_credit_limit_after_shipment != balance_after_ship)
                    {
                        frm.set_value('balance_credit_limit_after_shipment',balance_after_ship);
                        frm.save();              
                    }
                }
            }
        }
    },

    // consignee_country: async function(frm) 
	// {
	//     if ( frm.doc.consignee_country != null && frm.doc.consignee_country != '' ) 
	//     {
	//         var cities = [];
	//         await frappe.call({
	//             method : "frappe.client.get_list",
	//             args: 
	//             {
    //                 doctype: "City",
    //                 filters: {
    //                   country: frm.doc.consignee_country,
    //                 },
    //                 fields: ["*"],
    //             },
    //             callback: function (response)
    //             {
    //                 for (let i = 0; i < response.message.length; i++) 
    //                 {
    //                     const e = response.message[i];
    //                     cities.push(e.name);
    //                 }
    //             },
	//         });
	//         frm.set_value('consignee_city',null);
    //         frm.set_value('consignee_postal_code',null);
	//         frm.set_query("consignee_city", function () {
    //             return {
    //                 filters: [["City", "name", "in", cities]],
    //             };
    //         });
    //     }
    //     if ( frm.doc.consignee_country == '' ) 
    //     {
    //         frm.set_value('consignee_city',null);
    //         frm.set_value('consignee_postal_code',null);
    //     }

	// },
	
    

	// consignee_country: async function(frm)
	// {
	//     if ( frm.doc.consignee_country != null &&  frm.doc.consignee_country != '' )
	//     {
	//          var pc = [];
	         
	//           await frappe.call({
	//             method : "frappe.client.get_list",
	//             args: 
	//             {
    //                 doctype: "Postal Codes",
    //                 filters: {
    //                   country: frm.doc.consignee_country,
    //                 //   city: frm.doc.consignee_city,                      
    //                 },
    //                 fields: ["*"],
    //             },
    //             callback: function (response)
    //             {
    //                 for (let i = 0; i < response.message.length; i++) 
    //                 {
    //                     const e = response.message[i];
    //                     pc.push(e.name);
    //                 }
    //             },
	//         });
	//        // console.log(pc);
	//         frm.set_value('consignee_postal_code',null);
	//         frm.set_query("consignee_postal_code", function () {
    //             return {
    //                 filters: [["Postal Codes", "name", "in", pc]],
    //             };
    //         });
	//     }
	//     if ( frm.doc.consignee_country == '' ) 
    //     {
    //         frm.set_value('consignee_postal_code',null);
    //     }

	// },

    customer: async function(frm)
    {
        if (frm.doc.customer)
        {


            frm.set_value('address',null);

            await frappe.call({
                method: "courier_service.courier_service.api.api.get_address",
                args: {
                    customer: frm.doc.customer,
                },
                async: false,
                callback: function (r) {
                    if (r.message) {
                        frm.set_query("address", function () {
                            return {
                              filters: [["Address", "name", "in", r.message]],
                            };
                          });
                    }
                },
            });

            frm.set_value('icris_account',null);

            await frappe.call({
                method: "courier_service.courier_service.api.api.get_icris_accounts",
                args: {
                    customer: frm.doc.customer,
                },
                async: false,
                callback: function (r) {
                    if (r.message) {
                        frm.set_query("icris_account", function () {
                            return {
                              filters: [["ICRIS Account", "name", "in", r.message]],
                            };
                          });
                    }
                },
            });





        }
        if (!frm.doc.customer)
        {
            if (frm.doc.address)
            {
                frm.set_value('address',null);
            }
            if (frm.doc.icris_account)
            {
                frm.set_value('icris_account',null);
            }


        }

        if (frm.doc.customer && frm.doc.company) {
            booking_list = await frappe.db.get_list('Booking', {
                filters: {
                    'customer': frm.doc.customer,
                    'company': frm.doc.company,
                    'docstatus': 1
                },
                fields: ['name', 'amount_after_discount']
            });
            let total_credit_limit = 0;
            let credit_limit_used = 0;
            let balance_before_ship = 0;
            if (booking_list)
            {
                for (let booking of booking_list )
                {
                    credit_limit_used += booking.amount_after_discount;
                }
            }
            cust_doc = await frappe.db.get_doc('Customer',frm.doc.customer);
            if (cust_doc.credit_limits)
            {
                for (let row of cust_doc.credit_limits)
                {
                    if (row.company == frm.doc.company)
                    {
                        total_credit_limit = row.credit_limit ;
                        break;
                    }
                }
            }
            balance_before_ship = total_credit_limit - credit_limit_used ;
            if (balance_before_ship <= 0)
            {
                frappe.throw("Customer's Balance Credit Limit is zero." );
            }
            else 
            {    
                frm.set_value('balance_credit_limit_before_shipment',balance_before_ship);
            }
        }

    },

    company: async function(frm)
    {
        if (frm.doc.company && frm.doc.customer)
        {
            booking_list = await frappe.db.get_list('Booking', {
                filters: {
                    'customer': frm.doc.customer,
                    'company': frm.doc.company,
                    'docstatus': 1
                },
                fields: ['name', 'amount_after_discount']
            });
            
            let total_credit_limit = 0;
            let credit_limit_used = 0;
            let balance_before_ship = 0;
            
            for (let booking of booking_list )
            {
                credit_limit_used += booking.amount_after_discount;
            }
            
            // console.log(credit_limit_used);

            cust_doc = await frappe.db.get_doc('Customer',frm.doc.customer);
            if (cust_doc.credit_limits)
            {
                for (let row of cust_doc.credit_limits)
                {
                    if (row.company == frm.doc.company)
                    {
                        total_credit_limit = row.credit_limit ;
                        break;
                    }
                }
            }

            balance_before_ship = total_credit_limit - credit_limit_used ;

            if (balance_before_ship <= 0)
            {
                frappe.throw("Customer's Balance Credit Limit is zero." );
            }
            else 
            {    
                frm.set_value('balance_credit_limit_before_shipment',balance_before_ship);
            }
        }
    },

    // consignee_country: function(frm) {

    //     if (frm.doc.consignee_country) {
    //         frappe.call({
    //             method: "frappe.client.get",
    //             args: {
    //                 doctype: 'Country or Territory',
    //                 filters: { 'name': frm.doc.consignee_country },
    //             },
    //             callback: function(response) {
    //                 if (response.message) {
    //                     var country_doc = response.message;
    //                     var cities = [];
    //                     for (var i = 0; i < country_doc.postal_codes_with_division.length; i++) {
    //                         var city = country_doc.postal_codes_with_division[i].city;
    //                         if (cities.indexOf(city) === -1) {
    //                             cities.push(city);
    //                         }
    //                     }
    //                     var field = frappe.meta.get_docfield('Booking', 'consignee_city', frm.doc.name);
    //                     field.options = cities.join('\n');
    //                     frm.refresh_field('consignee_city');
    //                 }
    //             }
    //         });
    //     }
    // },
    
  
    
    // consignee_city: function(frm){
    //     if (frm.doc.consignee_city){
    //         frappe.call({
    //             method: "frappe.client.get",
    //             args: {
    //                 doctype: 'Country or Territory',
    //                 filters: { 'name': frm.doc.consignee_country },
    //             },
    //             callback: function(response) {
    //                 if (response.message) {
    //                     var country_doc = response.message;
    //                     var postal_codes = [];
    //                     for (var i = 0; i < country_doc.postal_codes_with_division.length; i++) {
    //                         if (country_doc.postal_codes_with_division[i].city == frm.doc.consignee_city ){
    //                             var pc = country_doc.postal_codes_with_division[i].postal_code;
    //                             if (postal_codes.indexOf(pc) === -1) {
    //                                 postal_codes.push(pc);
    //                             }
    //                         }
                            
    //                     }
    //                     var field = frappe.meta.get_docfield('Booking', 'consignee_postal_code', frm.doc.name);
    //                     field.options = postal_codes.join('\n');
    //                     frm.refresh_field('consignee_postal_code');
    //                 }
    //             }
    //         });
    //     }
    // },

    // calculate_total_actual_weight: function(frm){
    //     var temp = 0;
    //     for (let i = 0; i < frm.doc.parcel_information.length; i++) {
    //         const element = frm.doc.parcel_information[i];
    //         temp = temp + element.actual_weight ;
    //         // frm.doc.total_declare_value = frm.doc.total_declare_value + element.declare_value ;
    //     }
    //     frm.doc.total_actual_weight = temp;
    //     cur_frm.refresh_field('total_actual_weight');
        
    // },

    // ic_label : async function(frm)
    // {

    //     if (frm.doc.imp__exp == 'Import')
    //     {
    //         if (frm.doc.ic_label == 1)
    //         { 
    //             await frappe.call({
    //                 method: "courier_service.courier_service.api.api.ic_label",
    //                 args: {
    //                     add_charge_type: 'Import Control Label',
    //                     add_charge_check : frm.doc.ic_label, 
    //                 },
    //                 async: false,
    //                 callback: function (r) {
    //                     if (r.message) {
    //                         console.log(r.message);
    //                         frm.set_value('total_additional_charges',(frm.doc.total_additional_charges+r.message));
    //                     }
    //                 },
    //             });
    //         }
    //         else if (frm.doc.ic_label == 0)
    //         {
    //             await frappe.call({
    //                 method: "courier_service.courier_service.api.api.ic_label",
    //                 args: {
    //                     add_charge_type: 'Import Control Label',
    //                     add_charge_check : frm.doc.ic_label, 
    //                 },
    //                 async: false,
    //                 callback: function (r) {
    //                     if (r.message) {
    //                         console.log(r.message);
    //                         frm.set_value('total_additional_charges',(frm.doc.total_additional_charges-r.message));
    //                     }
    //                 },
    //             });              
    //         }
    //     }    

    // },

    // return_electronic_label : async function(frm)
    // {

    //     if (frm.doc.imp__exp == 'Import')
    //     {
    //         if (frm.doc.return_electronic_label == 1)
    //         { 
    //             await frappe.call({
    //                 method: "courier_service.courier_service.api.api.ic_label",
    //                 args: {
    //                     add_charge_type: 'Return Electronic Label',
    //                     add_charge_check : frm.doc.return_electronic_label, 
    //                 },
    //                 async: false,
    //                 callback: function (r) {
    //                     if (r.message) {
    //                         console.log(r.message);
    //                         frm.set_value('total_additional_charges',(frm.doc.total_additional_charges+r.message))
    //                     }
    //                 },
    //             });
    //         }
    //         else if (frm.doc.return_electronic_label == 0)
    //         {
    //             await frappe.call({
    //                 method: "courier_service.courier_service.api.api.ic_label",
    //                 args: {
    //                     add_charge_type: 'Return Electronic Label',
    //                     add_charge_check : frm.doc.return_electronic_label, 
    //                 },
    //                 async: false,
    //                 callback: function (r) {
    //                     if (r.message) {
    //                         console.log(r.message);
    //                         frm.set_value('total_additional_charges',(frm.doc.total_additional_charges-r.message))
    //                     }
    //                 },
    //             });
    //         }
    //     }    
    // },

    // duty_tax_forwarding: async function(frm)
    // {
    //     if (frm.doc.duty_tax_forwarding == 1)
    //     { 
    //         // console.log('yes');
    //         await frappe.call({
    //             method: "courier_service.courier_service.api.api.ic_label",
    //             args: {
    //                 add_charge_type: 'Duty & Tax Forwarding',
    //                 add_charge_check : frm.doc.duty_tax_forwarding, 
    //             },
    //             async: false,
    //             callback: function (r) {
    //                 if (r.message) {
    //                     console.log(r.message);
    //                     frm.set_value('total_additional_charges',(frm.doc.total_additional_charges+r.message));
    //                 }
    //             },
    //         });
    //     }
    //     else if (frm.doc.duty_tax_forwarding == 0)
    //     { 
    //         await frappe.call({
    //             method: "courier_service.courier_service.api.api.ic_label",
    //             args: {
    //                 add_charge_type: 'Duty & Tax Forwarding',
    //                 add_charge_check : frm.doc.duty_tax_forwarding,
    //             },
    //             async: false,
    //             callback: function (r) {
    //                 if (r.message) {
    //                     console.log(r.message);
    //                     frm.set_value('total_additional_charges',(frm.doc.total_additional_charges-r.message));
    //                 }
    //             },
    //         });
    //     }

    // },

    // residential_surcharge: async function(frm)
    // {
    //     if (frm.doc.residential_surcharge == 1)
    //     { 
    //         // console.log('yes');
    //         await frappe.call({
    //             method: "courier_service.courier_service.api.api.ic_label",
    //             args: {
    //                 add_charge_type: 'Residential Surcharge',
    //                 add_charge_check : frm.doc.residential_surcharge, 
    //             },
    //             async: false,
    //             callback: function (r) {
    //                 if (r.message) {
    //                     console.log(r.message);
    //                     frm.set_value('total_additional_charges',(frm.doc.total_additional_charges+r.message));
    //                 }
    //             },
    //         });
    //     }
    //     else if (frm.doc.residential_surcharge == 0)
    //     { 
    //         await frappe.call({
    //             method: "courier_service.courier_service.api.api.ic_label",
    //             args: {
    //                 add_charge_type: 'Residential Surcharge',
    //                 add_charge_check : frm.doc.residential_surcharge,
    //             },
    //             async: false,
    //             callback: function (r) {
    //                 if (r.message) {
    //                     console.log(r.message);
    //                     frm.set_value('total_additional_charges',(frm.doc.total_additional_charges-r.message));
    //                 }
    //             },
    //         });
    //     }

    // },

    // shipping_bill_charges: async function(frm)
    // {
    //     if (frm.doc.shipping_bill_charges == 1)
    //     { 
    //         await frappe.call({
    //             method: "courier_service.courier_service.api.api.duty_tax",
    //             args: {
    //                 add_charge_type: 'Shipping Bill Charges',
    //                 impexp : frm.doc.imp__exp , 
    //             },
    //             async: false,
    //             callback: function (r) {
    //                 if (r.message) {
    //                     console.log(r.message);
    //                     frm.set_value('sbc',(frm.doc.sbc+r.message));
    //                 }
    //             },
    //         });
    //     }
    //     else if (frm.doc.shipping_bill_charges == 0)
    //     { 
    //         await frappe.call({
    //             method: "courier_service.courier_service.api.api.duty_tax",
    //             args: {
    //                 add_charge_type: 'Shipping Bill Charges',
    //                 impexp : frm.doc.imp__exp , 
    //             },
    //             async: false,
    //             callback: function (r) {
    //                 if (r.message) {
    //                     console.log(r.message);
    //                     frm.set_value('sbc',(frm.doc.sbc-r.message));
    //                 }
    //             },
    //         });
    //     }
        
    // },

    // extended_area_surcharge : async function(frm)
    // {
    //     if (frm.doc.extended_area_surcharge == 1)
    //     { 
    //         await frappe.call({
    //             method: "courier_service.courier_service.api.api.area",
    //             args: {
    //                 add_charge_type: 'Extended Area Surcharge',
    //                 weight: frm.doc.weight,
    //             },
    //             async: false,
    //             callback: function (r) {
    //                 if (r.message) {
    //                     if (frm.doc.remote_area_surcharge == 1)
    //                     {
    //                         frm.set_value('remote_area_surcharge',0);
    //                     }
    //                     frm.set_value('total_additional_charges',(frm.doc.total_additional_charges+r.message));
    //                 }
    //             },
    //         });
    //     }
    //     else if (frm.doc.extended_area_surcharge == 0)
    //     {
    //         await frappe.call({
    //             method: "courier_service.courier_service.api.api.area",
    //             args: {
    //                 add_charge_type: 'Extended Area Surcharge',
    //                 weight: frm.doc.weight,
    //             },
    //             async: false,
    //             callback: function (r) {
    //                 if (r.message) {
    //                     frm.set_value('total_additional_charges',(frm.doc.total_additional_charges-r.message));
    //                 }
    //             },
    //         });
    //     }
    // },

    // remote_area_surcharge : async function(frm)
    // {
    //     if (frm.doc.remote_area_surcharge == 1)
    //     { 
    //         await frappe.call({
    //             method: "courier_service.courier_service.api.api.area",
    //             args: {
    //                 add_charge_type: 'Remote Area Surcharge',
    //                 weight: frm.doc.weight,
    //             },
    //             async: false,
    //             callback: function (r) {
    //                 if (r.message) {
    //                     if (frm.doc.extended_area_surcharge == 1)
    //                     {
    //                         frm.set_value('extended_area_surcharge',0);
    //                     }
    //                     frm.set_value('total_additional_charges',(frm.doc.total_additional_charges+r.message));
    //                 }
    //             },
    //         });
    //     }
    //     else if (frm.doc.remote_area_surcharge == 0)
    //     {
    //         await frappe.call({
    //             method: "courier_service.courier_service.api.api.area",
    //             args: {
    //                 add_charge_type: 'Remote Area Surcharge',
    //                 weight: frm.doc.weight,
    //             },
    //             async: false,
    //             callback: function (r) {
    //                 if (r.message) {
    //                     console.log(r.message);
    //                     frm.set_value('total_additional_charges',(frm.doc.total_additional_charges-r.message));
    //                 }
    //             },
    //         });
    //     }
    // },

    // add_handling_charges: async function(frm) {
    //     let add_charge_type = 'Additional Handling Charges';
    //     let name = frm.doc.name;
    //     let add_charge_doc = await frappe.db.get_doc('Additional Charges', add_charge_type);
    //         // let booking_doc = await frappe.db.get_doc('Booking', name);
    //     let actual_weight = 0;
    //     let no_of_pkg_for_avg = 0;
    //     let single_pkg_no = 0;
    //     let single_pkg_no_for_dim = 0;
    //     let avg = 0;
        
    //     for (let row of frm.doc.parcel_information) {
    //         if (row.packaging_type)
    //         {
    //             var pkg_doc = await frappe.db.get_doc("Package Types", row.packaging_type);
    //         }
    //         else {
    //             frappe.throw("Complete Package Details.");             
    //         }
    //         if (pkg_doc.package == 1) {
    //             no_of_pkg_for_avg += row.total_identical_parcels;
    //             actual_weight += row.actual_weight;
    //             if (row.actual_weight_per_parcel > add_charge_doc.max_weight) {
    //                 single_pkg_no += row.total_identical_parcels;
    //             }
    //             else if (row.length > add_charge_doc.max_length || (Math.max(row.width,row.height)) > add_charge_doc.max_width )
    //             {
    //                 single_pkg_no_for_dim += row.total_identical_parcels;
    //             }
    //         }
    //     }
    //     if (no_of_pkg_for_avg > 0) {
    //         avg = actual_weight / no_of_pkg_for_avg;
    //     }
    //     let additional_charges = 0;
    //     if (avg > add_charge_doc.max_weight) {
    //         additional_charges += Math.max(no_of_pkg_for_avg * add_charge_doc.amount, add_charge_doc.minimum_amount);
    //     } 
    //     else {
    //         if (single_pkg_no > 0) {
    //             additional_charges += Math.max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount);
    //         }
    //         if (single_pkg_no_for_dim > 0)
    //         {
    //             additional_charges += Math.max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount);
    //         }
    //     }

            
    //     if (frm.doc.add_handling_charges == 1) {
    //         if (frm.doc.lps == 1)
    //         {
    //             frm.set_value('lps',0)
    //         }
    //         frm.set_value('total_additional_charges', frm.doc.total_additional_charges + additional_charges);
    //     }
    //     else if (frm.doc.add_handling_charges == 0) {
    //         frm.set_value('total_additional_charges', frm.doc.total_additional_charges - additional_charges);
    //     }
    // },

    // lps: async function(frm)
    // {
    //     let add_charge_type = 'Large Package Surcharge';
    //     let add_charge_doc = await frappe.db.get_doc('Additional Charges', add_charge_type);
    //     let actual_weight = 0;
    //     let no_of_pkg_for_avg = 0;
    //     let single_pkg_no = 0;
    //     let single_pkg_no_for_dim = 0;
    //     let avg = 0;
        
    //     for (let row of frm.doc.parcel_information) {
    //         if (row.packaging_type)
    //         {
    //             var pkg_doc = await frappe.db.get_doc("Package Types", row.packaging_type);
    //         }
    //         else {
    //             frappe.throw("Complete Package Details.");             
    //         }
    //         if (pkg_doc.package == 1) {
    //             no_of_pkg_for_avg += row.total_identical_parcels;
    //             actual_weight += row.actual_weight;
    //             if (row.actual_weight_per_parcel > add_charge_doc.max_weight) {
    //                 single_pkg_no += row.total_identical_parcels;
    //             }
    //             else if (  (row.length+((2*row.width)+(2*row.height))) > add_charge_doc.max_length_plus_girth  )
    //             {
    //                 single_pkg_no_for_dim += row.total_identical_parcels;
    //             }
    //         }
    //     }

    //     let additional_charges = 0;
    //     if (single_pkg_no > 0)
    //     {
    //         additional_charges += Math.max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount);
    //     }
    //     if (single_pkg_no_for_dim > 0)
    //     {
    //         additional_charges += Math.max(single_pkg_no * add_charge_doc.amount, add_charge_doc.minimum_amount);
    //     }
    //     if (frm.doc.lps == 1) {
    //         if (frm.doc.add_handling_charges == 1)
    //         {
    //             frm.set_value('add_handling_charges',0);
    //         }
    //         frm.set_value('total_additional_charges', frm.doc.total_additional_charges + additional_charges);
    //     }
    //     else if (frm.doc.lps == 0) {
    //         frm.set_value('total_additional_charges', frm.doc.total_additional_charges - additional_charges);
    //     }




    // },

    discount_percentage: function(frm)
    {
        if (frm.doc.discount_percentage)
        {
            let dis = frm.doc.freight * frm.doc.discount_percentage / 100.0 ;
            let total =  frm.doc.freight - dis ;
            frm.set_value('amount_after_discount',total);
        }
    },


   



   






    refresh : function(frm) {

        if (frm.doc.item && frm.doc.docstatus === 1 && frm.doc.invoice_submitted != 1 ) {
            frm.add_custom_button(
                __("Sales Invoice"),
                function () {

                    frappe.call({
                        method: 'frappe.client.insert',
                        args: {
                            doc: {  doctype: 'Sales Invoice',
                                    customer: frm.doc.customer,
                                    custom_booking : frm.doc.name,
                                    items: [{"item_code": frm.doc.item,
                                            "qty": 1,
                                            "rate" : frm.doc.amount_after_discount,
                                            "amount" : frm.doc.amount_after_discount, 
                                            }]
                                 },
                        },
                        callback: function(r) {
                                    frappe.set_route("Form", "Sales Invoice", r.message.name);
                            }
                    });

                },
                __("Create")
            );
            frm.page.set_inner_btn_group_as_primary(__("Create"));
        }
        
        
    },


});















frappe.ui.form.on("Parcel Information", {


    total_identical_parcels: function(frm) {
        
        let total_act_w = 0;
        for (let i = 0; i < frm.doc.parcel_information.length; i++) {
            const element = frm.doc.parcel_information[i];

            if(element.weight_per_parcel){
                element.total_weight = element.total_identical_parcels * element.weight_per_parcel;
                if(element.length && element.width && element.height){
                    element.total_dim_weight = ( element.length * element.width * element.height / 5000 ) * element.total_identical_parcels;
                }
                // element.
            }
            cur_frm.refresh_field('parcel_information');
            if(element.weight_per_parcel && element.length && element.height && element.width){
                if(element.total_weight > (element.dim_weight * element.total_identical_parcels)){
                    element.actual_weight = element.total_weight;
                    element.actual_weight_per_parcel = element.weight_per_parcel;
                }
                else {
                    element.actual_weight = element.dim_weight * element.total_identical_parcels;
                    element.actual_weight_per_parcel = element.dim_weight;
                }
                // frm.trigger("calculate_total_actual_weight");
            }
            cur_frm.refresh_field('parcel_information');
            if (element.weight_per_parcel)
            {
                total_act_w += element.actual_weight;
            }
        }
        frm.set_value('weight',total_act_w);
        frm.set_value('total_actual_weight',total_act_w);
        
    },
    weight_per_parcel: function(frm) {
        let total_act_w = 0;
        for (let i = 0; i < frm.doc.parcel_information.length; i++) {
            const element = frm.doc.parcel_information[i];
            if(element.total_identical_parcels){
                element.total_weight = element.total_identical_parcels * element.weight_per_parcel;
            }
            cur_frm.refresh_field('parcel_information');
            if(element.total_identical_parcels && element.length && element.height && element.width){
                if(element.total_weight > (element.dim_weight * element.total_identical_parcels)){
                    element.actual_weight = element.total_weight;
                    element.actual_weight_per_parcel = element.weight_per_parcel;
                }
                else {
                    element.actual_weight = element.dim_weight * element.total_identical_parcels;
                    element.actual_weight_per_parcel = element.dim_weight;
                }
                // frm.trigger("calculate_total_actual_weight");
            }
            cur_frm.refresh_field('parcel_information');
            if (element.total_identical_parcels)
            {
                total_act_w += element.actual_weight;
            }
        }
        frm.set_value('weight',total_act_w);
        frm.set_value('total_actual_weight',total_act_w);
    },

    length: async function(frm) {
        for (let i = 0; i < frm.doc.parcel_information.length; i++) {
            let pdl = await frappe.db.get_doc('Package Dimensions Limitation','Package Dimensions Limitation');
            const element = frm.doc.parcel_information[i];
            if (element.length > pdl.max_length ) {
                element.length = 1;
                frappe.throw("Maximum length per package is 270 cm.");
            }

                if (element.length < element.height || element.length < element.width ) {
                    frappe.model.set_value(element.doctype,element.name,'length',1);
                    frappe.model.set_value(element.doctype,element.name,'width',1);
                    frappe.model.set_value(element.doctype,element.name,'height',1);
                    frappe.throw("Length must be the Longest side.");
                }
                var girth = (element.width*2) + (element.height*2);
                var size = element.length + girth;
                if(size > pdl.max_girth ) {
                    frappe.model.set_value(element.doctype,element.name,'length',1);
                    frappe.model.set_value(element.doctype,element.name,'width',1);
                    frappe.model.set_value(element.doctype,element.name,'height',1);
                    frappe.throw("Maximum size per package should not be Greater than 400cm in Length and Girth[(2 x width) + (2 x height)] combined.");    
                }
                element.dim_weight = element.length * element.width * element.height / 5000;
                if(element.total_identical_parcels){
                    element.total_dim_weight = ( element.length * element.width * element.height / 5000 ) * element.total_identical_parcels;
                }
            cur_frm.refresh_field('parcel_information');
            if(element.total_identical_parcels && element.weight_per_parcel ){
                if(element.total_weight > (element.dim_weight * element.total_identical_parcels)){
                    element.actual_weight = element.total_weight;
                    element.actual_weight_per_parcel = element.weight_per_parcel;
                }
                else {
                    element.actual_weight = element.dim_weight * element.total_identical_parcels;
                    element.actual_weight_per_parcel = element.dim_weight;
                }
                // frm.trigger("calculate_total_actual_weight");
            }
            cur_frm.refresh_field('parcel_information');
        }
    },
    height: async function(frm) {
        for (let i = 0; i < frm.doc.parcel_information.length; i++) {
            let pdl = await frappe.db.get_doc('Package Dimensions Limitation','Package Dimensions Limitation');
            const element = frm.doc.parcel_information[i];
            if (element.height > pdl.max_length ) {
                element.height = 1;
                frappe.throw("No side should be Greater than 270 cm.");
            }
            // if(element.length && element.width && element.height){
                if (element.length < element.height || element.length < element.width ) {
                    frappe.model.set_value(element.doctype,element.name,'length',1);
                    frappe.model.set_value(element.doctype,element.name,'width',1);
                    frappe.model.set_value(element.doctype,element.name,'height',1);
                    // element.length = 1;
                    // element.width = 1;
                    // element.height = 1;
                    frappe.throw("Longest side must be the Length.");
                }
                var girth = (element.width*2) + (element.height*2);
                var size = element.length + girth;
                if(size > pdl.max_girth ) {
                    frappe.model.set_value(element.doctype,element.name,'length',1);
                    frappe.model.set_value(element.doctype,element.name,'width',1);
                    frappe.model.set_value(element.doctype,element.name,'height',1);
                    // element.length = 1;
                    // element.width = 1;
                    // element.height = 1;
                    frappe.throw("Maximum size per package should not be Greater than 400cm in Length and Girth[(2 x width) + (2 x height)] combined.");    
                }
                element.dim_weight = element.length * element.width * element.height / 5000;
                if(element.total_identical_parcels){
                    element.total_dim_weight = ( element.length * element.width * element.height / 5000 ) * element.total_identical_parcels;
                }
            // }
            cur_frm.refresh_field('parcel_information');
            if(element.total_identical_parcels && element.weight_per_parcel ){
                if(element.total_weight > (element.dim_weight * element.total_identical_parcels)){
                    element.actual_weight = element.total_weight;
                    element.actual_weight_per_parcel = element.weight_per_parcel;
                }
                else {
                    element.actual_weight = element.dim_weight * element.total_identical_parcels;
                    element.actual_weight_per_parcel = element.dim_weight;
                }
                // frm.trigger("calculate_total_actual_weight");
            }
            cur_frm.refresh_field('parcel_information');
        }
    },
    width: async function(frm) {
        for (let i = 0; i < frm.doc.parcel_information.length; i++) {
            let pdl = await frappe.db.get_doc('Package Dimensions Limitation','Package Dimensions Limitation');
            const element = frm.doc.parcel_information[i];
            if (element.width > pdl.max_length ) {
                element.width = 1;
                frappe.throw("No side should be Greater than 270 cm.");
            }

                if (element.length < element.height || element.length < element.width ) {
                    frappe.model.set_value(element.doctype,element.name,'length',1);
                    frappe.model.set_value(element.doctype,element.name,'width',1);
                    frappe.model.set_value(element.doctype,element.name,'height',1);
                    frappe.throw("Longest side must be the Length");
                }
                var girth = (element.width*2) + (element.height*2);
                var size = element.length + girth;
                if(size > pdl.max_girth ) {
                    frappe.model.set_value(element.doctype,element.name,'length',1);
                    frappe.model.set_value(element.doctype,element.name,'width',1);
                    frappe.model.set_value(element.doctype,element.name,'height',1);
                    frappe.throw("Maximum size per package should not be Greater than 400cm in Length and Girth[(2 x width) + (2 x height)] combined.");    
                }
                element.dim_weight = element.length * element.width * element.height / 5000;
                if(element.total_identical_parcels){
                    element.total_dim_weight = ( element.length * element.width * element.height / 5000 ) * element.total_identical_parcels;
                }
            
            cur_frm.refresh_field('parcel_information');
            if(element.total_identical_parcels && element.weight_per_parcel && element.height && element.length && element.width){
                if(element.total_weight > (element.dim_weight * element.total_identical_parcels)){
                    element.actual_weight = element.total_weight;
                    element.actual_weight_per_parcel = element.weight_per_parcel;
                }
                else {
                    element.actual_weight = element.dim_weight * element.total_identical_parcels;
                    element.actual_weight_per_parcel = element.dim_weight;
                }
                // frm.trigger("calculate_total_actual_weight");
            }
            cur_frm.refresh_field('parcel_information');
        }
    },

    declare_value: async function(frm){
        let temp = 0;
        for (let i = 0; i < frm.doc.parcel_information.length; i++) {
            const element = frm.doc.parcel_information[i];
            temp = temp + element.declare_value ;
            // frm.doc.total_declare_value = frm.doc.total_declare_value + element.declare_value ;
        }
            frm.set_value('total_declare_value' , temp);
            let ins_doc = await frappe.db.get_doc('Additional Charges','Declare Value');
            if (frm.doc.total_declare_value > 0)
            {
                frm.set_value('insurance' , (Math.max((temp*ins_doc.percentage/100.0) , ins_doc.minimum_amount)) );
                // cur_frm.refresh_field('total_declare_value');
            }
            else {
                frm.set_value('insurance' , 0 );
            }
        
    },

    async parcel_information_remove(frm,cdt,cdn)
    {
        let total_act_w = 0;
        let temp = 0;
        for (let i = 0; i < frm.doc.parcel_information.length; i++) 
        {
            const element = frm.doc.parcel_information[i];
            total_act_w += element.actual_weight;
            temp += element.declare_value ;
        }
        frm.set_value('total_declare_value' , temp);
        let ins_doc = await frappe.db.get_doc('Additional Charges','Declare Value');
        if (frm.doc.total_declare_value > 0)
        {
            frm.set_value('insurance' , (Math.max((temp*ins_doc.percentage/100.0) , ins_doc.minimum_amount)) );
        }
        else {
            frm.set_value('insurance' , 0 );
        }
        
        
        frm.set_value('weight',total_act_w);
        frm.set_value('total_actual_weight',total_act_w);
    },



    




});
