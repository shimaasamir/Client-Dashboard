var token = $.cookie("access_token");
var user = JSON.parse($.cookie("user"))
console.log(user)
if (user) {
    $('.kt-badge--rounded').html(user.email.charAt(0))
    $('.kt-user-card__name').html(user.email)
}
var arrows;
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
$('.dateOfBirth').datepicker({
    rtl: KTUtil.isRTL(),
    todayHighlight: true,
    orientation: "bottom left",
    templates: arrows
});
var picURL = new KTAvatar('picURLCont');
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
$('.timepicker').timepicker({
    defaultTime: ''
});


$('.modal').on('hidden.bs.modal', function () {
    $('#addNewForm').validate().destroy();
    console.log("object")
})
$('#logOut').click(function (e) {
    // e.perventDefault();
    $.cookie('access_token', null);
    $.cookie('user', null);
    console.log($.cookie("access_token"))
    window.location.href = "index.html"

});
function formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('/');
}
function getTime(date) {
    var d = new Date(date)
    return d.toLocaleTimeString();
}
var uploadFile = function (inputSelector, formSelector, uploadURL, fileNameField) {
    $('#imageUploding').hide();

    $(document).on('change', inputSelector, function (event) {
        $('#imageUploding').show();

        var files = event.target.files;
        if (files.length > 0) {
            var _form = $(this).closest(formSelector);
            // if (files[0].size > 81920) {
            //     /* Check the image size before upload not to be more than 80K */
            //     showErrorMsg($('#addNewForm'), 'danger', 'File is must be smaller than 100K');
            //     $('#imageUploding').hide();


            // }
            var formData = new FormData($(_form)[0]);
            $.ajax({
                url: uploadURL,
                type: 'POST',
                headers: { Authorization: 'Bearer ' + token },
                data: formData,
                async: false,
                success: function (res) {
                    var list, vType;
                    var types = ['png', 'jpg', 'jpeg'];
                    for (var i = 0; i < res.data.length; i++) {
                        if (res.data[i].status == 200) {
                            // var img = new Image();
                            fileNameField.val(res.data[i].url);
                            // $(".kt-avatar__holder").append(img);

                        }
                        else {
                            showErrorMsg($('#addNewForm'), 'danger', res.data[i].Message);

                        }
                    }
                    /* HIDE LOADER */
                    $('#imageUploding').hide();

                },
                xhr: function () {
                    var xhr = $.ajaxSettings.xhr();
                    xhr.upload.onprogress = function (evt) { };
                    xhr.upload.onload = function () { console.log('DONE!') };
                    return xhr;
                },
                cache: false,
                contentType: false,
                processData: false,
                async: true
            });
            return false;
        }
    });
}

// uploadFile('#license_upload', 'form#licenseUpload', 'http://tatweer-api.ngrok.io/api/upload/driver/image')
uploadFile('#picURL_upload', 'form#picURLUpload', 'http://tatweer-api.ngrok.io/api/upload/driver/image', $('#picURL'))
// uploadFile('#vehicleLic_upload', 'form#vehicleLicUpload', 'http://tatweer-api.ngrok.io/api/upload/driver/image')
