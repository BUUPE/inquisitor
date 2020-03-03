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
