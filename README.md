# Inquisitor

Inquisitor is BU UPE's end-to-end system for recruitment. It handles applications, interview timeslot selection, interviews, deliberations, and results all through a single portal. Inquisitor is a [Gatsby](https://www.gatsbyjs.org/)/[React](https://reactjs.org/) application built with [React Bootstrap](https://react-bootstrap.github.io/) (as well as our own [component library](https://github.com/BUUPE/React-Components)), with [Firebase](https://firebase.google.com/) for the backend and hosted on [GitHub Pages](https://pages.github.com/). Authentication through BU's [Shibboleth](https://en.wikipedia.org/wiki/Shibboleth_Single_Sign-on_architecture) IDP is handled through our [Authenticator](https://github.com/BUUPE/Authenticator) service, which returns Firebase tokens.

## Installation

First, make sure you have [Node.js](https://nodejs.org/en/) and [Yarn](https://yarnpkg.com/) installed. Then just clone the repo and run `yarn install` in the root directory to install dependencies, and `yarn develop` to start the development server. Once you're up and running, feel free to start making changes and submit pull requests (just make sure you follow the CONTRIBUTING guidelines).
