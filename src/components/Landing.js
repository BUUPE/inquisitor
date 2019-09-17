import React, { useContext, useEffect } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { AuthUserContext } from './Session';

import * as ROUTES from '../constants/routes';
import logo from '../assets/img/logo.png';

const Landing = ({ history }) => {
  const authUser = useContext(AuthUserContext);
  useEffect(() => {
    if (authUser) history.push(ROUTES.CREATE);
  });
  
  return (
    <div className="landing">
      <img src={logo} alt="UPE Logo" height="128" width="128" />

      <h1>Technical Interview</h1>

      <p>
        Hi there! If you've come across this page, you're probably interviewing with BU UPE (either that or you're just very curious)!
        If you are here for an interview, hang tight, your interviewer will give you a link shortly! If you know your room code, enter it <Link to={ROUTES.JOIN}>here</Link>!
        If you're an interviewer, please <Link to={ROUTES.SIGNIN}>signin</Link> and get started!
      </p>
    </div>
  );
}

export default withRouter(Landing);
