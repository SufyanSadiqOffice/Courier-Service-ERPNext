// Bind event handler to the web form








frappe.ready(async function() {
  

    
        frappe.web_form.on('customer', async (field, value) => {
            var customer = value ;
            if (customer) {
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


                await frappe.call({
                    method: "courier_service.courier_service.api.api.get_service_types",
                    args: {
                        customer : customer,
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
            else {
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
    
    


   








