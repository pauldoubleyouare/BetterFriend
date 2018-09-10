let MOCK_USER_DATA = { 
    "user": [
        {
            "id": "0001",
            "username": "cooldood",
            "firstName": "Johnny",
            "lastName": "Onthespot",
            "email": "test@test.com"
        },
        {
            "id": "0002",
            "username": "coolgurl",
            "firstName": "Josepine",
            "lastName": "Jumper",
            "email": "email@notreal.com"
        },
        {
            "id": "0003",
            "username": "sickguy",
            "firstName": "Xavier",
            "lastName": "Onthedot",
            "email": "not@real.com"
        },
        {
            "id": "0004",
            "username": "superwoman",
            "firstName": "Zelda",
            "lastName": "Zinger",
            "email": "this@isnotreal.com"
        }

    ]

};



let MOCK_PROFILE_DATA = 
{
    "profiles": [
        {
            "profile_id": "0000001",
			"user_id": "0001",
			"image": "https://i.amz.mshcdn.com/r59uAtQeFkaZXdJ9GvLRVWUXzno=/950x534/filters:quality(90)/https%3A%2F%2Fblueprint-api-production.s3.amazonaws.com%2Fuploads%2Fcard%2Fimage%2F732905%2Fd0fb8eb6-894d-4942-94db-4d86cc2ef241.jpg",
            "firstName": "Michael",
            "lastName": "Scott",
            "relationship": "Dad",
            "birthday": "1950-04-23T18:25:43.511Z",
            "email": "mscott@notreally.com",
            "address": "1428 Elm Street",
            "phone": "(555)555-1212"
        },
        {
            "profile_id": "0000002",
            "user_id": "0002",
            "firstName": "Jack",
            "lastName": "White",
            "relationship": "Brother",
            "birthday": "1980-03-13T18:25:43.511Z",
            "email": "not@email.com",
            "address": "111 W. Cliff Road",
            "phone": "(111) 222-333"
        },
        {
            "profile_id": "0000003",
            "user_id": "0003",
            "firstName": "Jordan",
            "lastName": "Peele",
            "relationship": "Dad",
            "birthday": "1976-02-13T18:25:43.511Z",
            "email": "getout@notreally.com",
            "address": "222 East Beach Lane",
            "phone": "(333)444-5555"
        },
        {
            "profile_id": "0000004",
            "user_id": "0004",
            "firstName": "Norm",
            "lastName": "McDonald",
            "relationship": "Best Friend",
            "birthday": "1962-04-26T18:25:43.511Z",
            "email": "guesswhat@notreally.com",
            "address": "444 Cool Melon",
            "phone": "(444)555-6666"
        }
    ]




};

function renderHomePage() {
	$("main").html(`
	<div class="page home">
	<h1>Home</h1>
		<button class="btn login">Login</button>
		<button class="btn createBfAccount">Create Account</button>
	</div>`);
	$(".btn.login").on("click", function(){
		renderLoginPage();
	});
	$(".btn.createBfAccount").on("click", function() {
		renderCreateAccountPage();
	})

}


function renderLoginPage() {
	$("main").html(`
	<div class="page login">
		<h1>Login</h1>
		<button class="btn" id="createBfAccount">Create Account</button><br>
		<form>
			Username:<br>
			<input type="text" class="existingUsername" required>
			<br>
			Password:<br>
			<input type="password" name="password" required><br>
			<input type="submit" class="btn submitUsrPas">
			<input type="reset" class="btn resetLogin">
		</form>
	</div>`);
	$("#createBfAccount").on("click", function() {
		renderCreateAccountPage();
	});
	$(".btn.submitUsrPas").on("click", function() {
		renderDashboardPage();
	})
}

function renderCreateAccountPage() {
	// when you click the create account button, it will bring you to the Create Account Screen
	$("main").html(`
	<div class="page createAccount">
		<h1>Create Account Page</h1>
		<form>
			Username:<br>
			<input type="text" class="newUsername" required><br>
			Password:<br>
			<input type="password" class ="newPassword" required><br>
			<input type="submit" value="Create Account">
			<button class="btn home">Cancel</button>
			<button class="btn login">Already have an account?</button>
		</form>
	</div>`);
	$(".btn.home").on("click", function() {
		renderHomePage();
	});
	$(".btn.login").on("click", function() {
		renderLoginPage();
	})
}

