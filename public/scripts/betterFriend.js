'use strict';

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

  //=====Render Functions=====//

  // =====HTML Functions=====//
  function renderHomePage() {
    $('main').html(
      `
    <section class="page home">
    <h1>Home Page</h1>
      <h4>Never give boring presents again</h4>
      <button class="btn login">Login</button>
      <button class="btn createBfAccount">Create Account</button>
    </section>
    `
    );
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
    $('#createBfAccount').on('click', function() {
      renderCreateAccountPage();
    });

    $('.jsLoginForm').on('submit', event => {
      event.preventDefault();
      renderDashboardPage();
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
			<button type="submit">Create Account</button>
			<button class="btn home">Cancel</button>
      <button class="btn login">Have an account? Login here!</button>
      </fieldset>
		</form>
  </section>
  `);
    $('.btn.login').on('click', function() {
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

      api.create('/api/users', newUser)
        .then(response => {
          signupForm[0].reset();
          showSuccessMessage(`Woohoo! Welcome to BetterFriend ${response.firstName}`)
        })
        .catch(handleErrors)
      renderLoginPage();
    });
  }

  function generateLoginPage() {}

  function generateCreateAccountPage() {}

  function generateProfilesList() {}

  function generateWishList() {}

  //===== Event Handlers =====//
  function handleCreateAccountSubmit() {}

  function handleLoginSubmit() {}

  //=====  =====//

  return {
    renderHomePage: renderHomePage,
    renderCreateAccountPage: renderCreateAccountPage
  };
})();
