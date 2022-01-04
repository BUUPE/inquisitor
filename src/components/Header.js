import React, { useContext } from "react";
import styled from "styled-components";

import Background from "../images/main-background.png"

const SiteHeading = styled.div`
	padding:200px 0 150px;
	height:650px;
	color:#fff;
	text-align: center;
	justify-content: center;
	& h1 {
		font-size:50px;
		margin-top:0
	}
`;

const Header = () => (
  <MastHead>
    <SiteHeading>
    </SiteHeading>
  </MastHead>
);

export default withFirebase(Header);
