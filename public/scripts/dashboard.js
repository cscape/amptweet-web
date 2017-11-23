$.get("/api/follower_count", function(data){
    let count = data.data.count;
    $("#followerCount b").text(count);
    $("#followerCount").append(' Followers')
});

$.get("/api/new_followers", function(data) {
    $('body').append('<div class="_mtxs newfollows" container>');
    $(".newfollows").append("<h4>New Followers</h4>")
    $('.newfollows').append("<ul>");
    data.data.users.forEach(function(item, index) {
        $('.newfollows ul').append(`
            <li>
                <img src="${item.profile_image_url_https}">
                <a href="https://www.twitter.com/${item.screen_name}">
                    <span>
                        <b> ${item.name} </b>
                    </span>
                    <span>@${item.screen_name}</span>
                </a>
            </li>
        `)
    });
});

$.get("/api/unfollowers", function(data) {
    $('body').append('<div class="_mtxs unfollows" container>');
    $(".unfollows").append("<h4>Unfollowers</h4>")
    $('.unfollows').append("<ul>");
    data.data.users.forEach(function(item, index) {
        $('.unfollows ul').append(`
            <li>
                <img src="${item.profile_image_url_https}">
                <a href="https://www.twitter.com/${item.screen_name}">
                    <span>
                        <b> ${item.name} </b>
                    </span>
                    <span>@${item.screen_name}</span>
                </a>
            </li>
        `)
    });
});

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