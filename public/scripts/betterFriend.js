/* global $ api store */

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

  
  function renderDashboardPage() {
    $('main').html(`
      <section class="page dashboard">
        <h1>Dashboard Page</h1>
        <button class="btn jsCreateNewFriend">Create New Friend Profile</button>
        <button class="btn jsLogout">Log Out</button>
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
          `;
        });
        $('.jsProfilesContainer').html(htmlProfiles);
        $('.jsDashboardProfile').on('click', function() {
          targetedProfileId = $(this).attr('data-id');
          renderFriendProfilePage(targetedProfileId);
        });
      })
      .catch(handleErrors);

    $('.jsCreateNewFriend').on('click', function() {
      renderCreateFriendPage();
    });
    $('.jsLogout').on('click', function() {
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
        <button class="btn jsCancelNewFriendCreate" id="createBfAccount">Cancel</button>
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
  }

  function renderFriendProfilePage(profileId) {
    console.log('RENDER FRIEND PROFILE RAN');
    api
      .search(`/api/profiles/${profileId}`)
      .then(profile => {
        $('main').html(`
        <section class="page currentProfile">
          <h1>Profile Page</h1>
            <div class="jsProfileData">
              <img class="centerBlock friendProfilePhoto" src="">
              <button class="btn jsEditFriend">Edit Friend</button>
              <button class="btn jsBackToDashboard">Back to Dashboard</button>	
              <div class="friendFullName">${profile.firstName +
                ' ' +
                profile.lastName}</div>
              <div class="friendEmail">${profile.email}</div>
              <div class="friendRelationship">${profile.relationship}</div>
              <div class="friendBirthday">${profile.birthday}</div>
              <div class="friendPhoneNumber">${profile.phone}</div>
              <div class="friendAddress">Address:
                <div class="friendAddressStreet">${
                  profile.address.streetName
                }</div>
                <div class="friendAddressCity">${profile.address.city}</div>
                <div class="friendAddressState">${profile.address.state}</div>
                <div class="friendAddressZip">${profile.address.zipCode}</div>
              </div>
            </div><br>
            <form id="jsWishListForm">
              <fieldset>
                <legend>Add wish list item:<br></legend>
                  <div>
                    <label for="wishItem">Wish idea:</label>
                    <input type="text" name="wishItem" class="jsWishItemEntry">
                  </div>
                  <button type="submit" id="jsAddWishItem">Add Wish</button>
              </fieldset>
            </form>
            <div class="jsWishListData">
            </div>
        </section>
        `);
        let htmlWishList = profile.wishList.map(function(wish) {
          return `
          <li data-id="${wish._id}">
            <span class="wishListItem">${wish.wishItem}</span>
            <div class="wishListItemControls">
              <button class="jsDeleteWishItem">
                <span class="deleteButtonLabel">Delete</span>
              </button>
            </div>
          </li>
          `;
        });
        $('.jsWishListData').html(htmlWishList);

        $('.jsEditFriend').on('click', function() {
          renderEditFriendPage(profileId);
        });

        $('.jsBackToDashboard').on('click', function() {
          renderDashboardPage();
        });

        $('.currentProfile').on('click', '#jsAddWishItem', function(event) {
          event.preventDefault();
          let wishListItemEntry = $('.jsWishItemEntry').val();
          let newWishItem = {
            wishItem: wishListItemEntry
          };
          api
            .create(`api/profiles/${profileId}/wishItem`, newWishItem)
            .then(response => {
              let wishItemId = response._id;
              $('.jsWishItemEntry').val('');
              $('.jsWishListData').append(`
                <li data-id="${wishItemId}">
                  <span class="wishListItem">${response.wishItem}</span>
                  <div class="wishListItemControls">
                    <button class="jsDeleteWishItem">
                      <span class="deleteButtonLabel">Delete</span>
                    </button>
                  </div>
                </li>
              `);
            })
            .catch(handleErrors);
        });

        $('.currentProfile').on('click', '.jsDeleteWishItem', function(event) {
          event.preventDefault();
          let currentListItem = $(this).closest('li');
          let currentListItemId = currentListItem.attr('data-id');
          let wishToRemove = {
            _id: currentListItemId
          };
          api
            .remove(`api/profiles/${profileId}/wishItem`, wishToRemove)
            .then(res => {
              showSuccessMessage(`Deleted ${currentListItemId}`);
            })
            .catch(handleErrors);
          $(this)
            .closest('li')
            .remove();
        });
      })
      .catch(handleErrors);
  }

  function renderEditFriendPage(profileId) {
    api
    .search(`/api/profiles/${profileId}`)
    .then(profile => {
      console.log('PROFILE ON EDIT FRIEND', profile);
      $('main').html(`
      <section class="page editFriend">
      <h1>EDIT Friend Page</h1>
      <form id="editFriendForm" class="jsEditFriendForm">
        <fieldset>
          <legend>Edit ${profile.firstName}'s Profile</legend>
          <div>
            <label for="firstName">First name:</label>
            <input type="text" name="firstName" class="jsEditFriendFirstNameEntry" placeholder="${profile.firstName}">
          </div>
          <div>
            <label for="lastName">Last name:</label>
            <input type="text" name="lastName" class="jsEditFriendLastNameEntry" placeholder="${profile.lastName}">
          </div>
          <div>
            <label for="email">Email:</label>
            <input type="text" name="email" class="jsEditFriendEmailEntry" placeholder="${profile.email}">
          </div>
          <div>
            <label for="relationship">Relationship:</label>
            <input type="text" name="relationship" class="jsEditFriendRelationshipEntry" placeholder="${profile.relationship}">
          </div>
          <div>
            <label for="birthday">Birthday:</label>
            <input type="date" name="birthday" class="jsEditFriendBirthdayEntry" placeholder="${profile.birthday}">
          </div>
          <div>
            <label for="phone">Phone:</label>
            <input type="text" name="phone" class="jsEditFriendPhoneEntry" placeholder="${profile.birthday}">
          </div>
          <fieldset>
            <legend>Address:</legend>
            <div>
              <label for="street">Street:</label>
              <input type="text" name="street" class="jsEditFriendStreetEntry" placeholder="${profile.address.streetName}">
            </div>
            <div>
              <label for="city">City:</label>
              <input type="text" name="city" class="jsEditFriendCityEntry" placeholder="${profile.address.city}">
            </div>
            <div>
              <label for="state">State:</label>
              <input type="text" name="state" class="jsEditFriendStateEntry" placeholder="${profile.address.state}">
            </div>
            <div>
              <label for="zipcode">Zip:</label>
              <input type="text" name="zipcode" class="jsEditFriendZipCodeEntry" placeholder="${profile.address.zipCode}">
            </div>
          </fieldset>
          <button type="submit" class="btn jsSaveEditedProfile">Save</button>
          <button type="button" class="btn jsCancelEditProfile">Cancel</button>
        </fieldset>
      </form>
      </section>
      `);

      $('.jsEditFriendForm').on('submit', function(event) {
        event.preventDefault();
        // Need to grab every value of the new profile and make a POST to /api/profiles
        const editProfileForm = $(event.currentTarget);
        const updatedProfile = {
          firstName: $('.jsEditFriendFirstNameEntry').val(),
          lastName: $('.jsEditFriendLastNameEntry').val(),
          email: $('.jsEditFriendEmailEntry').val(),
          relationship: $('.jsEditFriendRelationshipEntry').val(),
          birthday: $('.jsEditFriendBirthdayEntry').val(),
          phone: $('.jsEditFriendPhoneEntry').val(),
          address: {
            streetName: $('.jsEditFriendStreetEntry').val(),
            city: $('.jsEditFriendCityEntry').val(),
            state: $('.jsEditFriendStateEntry').val(),
            zipCode: $('.jsEditFriendZipCodeEntry').val()
          },
          _id: profileId
        };
  
        api
          .update(`/api/profiles/${profileId}`, updatedProfile)
          .then(response => {
            editProfileForm[0].reset();
            console.log('PUT Response', response);
            // store.profiles.push(response);
            showSuccessMessage(
              `${updatedProfile.firstName} has been added to your Dashboard`
            );
          })
          .catch(handleErrors);
      });

      $('.jsCancelEditProfile').on('click', function() {
        renderFriendProfilePage(profileId);
      });
      })
    .catch(handleErrors);


      // need to make a PUT to /profiles with updated info

    console.log('PROFILE ID IN EDIT FRIEND>>>>>', profileId);
  }

  return {
    renderHomePage: renderHomePage,
    renderCreateAccountPage: renderCreateAccountPage
  };
})();
