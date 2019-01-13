/* global $, api, store, localStorage, jwt_decode, moment */

'use strict';

// eslint-disable-next-line no-unused-vars
const betterFriend = (function() {
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

  //=====Render HTML Functions=====//
  function renderHomePage() {
    $('main').html(`
      <section class="home-page">
        <div class="wrapper">
          <h1>BetterFriend</h1>
          <p id="home-description">It's the day before your best friend's birthday. You know exactly what you're getting them, right? Let's be real, you probably don't. Never give another boring gift again. <br><br>Become a BetterFriend. </p>
          <ul id="buttons-home-page">
            <li><button id="jsToLogin">Login</button></li>
            <li><button id="jsToCreateAcct">Create Account</button></li>
          </ul>
        </div>
      </section>
    `);
    $('#jsToLogin').on('click', function() {
      renderLoginPage();
    });
    $('#jsToCreateAcct').on('click', function() {
      renderCreateAccountPage();
    });
  }

  function renderCreateAccountPage() {
    $('main').html(`
      <section class="create-account-page">
        <div class="wrapper">
          <div class="inner">
            <h1>Create Account</h1>
            <div class="break-line"></div>
            <form id="jsCreateAccountForm" class="create-account-form">
              <fieldset>
                <div>
                  <input type="text"  name="userName" placeholder="Username" required>
                </div>
                <div>
                  <input type="password" name="password" placeholder="Password" minlength="6" required>
                </div>
                <div>
                  <input type="text" name="firstName" placeholder="First Name" required>
                </div>
                <div>
                  <input type="text" name="lastName" placeholder="Last Name" required>
                </div>
                <div>
                  <input type="email" name="email" placeholder="email@address.com" required>
                </div>
                <button type="submit" class="cta" id="create-account-submit">Create</button>
              </fieldset>
            </form>
            <a id="jsToLoginPage">Already have an account?</a>
          </div>
        </div>
      </section>
    `);
    $('#jsToLoginPage').on('click', function() {
      renderLoginPage();
    });

    $('#jsCreateAccountForm').on('submit', event => {
      event.preventDefault();
      const signupForm = $(event.currentTarget);
      const newUser = {
        userName: signupForm.find('input[name="userName"]').val(),
        password: signupForm.find('input[name="password"]').val(),
        firstName: signupForm.find('input[name="firstName"]').val(),
        lastName: signupForm.find('input[name="lastName"]').val(),
        email: signupForm.find('input[name="email"]').val()
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
      <section class="login-page">
        <div class="wrapper">
          <div class="inner">
            <h1>Sign In</h1>
            <div class="break-line"></div>
            <form id="jsLoginForm" class="login-form">
              <legend>Demo Use<br>Username: 'user' <br> Password: 'password' </legend>
              <fieldset>
                <div>
                  <input type="text" name="userName" placeholder="Username" required>
                </div>
                <div>
                  <input type="password" name="password" placeholder="Password" required>
                </div>
                <button type="submit" class="cta" id="login-submit">Login</button>
              </fieldset>
            </form>
            <a id="jsToCreateAccountPage">New? Signup here</a>
          </div>
        </div>
      </section>
    `);

    $('#jsLoginForm').on('submit', event => {
      event.preventDefault();

      const loginForm = $(event.currentTarget);
      const loginUser = {
        userName: loginForm.find('input[name="userName"]').val(),
        password: loginForm.find('input[name="password"]').val()
      };

      api
        .create('/api/login', loginUser)
        .then(response => {
          store.authToken = response.authToken;
          store.authorized = true;
          store.currentUser = jwt_decode(store.authToken);
          localStorage.setItem('authToken', store.authToken);
          localStorage.setItem('authorized', store.authorized);
          localStorage.setItem('currentUser', store.currentUser);
          loginForm[0].reset();
          showSuccessMessage(
            `Welcome back, ${store.currentUser.user.firstName}!`
          );
          renderDashboardPage();
        })
        .catch(handleErrors);
    });

    $('#jsToCreateAccountPage').on('click', function() {
      renderCreateAccountPage();
    });
  }

  function renderDashboardPage() {
    $('main').html(`
      <div class="dashboard-page">
        <div class="dashboard-wrapper">
          <div class="dashboard-header">
            <h1>Dashboard</h1>
            <div class="break-line"></div>
            <div class="dashboard-nav">
              <button id="jsLogOut" class="cta2">Log Out</button>
              <button id="jsToCreateNewFriend" class="cta">Create New Friend</button>
            </div>
          </div>
          <div class="dashboard-inner">
            <div id="jsProfilesContainer" class="dashboard-profiles-container"></div>
          </div>
        </div>
      </div>
    `);

    api
      .search('/api/profiles')
      .then(dbResponse => {
        store.profiles = dbResponse;
        let targetedProfileId;
        let htmlProfiles = store.profiles.map(function(profile) {
          return `
          <div class="jsDashboardProfile" data-id="${profile._id}">
            <img src="${profile.imgUrl || ''}" class="dashboard-profile-photo"></img>
            <p class="dashboard-profile-name">${
              profile.firstName
            } ${profile.lastName}</p>
          </div>
          `;
        });
        $('#jsProfilesContainer').html(htmlProfiles);
        $('.jsDashboardProfile').on('click', function() {
          targetedProfileId = $(this).attr('data-id');
          renderFriendProfilePage(targetedProfileId);
        });
      })
      .catch(handleErrors);

    $('#jsToCreateNewFriend').on('click', function() {
      renderCreateFriendPage();
    });
    $('#jsLogOut').on('click', function() {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authorized');
      localStorage.removeItem('currentUser');
      showSuccessMessage(`Log out successful`);
      renderHomePage();
    });
  }

  function renderCreateFriendPage() {
    $('main').html(`
      <section class="create-friend-page">
        <div class="inner">
          <h1>Create New Friend</h1>
          <div class="break-line"></div>
          <form id="jsCreateFriendForm">
            <fieldset>
              <div>
                <input type="text" name="firstName" placeholder="First Name (required)" required>
              </div>
              <div>
                <input type="text" name="lastName" placeholder="Last Name (required)" required>
              </div>
              <div>
                <input type="text" name="email" placeholder="email@address.com">
              </div>
              <div>
                <input type="text" name="relationship" placeholder="Relationship">
              </div>
              <div>
                <input type="date" name="birthday" placeholder="12/15/1950">
              </div>
              <div>
                <input type="text" name="phone" placeholder="(555) 867-5309">
              </div>
              <fieldset>
                <legend>Address</legend>
                <div>
                  <input type="text" name="streetName" placeholder="Street">
                </div>
                <div>
                  <input type="text" name="city" placeholder="City">
                </div>
                <div>
                  <input type="text" name="state" placeholder="State">
                </div>
                <div>
                  <input type="text" name="zipCode" placeholder="Zip">
                </div>
              </fieldset>
              <button type="submit" class="cta">Create</button>
              <button id="jsCancelCreateFriend" class="cta2">Cancel</button>
            </fieldset>
          </form>
        </div>
      </section>
    `);

    $('#jsCreateFriendForm').on('submit', function(event) {
      event.preventDefault();
      const newProfileForm = $(event.currentTarget);

      let newImgUrl;

      $.ajax({
        url: 'https://randomuser.me/api/',
        async: false,
        dataType: 'json',
        success: function(data) {
          console.log(data);
          newImgUrl = data.results[0].picture.large;
        }
      });

      const newProfile = {
        firstName: newProfileForm.find('input[name="firstName"]').val(),
        lastName: newProfileForm.find('input[name="lastName"]').val(),
        email: newProfileForm.find('input[name="email"]').val(),
        relationship: newProfileForm.find('input[name="relationship"]').val(),
        birthday: newProfileForm.find('input[name="birthday"]').val(),
        address: {
          streetName: newProfileForm.find('input[name="streetName"]').val(),
          city: newProfileForm.find('input[name="city"]').val(),
          state: newProfileForm.find('input[name="state"]').val(),
          zipCode: newProfileForm.find('input[name="zipCode"]').val()
        },
        phone: newProfileForm.find('input[name="phone"]').val(),
        imgUrl: newImgUrl
      };

      api
        .create('/api/profiles', newProfile)
        .then(response => {
          newProfileForm[0].reset();
          store.profiles.push(response);
          showSuccessMessage(
            `${newProfile.firstName} has been added to your Dashboard`
          );
          renderFriendProfilePage(response._id);
        })
        .catch(handleErrors);
    });

    $('#jsCancelCreateFriend').on('click', function() {
      renderDashboardPage();
    });
  }

  function renderFriendProfilePage(profileId) {
    api
      .search(`/api/profiles/${profileId}`)
      .then(profile => {
        console.log('PROFILE>>>>>', profile.imgUrl);
        $('main').html(`
          <section class="current-profile-page">
            <div class="inner">
              <img src="${profile.imgUrl || ''}" class="profile-photo"></img>
              <h1>${profile.firstName} ${profile.lastName}</h1>
              <div class="break-line"></div>
              <div class="profile-nav">
                <button id="jsBackToDashboard" class="cta2">Back to Dashboard</button>
                <button id="jsToEditFriend" class="cta">Edit Friend</button>
              </div>
              <div class="profile-details-container">
                <div class="paragraph1">
                  Relationship:<br>
                  Email:<br>
                  Birthday:<br>
                  Phone:<br><br>

                  Street:<br>
                  City:<br>
                  State:<br>
                  Zip:<br>
                </div>
                <div class="paragraph2">
                  ${profile.relationship}<br>
                  ${profile.email}<br>
                  ${moment(profile.birthday).format('MMM Do, YYYY') || ''}<br>
                  ${profile.phone}<br><br>

                  ${profile.address.streetName}<br>
                  ${profile.address.city}<br>
                  ${profile.address.state}<br>
                  ${profile.address.zipCode}<br>
                </div>
              </div>
                <form id="jsWishListForm">
                  <fieldset>
                    <h2>Wish List</h2>
                      <div class="wish-input-container">
                        <input type="text" name="wishItem" class="jsWishItemEntry" placeholder="New wish item">
                        <input type="submit" id="jsAddWishItem" class="add-wish-icon">
                      </div>
                  </fieldset>
                </form>
              <div class="jsWishListData"></div>
            </div>
          </section>
        `);
        let htmlWishList = profile.wishList.map(function(wish) {
          return `
            <li data-id="${wish._id}">
              <div class="delete-wish-icon"></div>
              <div class="wish-list-item">${wish.wishItem}</div>
            </li>
          `;
        });
        $('.jsWishListData').html(htmlWishList);

        $('#jsToEditFriend').on('click', function() {
          renderEditFriendPage(profileId);
        });

        $('#jsBackToDashboard').on('click', function() {
          renderDashboardPage();
        });

        $('.current-profile-page').on('click', '#jsAddWishItem', function(
          event
        ) {
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
              $('.jsWishListData').prepend(`
                <li data-id="${wishItemId}">
                  <div class="delete-wish-icon"></div>
                  <div class="wish-list-item">${response.wishItem}</div>
                </li>
              `);
            })
            .catch(handleErrors);
        });

        $('.current-profile-page').on('click', '.delete-wish-icon', function(
          event
        ) {
          event.preventDefault();
          let currentListItem = $(this).closest('li');
          let currentListItemId = currentListItem.attr('data-id');
          let wishToRemove = {
            _id: currentListItemId
          };
          api
            .remove(`api/profiles/${profileId}/wishItem`, wishToRemove)
            .then(() => {
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
        $('main').html(`
          <section class="edit-friend-page">
            <div class="inner">
              <h1>Edit Profile</h1>
              <div class="break-line"></div>
              <form id="jsEditFriendForm">
                <fieldset>
                  <div>
                    <input type="text" name="firstName" value="${
                      profile.firstName
                    }" placeholder="First Name" required>
                  </div>
                  <div>
                    <input type="text" name="lastName" value="${
                      profile.lastName
                    }" placeholder="Last Name" required>
                  </div>
                  <div>
                    <input type="text" name="email" value="${
                      profile.email
                    }" placeholder="Email">
                  </div>
                  <div>
                    <input type="text" name="relationship" value="${
                      profile.relationship
                    }" placeholder="Relationship">
                  </div>
                  <div>
                    <input type="date" name="birthday" value="${
                      profile.birthday
                    }" placeholder="Birthday">
                  </div>
                  <div>
                    <input type="text" name="phone" value="${
                      profile.phone
                    }" placeholder="Phone">
                  </div>
                  <fieldset>
                    <legend>Address:</legend>
                    <div>
                      <input type="text" name="streetName" value="${
                        profile.address.streetName
                      }" placeholder="Street">
                    </div>
                    <div>
                      <input type="text" name="city" value="${
                        profile.address.city
                      }" placeholder="City">
                    </div>
                    <div>
                      <input type="text" name="state" value="${
                        profile.address.state
                      }" placeholder="State">
                    </div>
                    <div>
                      <input type="text" name="zipCode" value="${
                        profile.address.zipCode
                      }" placeholder="Zip">
                    </div>
                  </fieldset>
                  <button type="submit" class="cta">Save</button>
                  <button type="button" id="jsCancelEditFriend" class="cta2">Cancel</button>
                </fieldset>
              </form>
            </div>
          </section>
      `);

        $('#jsEditFriendForm').on('submit', function(event) {
          event.preventDefault();
          const editProfileForm = $(event.currentTarget);
          const updatedProfile = {
            firstName: editProfileForm.find('input[name="firstName"]').val(),
            lastName: editProfileForm.find('input[name="lastName"]').val(),
            email: editProfileForm.find('input[name="email"]').val(),
            relationship: editProfileForm
              .find('input[name="relationship"]')
              .val(),
            birthday: editProfileForm.find('input[name="birthday"]').val(),
            phone: editProfileForm.find('input[name="phone"]').val(),
            address: {
              streetName: editProfileForm
                .find('input[name="streetName"]')
                .val(),
              city: editProfileForm.find('input[name="city"]').val(),
              state: editProfileForm.find('input[name="state"]').val(),
              zipCode: editProfileForm.find('input[name="zipCode"]').val()
            },
            _id: profileId
          };

          api
            .update(`/api/profiles/${profileId}`, updatedProfile)
            .then(() => {
              editProfileForm[0].reset();
              showSuccessMessage(
                `${updatedProfile.firstName} has been updated!`
              );
              renderFriendProfilePage(updatedProfile._id);
            })
            .catch(handleErrors);
        });

        $('#jsCancelEditFriend').on('click', function() {
          renderFriendProfilePage(profileId);
        });
      })
      .catch(handleErrors);
  }

  return {
    renderHomePage: renderHomePage,
    renderDashboardPage: renderDashboardPage,
    renderCreateAccountPage: renderCreateAccountPage
  };
})();