function renderDashboardPage() {
	$("main").html(`
	<div class="page dashboard">
		<h1>Dashboard Page</h1>
		<button class="btn createNewFriend">Create New Friend Profile</button>
		<button class="btn existingFriend">Existing Friend</button>
		<button class="btn logout">Log Out</button>
	</div>`);
	$(".btn.createNewFriend").on("click", function() {
		renderCreateFriendPage();
	});
	$(".btn.existingFriend").on("click", function() {
		renderFriendProfilePage();
	});
	$(".btn.logout").on("click", function() {
		renderHomePage();
	});
}
 
function renderCreateFriendPage() {
	$("main").html(`
	<div class="page createFriendProfile">
		<h1>Create New Friend Page</h1>
		<form action="">
			Relationship:<br>
			<input type="text" required><br>
			First Name:<br>
			<input type="text" required><br>
			Last Name:<br>
			<input type="text"><br>
			Birthday:<br>
			<input type="date" required><br>
			Email Address:<br>
			<input type="email"><br>
			Home Address:<br>
			<input type="text"><br>
			Phone Number:<br>
			<input type="text"><br>
			<input type="reset">
			<input type="submit" value="Save">
			<button class="btn cancelCreateNewFriend">Cancel</button>
		</form>
	</div>`);

	$(".btn.cancelCreateNewFriend").on("click", function() {
		renderDashboardPage();
	})
}

function renderEditFriendPage() {
	$("main").html(`
	<div class="page editFriendProfile">
		<h1>Edit Friend's Profile</h1>
		<form action="">
				Relationship:<br>
				<input type="text"><br>
				First Name:<br>
				<input type="text"><br>
				Last Name:<br>
				<input type="text"><br>
				Birthday:<br>
				<input type="date"><br>
				Email Address:<br>
				<input type="email"><br>
				Home Address:<br>
				<input type="text"><br>
				Phone Number:<br>
				<input type="text"><br>
				<input type="reset">
				<input type="submit" value="Save">
			</form>
			<button class="btn cancelEditNewFriend">Cancel</button>
	</div>`);
	$(".btn.cancelEditNewFriend").on("click", function() {
		renderDashboardPage();
	})

}

function renderFriendProfilePage() {
	let mockProfile = MOCK_PROFILE_DATA;
	$("main").html(`
	<div class="page viewFriendProfile">
	<h1>Existing Profile Page</h1>
	<button class="btn editFriend">Edit Friend</button>
	<button class="btn dashboard">Back to Dashboard</button>	
		<div class="friendProfileData">
				<img class="centerBlock friendProfilePhoto" src="${mockProfile.profiles[0].image}">
			<div class="centerText friendFullName">${mockProfile.profiles[0].firstName + " " + mockProfile.profiles[0].lastName}</div>
			<div class="friendRelationship">${mockProfile.profiles[0].relationship}</div>
			<div class="friendPhoneNumber">${mockProfile.profiles[0].phone}</div>
			<div class="friendBirthday">${mockProfile.profiles[0].birthday}</div>
			<div class="friendEmail">${mockProfile.profiles[0].email}</div>
			<div class="friendAddress">${mockProfile.profiles[0].address}</div>
		</div><br>
		<form id="wishListForm">
			Add wish list item:<br>
			<input type="text" class="wishListInput">
			<input type="submit" value="Add" id="addWishItem">
		</form>
		<div class="wishList"></div>
	</div>
	<br>
	`);

	$(".btn.editFriend").on("click", function() {
		renderEditFriendPage();
	});
	$(".btn.dashboard").on("click", function() {
		renderDashboardPage();
	});
	$(".viewFriendProfile").on("click", "#addWishItem", function(event) {
		let wishListItem = $(".wishListInput").val();
		$(".wishListInput").val('');
		event.preventDefault();
		$(".wishList").append(`
			<li>
				<span class="wishListItem">${wishListItem}</span>
				<div class="wishListItemControls">
					<button class="deleteWishListItem">
						<span class="deleteButtonLabel">Delete</span>
					</button>
				</div>
			</li>
		`)
	});

	$(".viewFriendProfile").on("click", ".deleteWishListItem", function(e) {
		e.preventDefault();
		$(this).closest('li').remove();
	})

}


function initializeApp() {
	renderHomePage();
}



initializeApp();


