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
	var datatable;
	$('.tripDateTime').datetimepicker({
		todayHighlight: true,
		autoclose: true,
		startDate: moment().add(user.lastUpdateTime, 'hours').format('YYYY-MM-DD hh:mm:ss')
	});

	console.log()
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
	var getLastTimeToUpdate = function (dateObj, numHours) {
		var copiedDate = new Date(dateObj) //cloning the date object.
		copiedDate.setHours(copiedDate.getHours() - numHours);
		return copiedDate;
	}
	function makeTimer(tripCreation, containerID) {
		// tripCreation = moment.utc(tripCreation).local().format();
		// console.log(tripCreation)
		// var eventTime = moment(addHours(tripCreation, user.lastUpdateTime)).toDate().getTime() / 1000; // Timestamp - Sun, 21 Apr 2013 13:00:00 GMT
		var startTime = moment(moment(tripCreation).add(user.lastUpdateTime, 'hours').format('YYYY-MM-DD hh:mm:ss')).toDate().getTime() / 1000; // Timestamp - Sun, 21 Apr 2013 12:30:00 GMT
		var currentTime = moment().toDate().getTime() / 1000;
		var interval = 1000;
		var timer;
		var diffTime = startTime - currentTime;
		var duration = moment.duration(diffTime * 1000, 'milliseconds');
		if (duration._milliseconds < 0) {
			clearInterval(timer);
			$("#" + containerID).html("EXPIRED");
			$("#" + containerID).parents("tr").find(".edit,.delete,.editPassenger").hide()

		} else {
			timer = setInterval(function () {
				duration = moment.duration(duration - interval, 'milliseconds');
				// console.log(duration._milliseconds)
				$("#" + containerID).html(duration.days() + ":" + duration.hours() + ":" + duration.minutes() + ":" + duration.seconds())
				if (duration < 0) {
					clearInterval(timer);
					$("#" + containerID).html("EXPIRED");
					// console.log($("#" + containerID).parent().parant().find(".edit"))
					$("#" + containerID).parents("tr").find(".edit,.delete,.editPassenger").hide()
				}
			}, interval);
		}

	}

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
	var initTable = function () {
		if (datatable) datatable.destroy();
		datatable = _dt.bindDataTable('#dataTable', [0, 1, 2, 3, 4, 5, 6],
			function (data, a, b, c) {
				// console.log(b.route.routeName)
				// countDown(b.tripDateTime, b.id)
				if (c.col == 1) {
					return b.route.routeName;
				}
				if (c.col == 2) {
					return b.route.start.name;
				}
				if (c.col == 3) {
					return b.route.end.name;
				}
				if (c.col == 4) {
					return formatDate(b.tripDateTime);
				}
				if (c.col == 5) {
					return '<div id="' + b.id + '"></div>'
				}
				if (c.col == 6) {
					return '\
							<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm view"  title="View details">\
									<i class="flaticon-eye">\</i>\
								</a>\
							<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm edit" title="Edit details">\
								<i class="flaticon2-paper"></i>\
							</a>\
							<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm editPassenger" title="Edit Passenger list">\
								<i class="fa fa-users"></i>\
							</a>\
							<a href="javascript:;" data-id="' + b.id + '" class="btn btn-sm btn-clean btn-icon btn-icon-sm delete" title="Delete">\
								<i class="flaticon2-trash"></i>\
							</a>\
						';
				}
				makeTimer(b.tripDateTime, b.id)
				// setTimeout(makeTimer(b.tripDateTime, b.id), 1000)


				return data;
			},
			'http://tatweer-api.ngrok.io/api/Trip/GetAllTripsPaging', 'POST', {
			pagenumber: 1,
			pageSize: 10,
			clientId: user.id,
			statusId: 0
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
				"data": "tripDateTime"
			},
			{
				data: 'Actions',
				responsivePriority: -1,
				"width": "200px", "targets": 6
			}
			]);

	}
	var trips = function () {
		initTable()
		$('body').on('click', 'a.edit', function (e) {
			let id = e.currentTarget.dataset.id;
			let viewForm = $('#addModal #addNewForm')


			$(".modal-title").text("Edit Trip");
			$('#addModal #addNewForm input').prop("disabled", false);
			$('#addModal #addNew,#addModal .passengersTable,#addModal #updatePassengerList').hide();
			$('#addModal #update,#addModal form').show();


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
					$('#routes').val(res.data.route.id);
					$('#routes').trigger('change');

					// $('#addModal #addNewForm input[name="tripDateTime"]').datetimepicker({
					// 	date: new Date(moment(res.data.tripDateTime).toDate().getTime() / 1000)
					// });
					$('#addModal #addNewForm input[name="tripDateTime"]').val(formatDate(res.data.tripDateTime));
					// $('#addModal #addNewForm input[name="startTime"]').val(getTime(res.data.startTime));
					$('#addModal #addNewForm input[name="id"]').val(res.data.id);
					$('#update').click(function (e) {
						e.preventDefault();
						var btn = $(this);
						var form = $('#addNewForm');
						form.validate({
							rules: {
								routeId: {
									required: true
								},
								tripDateTime: {
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

						var submitdata = {
							...formData,
							tripDateTime: new Date(formData.tripDateTime).toISOString(),
							clientId: user.id
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
								initTable()
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

		});
		$('body').on('click', 'a.editPassenger', function (e) {
			let id = e.currentTarget.dataset.id;


			$(".modal-title").text("Edit Trip Passengers List");
			$('#addModal #addNewForm input').prop("disabled", true);
			$('#addModal #addNew,#addModal #update').hide();
			$('#addModal #updatePassengerList,#addModal .passengersTable').show();
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
					$('#routes').val(res.data.route.id);
					$('#routes').trigger('change');
					// $('#addModal #addNewForm input[name="tripDateTime"]').datetimepicker({
					// 	date: new Date(moment(res.data.tripDateTime).toDate().getTime() / 1000)
					// });
					$('#addModal #addNewForm input[name="tripDateTime"]').val(formatDate(res.data.tripDateTime));
					// $('#addModal #addNewForm input[name="startTime"]').val(getTime(res.data.startTime));
					$('#addModal #addNewForm input[name="id"]').val(res.data.id);
					var selectedPassengers = res.data.passenger

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

							// datatablePassenger = $('#local_record_selection').KTDatatable(options);
							var c = selectedPassengers;
							datatablePassenger.on('kt-datatable--on-init', function () {
								datatablePassenger.rows('.kt-datatable__row').
									nodes().
									find('.kt-checkbox--single > [type="checkbox"]').
									map(function (i, chk) {
										c.map(pass => {
											// console.log(chk, pass)
											if ($(chk).val() == pass.id) {
												$(chk).prop('checked', true);
												$(chk).parents("tr").addClass('kt-datatable__row--active')
											}
										})
										// return $(chk).val();
									});
							})


							datatablePassenger.on('kt-datatable--on-check', function (e, obj) {
								// console.log("event", e)
								console.log("object", obj[0])
								c.push({
									id: obj[0]
								});
								console.log(c)

							})
							datatablePassenger.on('kt-datatable--on-uncheck', function (e, obj) {
								// console.log("event", e)
								console.log("object", obj)
								for (var i = 0; i < c.length; i++)
									if (c[i].id && c[i].id == obj[0]) {
										c.splice(i, 1);
										break;
									}
								// c.splice({
								// 	id: obj[0]
								// });
								console.log(c)

							})

							datatablePassenger.on('kt-datatable--on-layout-updated', function () {
								datatablePassenger.rows('.kt-datatable__row').
									nodes().
									find('.kt-checkbox--single > [type="checkbox"]').
									map(function (i, chk) {
										c.map(pass => {
											// console.log(chk, pass)
											if ($(chk).val() == pass.id) {
												$(chk).prop('checked', true);
												$(chk).parents("tr").addClass('kt-datatable__row--active')
											}
										})
										// return $(chk).val();
										console.log(c)
									});
							})
							$('#updatePassengerList').click(function (e) {
								e.preventDefault();
								var btn = $(this);


								// var ids = datatablePassenger.rows('.kt-datatable__row--active').
								// 	nodes().
								// 	find('.kt-checkbox--single > [type="checkbox"]').
								// 	map(function (i, chk) {
								// 		return $(chk).val();
								// 	});
								// var c = [];
								// for (var i = 0; i < ids.length; i++) {
								// 	c.push({
								// 		id: ids[i]
								// 	});

								// }
								console.log("ids", c)
								var submitdata = {
									tripId: id,
									passengerList: c,
								}
								console.log(submitdata)
								btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);
								$.ajax({
									url: "http://tatweer-api.ngrok.io/api/trip/passenger/update",
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
										initTable()
									},
									error: function (res) {
										console.log(res);
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
							statusId: 5
						},
						headers: {
							"Authorization": "Berear " + token
						},
						success: function (res) {
							console.log(res)
							swal.fire("Done!", "It was succesfully deleted!", "success");
							initTable();

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
			$('#addModal #addNew,#addModal #update,#addModal #updatePassengerList').hide();
			$('#addModal .passengersTable,#addModal form').show();

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
					$('#routes').val(res.data.route.id);
					$('#routes').trigger('change');
					$('#addModal #addNewForm input[name="tripDateTime"]').val(formatDate(res.data.tripDateTime));
					// $('#addModal #addNewForm input[name="startTime"]').val(getTime(res.data.startTime));
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
			$('#addModal #update,#addModal #updatePassengerList').hide();
			$('#addModal .passengersTable,#addModal form,#addModal #addNew').show();

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
					var c = [];
					var ids;
					datatablePassenger = $('#local_record_selection').KTDatatable(options);
					datatablePassenger.on('kt-datatable--on-check', function (e, obj) {
						// console.log("event", e)
						console.log("object", obj[0])
						c.push({
							id: obj[0]
						});
						// console.log(c)

					})
					datatablePassenger.on('kt-datatable--on-uncheck', function (e, obj) {
						// console.log("event", e)
						console.log("object", obj)
						for (var i = 0; i < c.length; i++)
							if (c[i].id && c[i].id == obj[0]) {
								c.splice(i, 1);
								break;
							}
						// c.splice({
						// 	id: obj[0]
						// });
						// console.log(c)

					})

					datatablePassenger.on('kt-datatable--on-layout-updated', function () {
						datatablePassenger.rows('.kt-datatable__row').
							nodes().
							find('.kt-checkbox--single > [type="checkbox"]').
							map(function (i, chk) {
								c.map(pass => {
									// console.log(chk, pass)
									if ($(chk).val() == pass.id) {
										$(chk).prop('checked', true);
										$(chk).parents("tr").addClass('kt-datatable__row--active')
									}
								})
								// return $(chk).val();
								// console.log(c)
							});
					})
					$('#addNew').click(function (e) {
						e.preventDefault();
						var btn = $(this);
						var form = $('#addNewForm');
						form.validate({
							rules: {
								routeId: {
									required: true
								},
								tripDateTime: {
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



						console.log("ids", ids)
						var submitdata = {
							...formData,
							tripDateTime: new Date(formData.tripDateTime).toISOString(),
							clientId: user.id,
							passenger: c,
							creationDate: new Date().toISOString(),
							modifyDate: new Date().toISOString(),
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
								initTable()
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
