// import React from 'react';

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      expanded: false,
      sending: false,
      user: false,
    };
  }

  /**
   * 
   * @param {*} e 
   */
  login = (e) => {
    e.preventDefault();
    this.setState({ sending: true });

    const data = new FormData(e.target);

    fetch('/api/auth/login', {
      body: JSON.stringify(Object.fromEntries(data)),
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      method: e.target.method,
    }).then((response) => response.json()).
      then(data => {
        console.log('login data', data);

        this.setState({
          sending: false,
          user: data.user,
        });
      }).catch(err => {
        console.log('login err', err);

        this.setState({
          sending: false,
        });
      });
  };

  logout = (e) => {
    e.preventDefault();
  };

  toggleNav = (e) => {
    this.setState({ expanded: !this.state.expanded });
  };

  renderLoggedIn = () => {
    const { user } = this.state;

    return <ul className="navbar-nav">
      <li className="nav-item">
        <a className="nav-link" href="/u/profile">{user.username}</a>
      </li>

      <li className="nav-item">
        <a className="nav-link" href="/u/stats">stats</a>
      </li>

      <li className="nav-item">
        <a className="nav-link" href="/u/logout"
          onClick={this.logout}>logout</a>
      </li>
    </ul>;

  };

  renderLoggedOut = () => {
    const { expanded, sending } = this.state;

    return <><button
      className="navbar-toggler"
      type="button"
      data-toggle="collapse"
      aria-controls="toggle"
      aria-expanded={expanded}
      aria-label="Toggle navigation"
      onClick={this.toggleNav}
    >
      <span className="navbar-toggler-icon"></span>
    </button>

      <div
        className={`navbar-collapse collapse justify-content-end ${expanded ? 'show' : ''}`}
        id="toggle"
      >
        <form
          method="post"
          action="/u/auth"
          id="login"
          className="navbar-nav align-items-center my-lg-0 flex-column flex-md-row"
          role="form"
          onSubmit={this.login}
        >
          <div className="d-flex flex-row">
            <div className="form-floating my-2 me-2">
              <input
                id="username"
                type="text"
                className="form-control"
                disabled={sending}
                name="username"
                placeholder="username"
              />
              <label htmlFor="username">Username</label>
            </div>

            <div className="form-floating my-2 me-md-2">
              <input
                id="password"
                type="password"
                className="form-control"
                disabled={sending}
                name="password"
                placeholder="password"
              />
              <label htmlFor="password">Password</label>
            </div>
          </div>

          <div className="d-flex">
            <button
              type="submit"
              className="btn btn-primary me-2"
              disabled={sending}
              name="login"
              value="1"
            >login</button>
            <button
              type="submit"
              disabled={sending}
              className="btn btn-primary"
              name="register"
              value="1"
            >register</button>
          </div>
        </form>
      </div></>;
  };

  render = () => {
    const { user } = this.state;

    return <div className="container-fluid">
      <a className="navbar-brand" href="/">Earls Urls</a>

      {user.id ? this.renderLoggedIn() : this.renderLoggedOut()}
    </div>;
  };
}

export default Navbar;