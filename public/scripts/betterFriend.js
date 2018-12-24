'use strict';

const betterFriend = (function() {
  //this is a test
  //another test

  function showSuccessMessage(message) {
    const element = $('.jsMessage');
    element.text(message).show();
    setTimeout(() => element.fadeOut('slow'), 3000);
  }

  function showFailureMessage(message) {
    const element = $('.jsMessage');
    element.text(message).show();
    setTimeout(() => element.fadeOut('slow'), 3000);
  }

  function handleErrors(err) {
    if (err.status === 401) {
      store.authorized = false;
    }
    showFailureMessage(err.responseJSON.message);
  }

  function jwtDecoder(token) {
    let decoded = jwt_decode(token);
  }

  //=====Render HTML Functions=====//
  function renderHomePage() {
    $('main').html(`
    <section class="page home">
    <h1>Home Page</h1>
      <h4>Never give boring presents again</h4>
      <button class="btn login">Login</button>
      <button class="btn createBfAccount">Create Account</button>
    </section>
    `);
    $('.btn.login').on('click', function() {
      renderLoginPage();
    });
    $('.btn.createBfAccount').on('click', function() {
      renderCreateAccountPage();
    });
  }

  function renderLoginPage() {
    $('main').html(`
      <section class="page login">
        <h1>Login Page</h1>
        <form id="loginForm" class="jsLoginForm">
          <fieldset>
            <legend>Login</legend>
            <div>
              <label for="userName">Username</label>
              <input type="text" name="userName" class="jsUserNameEntry" placeholder="Username" required>
            </div>
            <div>
              <label for="password">Password</label>
              <input type="password" name="password" class="jsPasswordEntry" placeholder="Password" required>
            </div>
            <button type="submit" class="">Login</button>
            <button type="reset" class="btn resetLogin">Reset</button>
            <button class="btn" id="createBfAccount">New? Signup here!</button>
          </fieldset>
        </form>
      </section>
    `);

    $('.jsLoginForm').on('submit', event => {
      event.preventDefault();

      const loginForm = $(event.currentTarget);
      const loginUser = {
        userName: loginForm.find('.jsUserNameEntry').val(),
        password: loginForm.find('.jsPasswordEntry').val()
      };

      api
        .create('/api/login', loginUser)
        .then(response => {
          store.authToken = response.authToken;
          store.authorized = true;
          store.currentUser = jwt_decode(store.authToken);
          loginForm[0].reset();
          showSuccessMessage(
            `Welcome back, ${store.currentUser.user.firstName}!`
          );
          renderDashboardPage();
        })
        .catch(handleErrors);
    });

    $('#createBfAccount').on('click', function() {
      renderCreateAccountPage();
    });
  }

  function renderCreateAccountPage() {
    $('main').html(`
    <section class="page createAccount">
      <h1>Create Account Page</h1>
      <form id="createAccountForm" class="jsCreateAccountForm">
        <fieldset>
        <legend>Create Account</legend>
        <div>
          <label for="userName">Username:</label>
          <input type="text"  name="userName" class="jsUserNameEntry" placeholder="Username" required><br>
        </div>
        <div>
          <label for="password">Password:</label>
          <input type="password" name="password" class="jsPasswordEntry" placeholder="Password" required>
        </div>
        <div>
          <label for="firstName">First name:</label>
          <input type="text" name="firstName" class="jsFirstNameEntry" placeholder="First name" required><br>
        </div>
        <div>
          <label for="lastName">Last name:</label>
          <input type="text" name="lastName" class="jsLastNameEntry" placeholder="Last name" required><br>
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" name="email" class="jsEmailEntry" placeholder="email@address.com" required>
        </div>
        <button class="btn createAccount" type="submit">Create Account</button>
        <button type="reset" class="btn resetCreateAccountForm">Reset</button>
        <button class="btn toLoginPage">Have an account? Login here!</button>
        </fieldset>
      </form>
    </section>
  `);
    $('.btn.toLoginPage').on('click', function() {
      renderLoginPage();
    });

    $('.jsCreateAccountForm').on('submit', event => {
      event.preventDefault();

      const signupForm = $(event.currentTarget);
      const newUser = {
        userName: signupForm.find('.jsUserNameEntry').val(),
        password: signupForm.find('.jsPasswordEntry').val(),
        firstName: signupForm.find('.jsFirstNameEntry').val(),
        lastName: signupForm.find('.jsLastNameEntry').val(),
        email: signupForm.find('.jsEmailEntry').val()
      };

      api
        .create('/api/users', newUser)
        .then(response => {
          signupForm[0].reset();
          showSuccessMessage(
            `Woohoo! Welcome to BetterFriend ${response.firstName}`
          );
        })
        .catch(handleErrors);
      renderLoginPage();
    });
  }

  function renderDashboardPage() {
    //need to make GET requests to pull in the users profile pages
    $('main').html(`
    <section class="page dashboard">
      <h1>Dashboard Page</h1>
      <button class="btn jsCreateNewFriend">Create New Friend Profile</button>
      <button class="btn existingFriend">Existing Friend</button>
      <button class="btn logout">Log Out</button>
    </section>
    `);

    $('.jsCreateNewFriend').on('click', function() {
      renderCreateFriendPage();
    });
    $('.btn.existingFriend').on('click', function() {
      renderFriendProfilePage();
    });
    $('.btn.logout').on('click', function() {
      localStorage.removeItem('authToken');
      showSuccessMessage(`Log out successful`);
      renderHomePage();
    });
  }

  function renderCreateFriendPage() {
    $('main').html(`
    <section class="page createFriend">
		<h1>Create Friend Page</h1>
		<form id="createFriendForm" class="jsCreateFriendForm">
			<fieldset>
				<legend>Create New Person</legend>
				<div>
					<label for="firstName">*First name:</label>
					<input type="text" name="firstName" class="jsNewFriendFirstNameEntry" placeholder="First name" required>
				</div>
				<div>
						<label for="lastName">*Last name:</label>
						<input type="text" name="lastName" class="jsNewFriendLastNameEntry" placeholder="Last name" required>
				</div>
				<div>
						<label for="email">Email:</label>
						<input type="text" name="email" class="jsNewFriendEmailEntry" placeholder="email@address.com">
				</div>
				<div>
						<label for="relationship">Relationship:</label>
						<input type="text" name="relationship" class="jsNewFriendRelationshipEntry" placeholder="Mom, dad, best friend etc.">
				</div>
				<div>
						<label for="birthday">Birthday:</label>
						<input type="date" name="birthday" class="jsNewFriendBirthdayEntry" placeholder="12/15/1950">
        </div>
        <div>
          <label for="phone">Phone:</label>
          <input type="text" name="phone" class="jsNewFriendPhoneEntry" placeholder="(555) 867-5309">
        </div>
				<fieldset>
					<legend>Address:</legend>
					<div>
							<label for="street">Street:</label>
							<input type="text" name="street" class="jsNewFriendStreetEntry" placeholder="1428 Elm Street">
					</div>
					<div>
							<label for="city">City:</label>
							<input type="text" name="city" class="jsNewFriendCityEntry" placeholder="Los Angeles">
					</div>
					<div>
							<label for="state">State:</label>
							<input type="text" name="state" class="jsNewFriendStateEntry" placeholder="California">
					</div>
					<div>
							<label for="zipcode">Zip:</label>
							<input type="text" name="zipcode" class="jsNewFriendZipCodeEntry" placeholder="90046">
					</div>
        </fieldset>
        <button type="submit" class="btn jsCreateNewProfile">Create</button>
        <button type="reset" class="btn resetNewFriendForm">Reset</button>
        <button class="btn jsCancelNewFriendCreate" id="createBfAccount">Cancel</button>
        <button class="btn jsBackToDashboard">Back to Dashboard</button>
			</fieldset>
		</form>
	  </section>
    `);

    $('.jsCreateFriendForm').on('submit', function(event) {
      event.preventDefault();
      // Need to grab every value of the new profile and make a POST to /api/profiles
      const newProfileForm = $(event.currentTarget);
      const newProfile = {
        firstName: $('.jsNewFriendFirstNameEntry').val(),
        lastName: $('.jsNewFriendLastNameEntry').val(),
        email: $('.jsNewFriendEmailEntry').val(),
        relationship: $('.jsNewFriendRelationshipEntry').val(),
        birthday: $('.jsNewFriendBirthdayEntry').val(),
        address: {
          streetName: $('.jsNewFriendStreetEntry').val(),
          city: $('.jsNewFriendCityEntry').val(),
          state: $('.jsNewFriendStateEntry').val(),
          zipCode: $('.jsNewFriendZipCodeEntry').val()
        },
        phone: $('.jsNewFriendPhoneEntry').val()
      };

      api
        .create('/api/profiles', newProfile)
        .then(response => {
          newProfileForm[0].reset();
          store.profiles.push(response);
          showSuccessMessage(
            `${newProfile.firstName} has been added to your Dashboard`
          );
        })
        .catch(handleErrors);
    });

    $('.jsCancelNewFriendCreate').on('click', function() {
      renderDashboardPage();
    });

    $('.jsBackToDashboard').on('click', function() {
      renderDashboardPage();
    });
  }

  function renderDashboardPage() {
    //Need to create the HTML template of the page (header and buttons)
    //need to make a GET to /api/profiles
    //need to generate HTML for each object in the response (just a thumbnail and first/last name)
    //when you click on a profile, you should be taken to that users profile page
    // click on profile, get data-id
    $('main').html(`
      <section class="page dashboard">
        <h1>Dashboard Page</h1>
        <button class="btn jsCreateNewFriend">Create New Friend Profile</button>
        <div class="jsProfilesContainer"></div>
      </section>
    `);

    api
      .search('/api/profiles')
      .then(dbResponse => {
        store.profiles = dbResponse;
        let targetedProfileId;
        let htmlProfiles = store.profiles.map(function(profile) {
          return `
          <div class="jsDashboardProfile" data-id="${profile._id}">
            <div>${profile.firstName} ${profile.lastName}</div>
          </div>
          `
        });
        $('.jsProfilesContainer').html(htmlProfiles); 
        $('.jsDashboardProfile').on('click', function() {
          targetedProfileId = $(this).attr("data-id");
          renderFriendProfilePage(targetedProfileId);
        });
      })
      .catch(handleErrors);
    
    $('.jsCreateNewFriend').on('click', function() {
      renderCreateFriendPage();
    });
  }

  function renderFriendProfilePage(profileId) {
    console.log('PASSED PROFILE ID>>>>>', profileId);
    api.search(`/api/profiles/${profileId}`)
      .then(profile => {
        console.log('RESPONSE from profiles/:id >>>>', profile);
        $('main').html(`
        <section class="page currentFriendProfile">
          <h1>Profile Page</h1>
            <div class="jsProfileData">
              <img class="centerBlock friendProfilePhoto" src="">
              <div class="friendFullName">${profile.firstName + " " + profile.lastName}</div>
              <div class="friendEmail">${profile.email}</div>
              <div class="friendRelationship">${profile.relationship}</div>
              <div class="friendBirthday">${profile.birthday}</div>
              <div class="friendPhoneNumber">${profile.phone}</div>
              <div class="friendAddress">Address:
                <div class="friendAddressStreet">${profile.address.streetName}</div>
                <div class="friendAddressCity">${profile.address.city}</div>
                <div class="friendAddressState">${profile.address.state}</div>
                <div class="friendAddressZip">${profile.address.zipCode}</div>
              </div>
            </div><br>
            <form id="wishListForm">
              Add wish list item:<br>
              <input type="text" class="wishListInput">
              <input type="submit" value="Add" id="addWishItem">
            </form>
            <div class="wishList"></div>
            <button class="btn editFriend">Edit Friend</button>
            <button class="btn dashboard">Back to Dashboard</button>	
          </section>
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
        });
      })
      .catch(handleErrors);


    
  }



  return {
    renderHomePage: renderHomePage,
    renderCreateAccountPage: renderCreateAccountPage
  };
})();
