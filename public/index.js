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
	$(".btn.submitUsrPas").on("click", function(e) {
		e.preventDefault();
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
	$("main").html(`
	<div class="page viewFriendProfile">
		<h1>Existing Profile Page</h1>
		<button class="btn editFriend">Edit Friend</button>
		<button class="btn dashboard">Back to Dashboard</button>
	</div>
	`);
	$(".btn.editFriend").on("click", function() {
		renderEditFriendPage();
	});
	$(".btn.dashboard").on("click", function() {
		renderDashboardPage();
	})
}


function initializeApp() {
	renderHomePage();
}



initializeApp();


