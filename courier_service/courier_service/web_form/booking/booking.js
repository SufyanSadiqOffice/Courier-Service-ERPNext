// Bind event handler to the web form








frappe.ready(async function() {
  

    
        frappe.web_form.on('customer', async (field, value) => {
            var customer = value ;
            if (customer) {

                frappe.web_form.get_field("ic_label").df.read_only = 0;
                frappe.web_form.get_field("ic_label").refresh();
                frappe.web_form.get_field("return_electronic_label").df.read_only = 0;
                frappe.web_form.get_field("return_electronic_label").refresh();
                frappe.web_form.get_field("saturday_delivery").df.read_only = 0;
                frappe.web_form.get_field("saturday_delivery").refresh();
                frappe.web_form.get_field("shipping_bill_charges").df.read_only = 0;
                frappe.web_form.get_field("shipping_bill_charges").refresh();
                frappe.web_form.get_field("direct_delivery").df.read_only = 0;
                frappe.web_form.get_field("direct_delivery").refresh();
                frappe.web_form.get_field("duty_tax_forwarding").df.read_only = 0;
                frappe.web_form.get_field("duty_tax_forwarding").refresh();
                frappe.web_form.get_field("signature_options").df.read_only = 0;
                frappe.web_form.get_field("signature_options").refresh();
                frappe.web_form.get_field("residential_surcharge").df.read_only = 0;
                frappe.web_form.get_field("residential_surcharge").refresh();
                
                let c = await frappe.call({
                    method: "frappe.client.get",
                    args: {
                        doctype: "Customer",
                        name: customer,
                        filters: {
                            ignore_permissions: true
                        }
                    }
                }).then(r => r.message);
    
                if ( c.custom_import_control == 0 )
                {
                    frappe.web_form.get_field("ic_label").df.read_only = 1;
                    frappe.web_form.get_field("ic_label").refresh();
                }
                if ( c.custom_return_electronic_label == 0 )
                {
                    frappe.web_form.get_field("return_electronic_label").df.read_only = 1;
                    frappe.web_form.get_field("return_electronic_label").refresh();
                }     
                if ( c.custom_allow_saturday_delivery == 0 )
                {
                    frappe.web_form.get_field("saturday_delivery").df.read_only = 1;
                    frappe.web_form.get_field("saturday_delivery").refresh();
                }
                if ( c.custom_shipping_bill_charges_applicable == 0 )
                {
                    frappe.web_form.get_field("shipping_bill_charges").df.read_only = 1;
                    frappe.web_form.get_field("shipping_bill_charges").refresh();
                }
                if ( c.custom_allow_direct_delivery_only == 0 )
                {
                    frappe.web_form.get_field("direct_delivery").df.read_only = 1;
                    frappe.web_form.get_field("direct_delivery").refresh();
                }    
                if ( c.custom_dutytax_forwarding_surcharge == 0 )
                {
                    frappe.web_form.get_field("duty_tax_forwarding").df.read_only = 1;
                    frappe.web_form.get_field("duty_tax_forwarding").refresh();
                }
                if ( c.custom_allow_delivery_confirmation_signature == 0 )
                {
                    frappe.web_form.get_field("signature_options").df.read_only = 1;
                    frappe.web_form.get_field("signature_options").refresh();
                }
                if ( c.custom_residential_surcharge == 0 )
                {
                    frappe.web_form.get_field("residential_surcharge").df.read_only = 1;
                    frappe.web_form.get_field("residential_surcharge").refresh();
                }
                // if ( c.custom__allow_delivery_confirmation_adult_signature == 0 && c.custom_allow_delivery_confirmation_signature == 1 )
                // {
                //     frappe.web_form.set_value("select_signature_option", null);
                //     var field = frappe.web_form.get_field("select_signature_option");
                //     field._data = ["Delivery Confirmation Signature"];
                //     field.refresh();
                // }
                // if ( c.custom__allow_delivery_confirmation_adult_signature == 1 && c.custom_allow_delivery_confirmation_signature == 0 )
                // {
                //     frappe.web_form.set_value("select_signature_option", null);
                //     var field = frappe.web_form.get_field("select_signature_option");
                //     var options = [];
                //     options.push({
                //         'label': "Delivery Confirmation Adult Signature",
                //         'value': "Delivery Confirmation Adult Signature",
                //     });
                //     field._data = "Delivery Confirmation Adult Signature";
                //     field.refresh();
                //     console.log("yes1");
                //     console.log(field._data);
                // }

                


                await frappe.call({
                    method: "courier_service.courier_service.api.api.get_address",
                    args: {
                        customer : customer,
                    },
                    callback: function (r) {
                        if (r.message) {
                            var addresses = r.message;
                            var options = [];
                            for (var i = 0; i < addresses.length; i++) {
                                options.push({
                                    'label': addresses[i],
                                    'value': addresses[i]
                                });
                            }
                            frappe.web_form.set_value("address", null);
                            var field = frappe.web_form.get_field("address");
                            field._data = options;
                            field.refresh();
                        }
                    },
                });

                await frappe.call({
                    method: "courier_service.courier_service.api.api.get_icris_accounts",
                    args: {
                        customer : customer,
                    },
                    callback: function (r) {
                        if (r.message) {
                            var icris = r.message;
                            var options = [];
                            for (var i = 0; i < icris.length; i++) {
                                options.push({
                                    'label': icris[i],
                                    'value': icris[i]
                                });
                            }
                            frappe.web_form.set_value("icris_account", null);
                            var field = frappe.web_form.get_field("icris_account");
                            field._data = options;
                            field.refresh();
                        }
                    },
                });

                var imp_exp_field = frappe.web_form.get_value("imp__exp");
                if (imp_exp_field)
                {
                    await frappe.call({
                        method: "courier_service.courier_service.api.api.get_service_types",
                        args: {
                            customer : customer,
                            imp_exp_field : imp_exp_field,
                        },
                        callback: function (r) {
                            if (r.message) {
                                var service_types = r.message;
                                console.log(service_types);
                                var options = [];
                                for (var i = 0; i < service_types.length; i++) {
                                    options.push({
                                        'label': service_types[i],
                                        'value': service_types[i]
                                    });
                                    console.log(service_types[i]);
                                }
                                frappe.web_form.set_value("service_type", null);
                                var field = frappe.web_form.get_field("service_type");
                                field._data = options;
                                field.refresh();
                            }
                        },
                    });
                }
                

                var company = frappe.web_form.get_value("company");
                if (company)
                {
                        await frappe.call({
                            method: "courier_service.courier_service.api.api.get_credit_balance",
                            args: {
                                customer : customer,
                                company : company,
                            },
                            callback: function (r) {
                                if (r.message) {
                                    var balance_before_ship = r.message;
                                    // console.log(balance_before_ship);
                                    frappe.web_form.set_value("balance_credit_limit_before_shipment", balance_before_ship);
                                    var field = frappe.web_form.get_field("balance_credit_limit_before_shipment");
                                    field.refresh();
                                }
                            },
                        });

                }


            }
            else {

                frappe.web_form.get_field("ic_label").df.read_only = 0;
                frappe.web_form.get_field("ic_label").refresh();
                frappe.web_form.get_field("return_electronic_label").df.read_only = 0;
                frappe.web_form.get_field("return_electronic_label").refresh();
                frappe.web_form.get_field("saturday_delivery").df.read_only = 0;
                frappe.web_form.get_field("saturday_delivery").refresh();
                frappe.web_form.get_field("shipping_bill_charges").df.read_only = 0;
                frappe.web_form.get_field("shipping_bill_charges").refresh();
                frappe.web_form.get_field("direct_delivery").df.read_only = 0;
                frappe.web_form.get_field("direct_delivery").refresh();
                frappe.web_form.get_field("duty_tax_forwarding").df.read_only = 0;
                frappe.web_form.get_field("duty_tax_forwarding").refresh();
                frappe.web_form.get_field("signature_options").df.read_only = 0;
                frappe.web_form.get_field("signature_options").refresh();

                frappe.web_form.set_value("select_signature_option", null);
                var field4 = frappe.web_form.get_field("select_signature_option");
                field4._data = ["Delivery Confirmation Signature","Delivery Confirmation Adult Signature"];
                field4.refresh();


                frappe.web_form.set_value("address", null);
                var field = frappe.web_form.get_field("address");
                field._data = [];
                field.refresh();


                frappe.web_form.set_value("icris_account", null);
                var field2 = frappe.web_form.get_field("icris_account");
                field2._data = [];
                field2.refresh();


                frappe.web_form.set_value("service_type", null);
                var field3 = frappe.web_form.get_field("service_type");
                field3._data = [];
                field3.refresh();
            }



             
                





        });
        

        frappe.web_form.on('company', async (field, value) => {

            var company = value ;
            if (company)
            {
                var customer = frappe.web_form.get_value("customer");
                if (customer)
                {
                    await frappe.call({
                        method: "courier_service.courier_service.api.api.get_credit_balance",
                        args: {
                            customer : customer,
                            company : company,
                        },
                        callback: function (r) {
                            if (r.message) {
                                var balance_before_ship = r.message;
                                // console.log(balance_before_ship);
                                frappe.web_form.set_value("balance_credit_limit_before_shipment", balance_before_ship);
                                var field = frappe.web_form.get_field("balance_credit_limit_before_shipment");
                                field.refresh();
                            }
                        },
                    });
                }
            }

        });



        // frappe.web_form.on('consignee_country', async (field, value) => {
        //     var country = value ;
        //     if (country)
        //     {
        //         frappe.web_form.set_value("consignee_city", null);

        //         await frappe.call({
        //             method: "courier_service.courier_service.api.api.get_cities",
        //             args: {
        //                 country : country,
        //             },
        //             callback: function (r) {
        //                 if (r.message) {
        //                     var cities = r.message;
        //                     var options = [];
        //                     for (var i = 0; i < cities.length; i++) {
        //                         options.push({
        //                             'label': cities[i],
        //                             'value': cities[i]
        //                         });
        //                     }
        //                     var field = frappe.web_form.get_field("consignee_city");
        //                     field._data = options;
        //                     field.refresh();
        //                 }
        //             },
        //         });
        //     }
        //     else {
        //         frappe.web_form.set_value("consignee_city", null);
        //         var field = frappe.web_form.get_field("consignee_city");
        //         field._data = [];
        //         field.refresh();
        //     }
        // });


        frappe.web_form.on('imp__exp', async (field, value) => {
            var imp_exp_field = value ;
            if (imp_exp_field) {
                var customer = frappe.web_form.get_value("customer");                
                if (customer)
                    {
                    await frappe.call({
                        method: "courier_service.courier_service.api.api.get_service_types",
                        args: {
                            customer : customer,
                            imp_exp_field : imp_exp_field,
                        },
                        callback: function (r) {
                            if (r.message) {
                                var service_types = r.message;
                                var options = [];
                                for (var i = 0; i < service_types.length; i++) {
                                    options.push({
                                        'label': service_types[i],
                                        'value': service_types[i]
                                    });
                                }
                                frappe.web_form.set_value("service_type", null);
                                var field = frappe.web_form.get_field("service_type");
                                field._data = options;
                                field.refresh();
                            }
                        },
                    });
                }
            }
            else {
                frappe.web_form.set_value("service_type", null);
                var field3 = frappe.web_form.get_field("service_type");
                field3._data = [];
                field3.refresh();
            }
        });

        
        frappe.web_form.on('consignee_country', async (field, value) => {
            var country = value ;
            // var country = frappe.web_form.get_value("consignee_country");
            if (country)
            {

                frappe.web_form.set_value("consignee_postal_code", null);

                await frappe.call({
                    method: "courier_service.courier_service.api.api.get_postal_codes",
                    args: {
                        // city : city,
                        country : country, 
                    },
                    callback: function (r) {
                        if (r.message) {
                            var pc = r.message;
                            var options = [];
                            for (var i = 0; i < pc.length; i++) {
                                options.push({
                                    'label': pc[i],
                                    'value': pc[i]
                                });
                            }
                            var field = frappe.web_form.get_field("consignee_postal_code");
                            field._data = options;
                            field.refresh();
                        }
                    },
                });
            }
            else {
                frappe.web_form.set_value("consignee_postal_code", null);
                var field = frappe.web_form.get_field("consignee_postal_code");
                field._data = [];
                field.refresh();
            }
        })
        

});
    
    


   








