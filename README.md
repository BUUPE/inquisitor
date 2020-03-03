# Inquisitor
This repository contains the code for BU UPE's recruitment tool. This covers new member applications, interview timeslot matching, conducting of the interviews, candidate slide generation, and deliberations. The front-end is a [React.js](https://reactjs.org/)/[Redux](https://react-redux.js.org/) application built with [React Bootstrap](https://react-bootstrap.github.io/). The server runs on [Express.js](https://expressjs.com/) and [Socket.io](https://socket.io/), with data stored in a [PostgreSQL](https://www.postgresql.org/) database. Authentication relies on the BU [Shibboleth](https://en.wikipedia.org/wiki/Shibboleth_(Shibboleth_Consortium)) IDP, and the entire application is hosted on [Heroku](https://www.heroku.com/).

## Installation
### Prerequisites
Before installing Inquisitor, make sure you have the following prerequisites already installed on your machine:
- [Node.js](https://nodejs.org/en/)
- [Yarn](https://yarnpkg.com/)

### Setup
Setting up Inquisitor is similar to other React applications, simply `git clone` and `cd` into the project directory and run `yarn install` to install dependencies for both the server and client. Then copy `.env.example` to `.env` and fill in the necessary variables. Ask someone who has setup the system before if you need help generating/finding them.

### Running
To run the front-end, simply run `yarn start` in the root directory. To run the server, run `node ./server/index.js`. A shorthand for this is `yarn server`, which will build compile the React application into static files for the server to run. Note that the server can only serve built static files. However, you can run the React app with `yarn start` in one terminal and run the server with `node ./server/index.js` in another so that you have hot-reloading for React.

## Contributing
Before contributing, note that we use the [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) branching model. Please read that article in its entirety if you are unfamiliar with the concept. Also, if you don't have the bindings installed already, please [install them](https://github.com/nvie/gitflow/wiki/Installation). If you need a quick refresher on Git Flow, check out this [cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/). If you haven't already done so, run `git flow init -d` in the project root. This will setup your local repository to match the branching model of the remote (`master` and `develop` with feature branches etc.). Make sure you follow the Git Flow model when making any features/changes (you won't have access to push changes directly to `master` or `develop` anyways). Furthermore, before making any changes to the repository, set up [EditorConfig](https://editorconfig.org/) on your machine/editor. This will help maintain code style throughout the project.

As a reminder, this project uses the [React Bootstrap](https://react-bootstrap.github.io/) design library, so try to use it as much as possible to ensure a uniform look throughout the app and to prevent reinventing the wheel too often. Reading through the list of available components would be a good first step.

Otherwise, check out the issues and take one that's unassigned! If you have any questions, please reach out to @ROODAY or @Warren-Partridge.
