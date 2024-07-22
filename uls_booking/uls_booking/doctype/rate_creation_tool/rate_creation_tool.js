// Copyright (c) 2024, Sowaan and contributors
// For license information, please see license.txt


frappe.ui.form.on("Rate Creation Tool", {


    refresh: async function(frm) {
        
        frm.add_custom_button('Buying Rate', async () => {
            await frm.events.create_rate(frm, 'Buying Rate');
        }, __("Create"));
        
        frm.add_custom_button('Selling Rate', async () => {
            let res = await frm.events.first_check_buying_rate(frm);
            if (res == 1) {
                await frm.events.create_rate(frm, 'Selling Rate');
            }
        }, __("Create"));
    
        setTimeout(() => {
            frm.page.wrapper.find('.btn-group .btn').filter((index, button) => {
                return $(button).text().trim() === 'Create';
            }).css({
                'background-color': 'black',
                'color': 'white'
            });
        }, 100);

    },
    

    
    



    first_check_buying_rate : async function (frm) {

            let res;
            if( !frm.doc.service_type )
            {
                frappe.msgprint("Enter Service Type");
            }
            else if( !frm.doc.full_tariff )
            {
                frappe.msgprint("Enter Full Tariff");
            }
            else if( !frm.doc.icris_account )
            {
                frappe.msgprint("Enter ICRIS Account");
            }        
            else if ( !frm.doc.weight_slab || !frm.doc.weight_slab.length )
            {
                frappe.msgprint("Enter Values in Weight Slab Table");
            } 
            else if(frm.doc.service_type && frm.doc.full_tariff && frm.doc.icris_account && frm.doc.weight_slab.length )
            {
                await frappe.call({
                    method: "uls_booking.uls_booking.api.api.first_check_buying_rate",
                    args: {
                        full_tariff : frm.doc.full_tariff,
                        icris_account : frm.doc.icris_account,
                    },
                    freeze : true ,
                    callback: function (r) {
                        if (r.message) {
                            if (r.message == 2) {
                                frappe.msgprint("First create Buying Rate.");
                                res = 2 ;
                            }
                            else if (r.message == 1) {
                                res = 1 ;
                            }
                        }
                    },
                });
                return res;   
            }

    },



 


    create_rate : async function(frm, rate_type) {


            if( !frm.doc.service_type )
            {
                frappe.msgprint("Enter Service Type");
            }
            else if( !frm.doc.full_tariff )
            {
                frappe.msgprint("Enter Full Tariff");
            }
            else if( !frm.doc.icris_account )
            {
                frappe.msgprint("Enter ICRIS Account");
            }        
            else if ( !frm.doc.weight_slab || !frm.doc.weight_slab.length )
            {
                frappe.msgprint("Enter Values in Weight Slab Table");
            } 
            else if(frm.doc.service_type && frm.doc.full_tariff && frm.doc.icris_account && frm.doc.weight_slab.length )
            {
                        
                let full_tariff = await frappe.db.get_doc('Full Tariff',frm.doc.full_tariff) ;
                let valid = true;
                let prev_to_weight = null;

                if (frm.doc.weight_slab[0].from_weight > full_tariff.package_rate[0].weight) {
                    valid = false;
                    frappe.msgprint(`The From Weight in the first row must be less than or equal to the Weight of the first row in Package Rate of ${frm.doc.full_tariff}.`);
                }
                if (frm.doc.weight_slab[frm.doc.weight_slab.length - 1].to_weight < full_tariff.package_rate[full_tariff.package_rate.length - 1].weight) {
                    valid = false;
                    frappe.msgprint(`The To Weight in the last row must be greater than or equal to the Weight of the last row in Package Rate of ${frm.doc.full_tariff}.`);
                }

                frm.doc.weight_slab.forEach((row, idx) => {
                    if (idx > 0) {
                        if (row.from_weight !== prev_to_weight + 0.5) {
                            valid = false;
                            frappe.msgprint(`Row ${idx + 1}: From Weight' must be 0.5 greater than To Weight' of the previous row.`);
                        }
                    }
                    prev_to_weight = row.to_weight;
                });

                if (valid) {

                        await frappe.call({
                            method: "uls_booking.uls_booking.api.api.check_for_existing_rate",
                            args: {
                                full_tariff : frm.doc.full_tariff,
                                icris_account : frm.doc.icris_account,
                                weight_slab : frm.doc.weight_slab,
                                rate_type : rate_type,
                            },
                            freeze : true ,
                            // async: false,
                            callback: function (r) {
                                if (r.message) {
                                    // console.log(r.message);
                                    frappe.confirm('Rate already exist. Do you want to replace it ?',
                                        async () => {
                                            await frappe.call({
                                                method: "uls_booking.uls_booking.api.api.create_rate",
                                                args: {
                                                    full_tariff : frm.doc.full_tariff,
                                                    icris_account : frm.doc.icris_account,
                                                    weight_slab : frm.doc.weight_slab,
                                                    exist : r.message,
                                                    rate_type : rate_type,
                                                },
                                                freeze : true ,
                                                // async: false,
                                                callback: function (r) {
                                                    if (r.message) {
                                                        // console.log(r.message);
                                                    }
                                                },
                                            });
                                        }, () => {
                                            // action to perform if No is selected
                                    })
                                }
                            },
                        });
                }

            }

    } ,


   
    service_type: async function(frm) {
        if (frm.doc.service_type) {
            frm.toggle_display('full_tariff', true);
            // frm.toggle_reqd('full_tariff', true);

            frm.set_value('full_tariff',null);
            await frappe.call({
                method: "uls_booking.uls_booking.api.api.get_full_tariff",
                args: {
                    service_type : frm.doc.service_type,
                },
                async: false,
                callback: function (r) {
                    if (r.message) {
                        frm.set_query("full_tariff", function () {
                            return {
                              filters: [["Full Tariff", "name", "in", r.message]],
                            };
                          });
                    }
                },
            });

        } else {
            frm.set_value('full_tariff',null);
            frm.toggle_display('full_tariff', false);
            // frm.toggle_reqd('full_tariff', false);
        }
    },

    full_tariff :async function(frm)
    {
        if (!frm.doc.full_tariff)
        {
            // frm.set_value("icris_account",null);
            frm.set_value("weight_slab",null);
        } 
    }

});










   // refresh: async function(frm) {

    //     let button = frm.add_custom_button('Create Selling Rate', async () => {
            
    //         // console.log(full_tariff.package_rate);
            
    //         if( !frm.doc.service_type )
    //         {
    //             frappe.msgprint("Enter Service Type");
    //         }
    //         else if( !frm.doc.full_tariff )
    //         {
    //             frappe.msgprint("Enter Full Tariff");
    //         }
    //         else if( !frm.doc.icris_account )
    //         {
    //             frappe.msgprint("Enter ICRIS Account");
    //         }
                
    //         else if ( !frm.doc.weight_slab.length )
    //         {
    //             frappe.msgprint("Enter Values in Weight Slab Table");
    //         } 
    //         else if(frm.doc.service_type && frm.doc.full_tariff && frm.doc.icris_account && frm.doc.weight_slab.length )
    //         {
                        
    //             let full_tariff = await frappe.db.get_doc('Full Tariff',frm.doc.full_tariff) ;
    //             let valid = true;
    //             let prev_to_weight = null;

    //             if (frm.doc.weight_slab[0].from_weight > full_tariff.package_rate[0].weight) {
    //                 valid = false;
    //                 frappe.msgprint(`The From Weight in the first row must be less than or equal to the Weight of the first row in Package Rate of ${frm.doc.full_tariff}.`);
    //             }
    //             if (frm.doc.weight_slab[frm.doc.weight_slab.length - 1].to_weight < full_tariff.package_rate[full_tariff.package_rate.length - 1].weight) {
    //                 valid = false;
    //                 frappe.msgprint(`The To Weight in the last row must be greater than or equal to the Weight of the last row in Package Rate of ${frm.doc.full_tariff}.`);
    //             }

    //             frm.doc.weight_slab.forEach((row, idx) => {
    //                 if (idx > 0) {
    //                     if (row.from_weight !== prev_to_weight + 0.5) {
    //                         valid = false;
    //                         frappe.msgprint(`Row ${idx + 1}: From Weight' must be 0.5 greater than To Weight' of the previous row.`);
    //                     }
    //                 }
    //                 prev_to_weight = row.to_weight;
    //             });

    //             if (valid) {

    //                     await frappe.call({
    //                         method: "uls_booking.uls_booking.api.api.check_for_existing_rate",
    //                         args: {
    //                             full_tariff : frm.doc.full_tariff,
    //                             icris_account : frm.doc.icris_account,
    //                             weight_slab : frm.doc.weight_slab,
    //                         },
    //                         async: false,
    //                         callback: function (r) {
    //                             if (r.message) {
    //                                 console.log(r.message);
    //                                 frappe.confirm('Rate already exist. Do you want to replace it ?',
    //                                     async () => {
    //                                         await frappe.call({
    //                                             method: "uls_booking.uls_booking.api.api.create_selling_rate",
    //                                             args: {
    //                                                 full_tariff : frm.doc.full_tariff,
    //                                                 icris_account : frm.doc.icris_account,
    //                                                 weight_slab : frm.doc.weight_slab,
    //                                                 exist : r.message,
    //                                             },
    //                                             async: false,
    //                                             callback: function (r) {
    //                                                 if (r.message) {
    //                                                     console.log(r.message);
    //                                                 }
    //                                             },
    //                                         });
    //                                     }, () => {
    //                                         // action to perform if No is selected
    //                                 })
    //                             }
    //                         },
    //                     });
    //             }

    //         }


    //     });
        
    //     $(button).css({
    //         'background-color': 'black',
    //         'color': 'white',
    //         'border-color': 'black'
    //     });
    // },
