(function ($) {

	"use strict";

	var fullHeight = function () {

		$('.js-fullheight').css('height', $(window).height());
		$(window).resize(function () {
			$('.js-fullheight').css('height', $(window).height());
		});

	};
	fullHeight();

	$('#sidebarCollapse').on('click', function () {
		$('#sidebar').toggleClass('active');
	});

})(jQuery);



// ----------------------------------------------------------------------------------------------------



function getCookie(name) {
	let matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
	));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

var userData = JSON.parse(getCookie('user'));
// console.log('cookie data', userData)

var sender_id = userData._id;
var receiver_id;

var socket = io('/user-namespace', {
	auth: {
		token: userData._id
		// token:'<%= user._id %>'
	}
});



$(document).ready(function () {
	$('.user-list').click(function () {

		var userId = $(this).attr('data-id');
		receiver_id = userId;

		$('.start-head').hide();
		$('.chat-section').show();

		socket.emit('existsChat', { sender_id: sender_id, receiver_id: receiver_id });

	});
});


//for frontend online offline status updating 
socket.on('getOnlineUser', function (data) {
	$('#' + data.user_id + '-status').text('Online');
	$('#' + data.user_id + '-status').removeClass('offline-status');
	$('#' + data.user_id + '-status').addClass('online-status');
});
socket.on('getOfflineUser', function (data) {
	$('#' + data.user_id + '-status').text('Offline');
	$('#' + data.user_id + '-status').removeClass('online-status');
	$('#' + data.user_id + '-status').addClass('offline-status');
});

// saving chat for user 

$('#chat-form').submit(function (event) {
	event.preventDefault();

	// var message = $('#message').val();
	// $.ajax({
	//     url:'/save-chat',
	//     type:'POST',
	//     data:{sender_id: sender_id, receiver_id: receiver_id, message: message},
	//     success:function(response){
	//         if(response.success){
	//             console.log(response.data.message);
	//             $('#message').val('');
	//             let chat = response.data.message;
	//             let html = `<div class="current-user-chat">
	//             <h5>${chat}</h5>
	//         </div>`;
	//         $('#chat-container').append(html);
	//         }
	//         else{
	//             alert(response.msg)
	//         }
	//     }
	// });
	var message = $('#message').val();
	var trimmedReceiverId = receiver_id.trim(); // Trim the receiver_id

	$.ajax({
		url: '/save-chat',
		type: 'POST',
		data: { sender_id: sender_id, receiver_id: trimmedReceiverId, message: message },
		success: function (response) {
			if (response.success) {
				console.log(response.data.message);
				$('#message').val('');
				let chat = response.data.message;
				let html = `<div class="current-user-chat">
					<h5>${chat}</h5>
				</div>`;
				$('#chat-container').append(html);
				// FOR SHOWING BOTH SIDE CHATS 
				socket.emit('newChat', response.data);
				scrollChat();
			} else {
				alert(response.msg);
			}
		}
	});
});

// loading chat for both users 
socket.on('loadNewChat', function (data) {
	// if (sender_id == data.receiver_id.trim() && receiver_id.trim() == sender_id) {
	// if (sender_id.trim() == data.receiver_id.trim() && receiver_id.trim() == sender_id.trim()) {
	//     if (sender_id.trim() === data.receiver_id.trim() && receiver_id.trim() === sender_id.trim()) {
	//     let html = `<div class="distance-user-chat">
	//                 <h5>${data.message}</h5>
	//             </div>`;
	//             $('#chat-container').append(html);
	// }
	console.log(data);

	let html = `<div class="distance-user-chat">
					<h5>`+ data.message + `</h5>
				</div>`;
	$('#chat-container').append(html);
	scrollChat();

});

// this is for having seperate chats with each users but not working because of if statement needed imp 
//         socket.on('loadNewChat', function(data) {
//     console.log('Received data:', data); // Log received data

//     if (sender_id.trim() === data.receiver_id.trim() && receiver_id.trim() === sender_id.trim()) {
//         console.log('Condition met, appending message'); // Log if condition is met
//         let html = `<div class="distance-user-chat">
//                         <h5>` + data.message + `</h5>
//                     </div>`;
//         $('#chat-container').append(html);
//     } else {
//         console.log('Condition not met'); // Log if condition is not met
//     }
// });

// loading previous old chats 
socket.on('loadChats', function (data) {
	$('#chat-container').html('');

	var chats = data.chats;
	let html = '';

	for (let x = 0; x < chats.length; x++) {
		// const element = array[x];
		let addClass = '';
		if (chats[x]['sender_id'] == sender_id) {
			addClass = 'current-user-chat';
		}
		else {
			addClass = 'distance-user-chat';
		}

		html += `<div class="` + addClass + `">
					<h5>`+ chats[x]['message'] + `</h5>
				</div>`;

	}
	$('#chat-container').append(html);
	scrollChat();
});

function scrollChat() {
	$('#chat-container').animate({
		scrollTop: $('#chat-container').offset().top + $('#chat-container')[0].scrollHeight
	}, 0);
}


//add meber js
$('.addMember').click(function () {
	var id = $(this).attr('data-id');
	var limit = $(this).attr('data-limit');
	$('#group_id').val(id);
	$('#limit').val(limit);

	$.ajax({
		url: '/get-members',
		type: 'POST',
		data: { group_id: id },
		success: function (res) {
			if (res.success == true) {
				let users = res.data;
				let html = '';
				for (let i = 0; i < users.length; i++) {
					html += `
		<tr>
		<td>
		<input type="checkbox" name="members[]" value="`+ users[i]['_id'] + `"/>
		</td>
		<td>`+ users[i]['name'] + `</td>
		</tr>`;
				}
				$('.addMembersInTable').html(html);
			}
			else {
				alert(res.msg);
			}
		}
	});

});