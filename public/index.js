function loginButton() {
	// on click, the app starts and you're taken to the Dashboard page
	//
	$(".loginButton").on("click", function() {
		$("#loginPage").hide();
		$("#dashboardPage").show();
	});
}

function createNewFriend() {
	// on click of "new friend button", the createFriendPage shows
}

function saveNewFriend() {
	//on click, the information that's in the form gets saved
}


function viewFriendProfile() {
	//on click displays the friend's page
	//calls renderFriendInfo to populate the friend's information
}

function renderFriendInfo() {
	// when called, this function will populate the friend's saved dates, wishlist items, and picture
}


function viewDashboard() {
	// on click you're taken to your homescreen/dashboard page
}

function viewWishList() {
	// on click the WishListPage shows up and everything else is hidden 
}


function toggleHideShow() {

}


$(loginButton);