"use strict";

// Class Definition
var KTLoginGeneral = function () {

    var login = $('#kt_login');
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
    //end--convert form to json
    var showErrorMsg = function (form, type, msg) {
        var alert = $('<div class="alert alert-' + type + ' alert-dismissible" role="alert">\
			<div class="alert-text">'+ msg + '</div>\
			<div class="alert-close">\
                <i class="flaticon2-cross kt-icon-sm" data-dismiss="alert"></i>\
            </div>\
		</div>');

        form.find('.alert').remove();
        alert.prependTo(form);
        //alert.animateClass('fadeIn animated');
        KTUtil.animateClass(alert[0], 'fadeIn animated');
        alert.find('span').html(msg);
    }


    var handleSignInFormSubmit = function () {
        $('#kt_login_signin_submit').click(function (e) {
            e.preventDefault();
            var btn = $(this);
            var form = $(this).closest('form');

            var formData = $('#signIn').extractObject();
            form.validate({
                rules: {
                    username: {
                        required: true,
                        email: true
                    },
                    password: {
                        required: true
                    }
                }
            });

            if (!form.valid()) {
                return;
            }

            btn.addClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', true);

            form.ajaxSubmit({
                url: "http://tatweer-api.ngrok.io/api/token",
                method: "POST",

                data: {
                    // username: login.username,
                    // password: login.password,
                    "grant_type": "2"
                },
                success: function (response, status, xhr, $form) {
                    // similate 2s delay
                    // docCookies.setItem('access_token', response.access_token);
                    $.cookie("access_token", response.access_token, { expires: response.expires_in });
                    var token = $.cookie("access_token");
                    console.log(response)
                    if (response.access_token == null) {
                        showErrorMsg(form, 'danger', "Please check your cridentials");
                        btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);

                    } else {

                        $.ajax({
                            url: "http://tatweer-api.ngrok.io/api/login",
                            method: "POST",
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                "Authorization": "Berear " + token
                            },
                            data: {
                                ...formData,
                                "grant_type": "2"
                            },
                            success: function (response) {
                                $.cookie("user", JSON.stringify(response.data));

                                window.location.href = "passenger.html"
                                console.log(response)

                            },

                        })
                    }
                    // window.location.href = "trips.html"

                    // btn.removeClass('kt-spinner kt-spinner--right kt-spinner--sm kt-spinner--light').attr('disabled', false);
                    // console.log( $.cookie("access_token"));
                },

                error: function (res) {
                    console.log(res);

                    showErrorMsg(form, 'danger', res.message);

                }
            });
        });
    }



    // Public Functions
    return {
        // public functions
        init: function () {
            handleSignInFormSubmit();
        }
    };
}();



// Class Initialization
jQuery(document).ready(function () {
    KTLoginGeneral.init();
});
