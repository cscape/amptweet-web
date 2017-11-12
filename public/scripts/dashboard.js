$.get("/api/auto_like", function(data){
    if (data.data.status === true) {
        $("#autolike").prop('checked', true)
            .removeAttr('disabled');
    } else {
        $("#autolike").prop('checked', false)
        $("#autolike").removeAttr('disabled');
    }
});

$("#autolike").click(function(){
    $(this).attr('disabled', true);
    if (!$('#autolike').is(':checked')) {
        $.post("/api/auto_like", {"turn": "off"}, function(data) {
            if (data.data.status === true) {
                $("#autolike").prop('checked', true)
                    .removeAttr('disabled');
            } else {
                $("#autolike").prop('checked', false)
                $("#autolike").removeAttr('disabled');
            }
        })
    } else {
        $.post("/api/auto_like", {"turn": "on"}, function(data) {
            if (data.data.status === true) {
                $("#autolike").prop('checked', true)
                    .removeAttr('disabled');
            } else {
                $("#autolike").prop('checked', false)
                $("#autolike").removeAttr('disabled');
            }
        })
    }
});