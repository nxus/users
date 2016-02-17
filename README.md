# Nxus Users

[![Build Status](https://travis-ci.org/nxus/users.svg?branch=master)](https://travis-ci.org/nxus/users)

User management module for Nxus apps.  Users provides a complete framework for managing users, authenticating routes and sessions.

## Install

    > npm install @nxus/users --save

## Quickstart

Once Users is installed in your app, you are ready to go.  It includes the following components:

-   user/team models
-   login/logout routes
-   authentication/session middleware

## Models

Uses defines a set of common models you can use to build your application, using the @nxus/storage module (which uses Waterline to provide common ORM functionality).

### User

Accessing the user model:

    app.get('storage').getModel('user').then((User) => {
      ...
    });

**Fields**

-   email: string
-   password: string
-   nameFirst: string
-   nameLast: string
-   position: string
-   enabled: boolean
-   admin: boolean
-   lastLogin: datetime
-   metadata: JSON
-   team: relation to Team model

**Convenience Methods**

-   name(): first + last name
-   isAdmin(): boolean if user is an Admin
-   validPassword(pass): returns true if the password is valid

## Templates

Users defines a set of common templates you can use in your app

### login

A login form preconfigured to work with the login/logout routes. Markup supports basic Bootstrap 3 CSS.

    app.get('templater').render('users-login').then((content) => {
      ...
    }

## Routes

The Users module defines some convience routes for handling basic user functionality.

### /login

**Params**
Expects to recieve a POSTed form with the values `username`, `password` and `redirect`. `redirect` should be a url to redirect the user to on success.  On login failure, the user will be redirected back to /login.

### /logout

**Params**
Expects to recieve a GET request with the param `redirect`, which is a url where the user will be redirected on successful logout.

## API

### Users

[src/index.js:25-61](https://github.com/nxus/users/blob/6feb67e4adee45064dffe1e46dd7aa3e43711ccd/src/index.js#L25-L61 "Source code on GitHub")

The Users Module provides a complete user authentication and authorization system.
