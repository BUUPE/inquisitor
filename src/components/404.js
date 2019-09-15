import React from 'react';
import { Link } from 'react-router-dom';

import * as ROUTES from '../constants/routes';
import logo from '../assets/img/logo.png';

const NotFound = () => (
  <div className="landing">
    <img src={logo} alt="UPE Logo" height="128" width="128" />

    <h1>404</h1>

    <p>
      The page you are looking for doesn't exist! <Link to={ROUTES.LANDING}>Go home</Link>.
    </p>
  </div>
);

export default NotFound;
