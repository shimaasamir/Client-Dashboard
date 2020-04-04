"use strict";
// Class definition

var tripsDT = function () {
	// Private functions
	var token = $.cookie("access_token");
	var user = JSON.parse($.cookie("user"))
	console.log(user)
	var _dt = new DataTableEntry(),
		datatable, _status = 0,
		_sId, routes, arrows, datatablePassenger;

	$('.tripDate').datepicker({
		rtl: KTUtil.isRTL(),
		todayHighlight: true,
		orientation: "bottom left",
		templates: arrows
	});

	if (KTUtil.isRTL()) {
		arrows = {
			leftArrow: '<i class="la la-angle-right"></i>',
			rightArrow: '<i class="la la-angle-left"></i>'
		}
	} else {
		arrows = {
			leftArrow: '<i class="la la-angle-left"></i>',
			rightArrow: '<i class="la la-angle-right"></i>'
		}
	}
	var options = {
		// datasource definition
		data: {
			type: 'local',
			pageSize: 10,
		},

		// layout definition
		layout: {
			scroll: true, // enable/disable datatable scroll both horizontal and
			// vertical when needed.
			height: 350, // datatable's body's fixed height
			footer: false // display/hide footer
		},

		// column sorting
		sortable: true,

		pagination: true,

		// columns definition

		columns: [
			{
				field: 'id',
				title: '#',
				sortable: false,
				width: 20,
				selector: {
					class: 'kt-checkbox--solid'
				},
				textAlign: 'center',
			}, {
				field: 'workid',
				title: 'Work ID'
			}, {
				field: 'name',
				title: 'Name',
				template: function (row, index, datatable) {
					return row.firstName + ' ' + row.lastName;
				},
			}
		],
	};

	options.search = {
		input: $('#generalSearch'),
	};
	//start--convert form to json
	$.fn.extractObject = function () {
		var accum = {};
		function add(accum, namev, value) {
			if (namev.length == 1)
				accum[namev[0]] = value;
			else {
				if (accum[namev[0]] == null)
					accum[namev[0]] = {};
				add(accum[namev[0]], namev.slice(1), value);
			}
		};
		this.find('input, textarea, select').each(function () {
			add(accum, $(this).attr('name').split('.'), $(this).val());
		});
		return accum;
	};
	var loadAllRoutes = function () {
		routes = [];
		$.ajax({
			url: "http://tatweer-api.ngrok.io/api/Route/GetAllRoutes",
			type: "POST",
			data: {
				clientId: user.id
			},
			headers: {
				"Authorization": "Berear " + token
			},
			success: function (res) {
				console.log(res)
				if (res) {
					res.data.map(route => {
						routes.push({ ...route, text: route.routeName })
					})
					$("#routes").select2({
						placeholder: "Select a value",
						data: routes
					});
				}

			},
			error: function (xhr, ajaxOptions, thrownError) {
				if (xhr.ErrorCode == 401) {
					window.location.href = "index.html"
				}
			}
		})

	};
	var trips = function () {
		var datatable;

		if (datatable) datatable.destroy();
		datatable = _dt.bindDataTable('#dataTable', [0, 1, 2, 3, 4, 5, 6],
			function (data, a, b, c) {
				// console.log(a)

				if (c.col == 4) {
					return formatDate(b.tripDate);
				}
				if (c.col == 5) {
					return getTime(b.startTime);
				}
				if (c.col == 6) {
					return '\
							<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm view"  title="View details">\
									<i class="flaticon-eye">\</i>\
								</a>\
							<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm edit" title="Edit details">\
								<i class="flaticon2-paper"></i>\
							</a>\
							<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm delete" title="Delete">\
								<i class="flaticon2-trash"></i>\
							</a>\
						';
				}

				return data;
			},
			'http://tatweer-api.ngrok.io/api/Trip/GetAllTripsPaging', 'POST', {
			pagenumber: 1,
			pageSize: 10,
			clientId: user.id
		},
			[{
				"data": "id"
			},
			{
				"data": "routeName"
			},
			{
				"data": "startName"
			},
			{
				"data": "endName"
			},
			{
				"data": "tripDate"
			},
			{
				"data": "startTime"
			},
			{
				data: 'Actions',
				responsivePriority: -1
			}
			]);





		$('body').on('click', 'a.edit', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')


			$(".modal-title").text("Edit Trip");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').hide();
			$('#addModal #update').show();
			loadAllRoutes()
			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Trip/GetTripWithPassenges/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					console.log(res)
					// console.log(viewForm)
					$('#addModal').modal('show');
					$('#routes').val(res.data.routeID);
					$('#routes').trigger('change');
					$('#addModal #addNewForm input[name="tripDate"]').val(formatDate(res.data.tripDate));
					$('#addModal #addNewForm input[name="startTime"]').val(getTime(res.data.startTime));
					$('#addModal #addNewForm input[name="id"]').val(res.data.id);
					var selectedPassengers = res.data.passenger
					// var selectedPassengers = [
					// 	{
					// 		id: 122
					// 	}
					// ]
					datatablePassenger ? datatablePassenger.destroy() : null
					let passengers;
					$.ajax({
						url: "http://tatweer-api.ngrok.io/api/Passenger/GetAllPassenger",
						type: "POST",
						data: {
							pagenumber: 1,
							pageSize: 9999999,
							clientId: user.id
						},
						headers: {
							"Authorization": "Berear " + token
						},
						success: function (res) {
							passengers = res.data.data
							options = {
								...options,
								data: {
									...options.data,
									source: passengers
								}
							}
							datatablePassenger = $('#local_record_selection').KTDatatable(options);


							datatablePassenger.on('kt-datatable--on-init', function () {
								datatablePassenger.rows('.kt-datatable__row').
									nodes().
									find('.kt-checkbox--single > [type="checkbox"]').
									map(function (i, chk) {
										selectedPassengers.map(pass => {
											console.log(chk, pass)
											if ($(chk).val() == pass.id) {
												$(chk).prop('checked', true);
												$(chk).parents("tr").addClass('kt-datatable__row--active')
											}
										})
										// return $(chk).val();
									});
							})

							$('#update').click(function (e) {
								e.preventDefault();
								var btn = $(this);
								var form = $('#addNewForm');
								form.validate({
									rules: {
										routeId: {
											required: true
										},
										tripDate: {
											required: true
										},
										tripTime: {
											required: true
										}
									}
								});

								if (!form.valid()) {
									return;
								}

								var formData = $('#addNewForm').extractObject();
								var ids = datatablePassenger.rows('.kt-datatable__row--active').
									nodes().
									find('.kt-checkbox--single > [type="checkbox"]').
									map(function (i, chk) {
										return $(chk).val();
									});
								var c = [];
								for (var i = 0; i < ids.length; i++) {
									c.push({
										id: ids[i]
									});

								}
								console.log("ids", c)
								var submitdata = {
									...formData,
									clientId: user.id,
									passenger: c,
									createDate: new Date(),
									modifyDate: new Date(),
									modifyBy: 1
								}
								console.log(submitdata)
								btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
								form.ajaxSubmit({
									url: "http://tatweer-api.ngrok.io/api/Trip/UpdateTrip",
									method: "POST",
									data: submitdata,
									headers: {
										"Authorization": "Berear " + token
									},
									success: function (response) {
										// similate 2s delay
										// docCookies.setItem('access_token', response.access_token);
										btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
										console.log(response);
										$('#addModal').modal('hide');
										datatable.ajax.reload()
									},
									error: function (res) {
										console.log(response);
										showErrorMsg(form, 'danger', res.message);
									}
								});
							});


						},

						error: function (xhr, ajaxOptions, thrownError) {
							swal.fire("Error !", "Please try again", "error");
						}
					})
				},
				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error !", "Please try again", "error");
				}
			})

		});



		// Delete
		$('body').on('click', 'a.delete', function (e) {
			let id = e.currentTarget.dataset.id;
			// console.log(e.currentTarget.dataset.id);
			swal.fire({
				title: 'Are you sure?',
				text: "You won't be able to revert this!",
				type: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Yes, delete it!'
			}).then(function (result) {
				// console.log(result)
				if (!result.value) return;

				if (result.value) {
					$.ajax({
						url: "http://tatweer-api.ngrok.io/api/Trip/UpdateStatus",
						type: "POST",
						data: {
							ID: id,
							statusId: 4
						},
						headers: {
							"Authorization": "Berear " + token
						},
						success: function (res) {
							console.log(res)
							swal.fire("Done!", "It was succesfully deleted!", "success");
							datatable.ajax.reload();

						},
						error: function (xhr, ajaxOptions, thrownError) {
							swal.fire("Error deleting!", "Please try again", "error");
						}
					})
				}
			});
		});
		//view
		$('body').on('click', 'a.view', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')
			// console.log(e.currentTarget.dataset.id);
			$(".modal-title").text("View Trip");
			$('#addModal #addNewForm input').prop("disabled", true);
			$('#addModal #addNew,#addModal #update').hide();
			loadAllRoutes()

			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Trip/GetTripWithPassenges/" + id,
				type: "GET",

				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {

					console.log(res)
					$('#addModal').modal('show');
					$('#routes').val(res.data.routeID);
					$('#routes').trigger('change');
					$('#addModal #addNewForm input[name="tripDate"]').val(formatDate(res.data.tripDate));
					$('#addModal #addNewForm input[name="startTime"]').val(getTime(res.data.startTime));
					$('#addModal #addNewForm input[name="id"]').val(res.data.id);
					var selectedPassengers = res.data.passenger
					// var selectedPassengers = [
					// 	{
					// 		id: 122
					// 	}
					// ]

					datatablePassenger ? datatablePassenger.destroy() : null
					let passengers;
					$.ajax({
						url: "http://tatweer-api.ngrok.io/api/Passenger/GetAllPassenger",
						type: "POST",
						data: {
							pagenumber: 1,
							pageSize: 9999999,
							clientId: user.id
						},
						headers: {
							"Authorization": "Berear " + token
						},
						success: function (res) {
							passengers = res.data.data
							options = {
								...options,
								data: {
									...options.data,
									source: passengers
								}
							}
							datatablePassenger = $('#local_record_selection').KTDatatable(options);


							datatablePassenger.on('kt-datatable--on-init', function () {
								datatablePassenger.rows('.kt-datatable__row').
									nodes().
									find('.kt-checkbox--single > [type="checkbox"]').
									map(function (i, chk) {
										selectedPassengers.map(pass => {
											console.log(chk, pass)
											if ($(chk).val() == pass.id) {
												$(chk).prop('checked', true);
												$(chk).parents("tr").addClass('kt-datatable__row--active')
											}
										})
										// return $(chk).val();
									});
							})



						},

						error: function (xhr, ajaxOptions, thrownError) {
							swal.fire("Error !", "Please try again", "error");
						}
					})

				},
				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error deleting!", "Please try again", "error");
				}
			})

		});
		// show add new modal
		$('body').on('click', '#showAddNewModal', function (e) {
			$("#showAddNewModal .modal-title").text("Add Trip");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew').show();
			$('#addModal #update').hide();
			$('#addModal').modal('show');
			loadAllRoutes()
			// loadAllRoutes(true);
			let viewForm = $('#addModal #addNewForm')
			viewForm.each(function () {
				this.reset();
			});
			datatablePassenger ? datatablePassenger.destroy() : null
			let passengers;
			$.ajax({
				url: "http://tatweer-api.ngrok.io/api/Passenger/GetAllPassenger",
				type: "POST",
				data: {
					pagenumber: 1,
					pageSize: 9999999,
					clientId: user.id
				},
				headers: {
					"Authorization": "Berear " + token
				},
				success: function (res) {
					passengers = res.data.data
					options = {
						...options,
						data: {
							...options.data,
							source: passengers
						}
					}
					datatablePassenger = $('#local_record_selection').KTDatatable(options);

					$('#addNew').click(function (e) {
						e.preventDefault();
						var btn = $(this);
						var form = $('#addNewForm');
						form.validate({
							rules: {
								routeId: {
									required: true
								},
								tripDate: {
									required: true
								},
								tripTime: {
									required: true
								}


							}
						});

						if (!form.valid()) {
							return;
						}
						var formData = $('#addNewForm').extractObject();
						delete formData.search;
						// delete formData.endPoint;
						// delete formData.id;
						// console.log(formData);


						var ids = datatablePassenger.rows('.kt-datatable__row--active').
							nodes().
							find('.kt-checkbox--single > [type="checkbox"]').
							map(function (i, chk) {
								return $(chk).val();
							});
						var c = [];
						for (var i = 0; i < ids.length; i++) {
							c.push({
								id: ids[i]
							});

						}
						console.log("ids", ids)
						var submitdata = {
							...formData,
							clientId: user.id,
							passenger: c,
							createDate: new Date(),
							modifyDate: new Date(),
							modifyBy: 1
						}
						console.log(submitdata)
						btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
						form.ajaxSubmit({
							url: "http://tatweer-api.ngrok.io/api/Trip/AddTrip",
							method: "POST",
							data: submitdata,
							headers: {
								"Authorization": "Berear " + token
							},
							success: function (response) {
								// similate 2s delay
								// docCookies.setItem('access_token', response.access_token);
								btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
								console.log(response);
								$('#addModal').modal('hide');
								datatable.ajax.reload()
							},
							error: function (res) {
								console.log(res);
								btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
								// showErrorMsg(form, 'danger', res.message);
							}
						});
					});
					// $('#kt_modal_fetch_id').on('click', function (e) {

					// 	$(e.target).find('.kt-datatable_selected_ids').append(c);

					// })

				},

				error: function (xhr, ajaxOptions, thrownError) {
					swal.fire("Error !", "Please try again", "error");
				}
			})
		});
		// add new








	}


	return {
		// public functions
		init: function () {
			trips();
		},
	};
}();

jQuery(document).ready(function () {
	tripsDT.init();
});
