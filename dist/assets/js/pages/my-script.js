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
    console.log($.cookie("access_token"))
    window.location.href = "index.html"

});