import React, { Component } from "react";
import Row from "react-bootstrap/Row";

class ScrollableRow extends Component {
  slider = React.createRef();
  isDown = false;
  startX = null;
  scrollLeft = null;

  handleMouseDown = (e) => {
    this.isDown = true;
    this.startX = e.pageX - this.slider.current.offsetLeft;
    this.scrollLeft = this.slider.current.scrollLeft;
  };
  handleMouseUp = (e) => {
    this.isDown = false;
  };
  handleMouseMove = (e) => {
    if (!this.isDown) return;
    e.preventDefault();
    const x = e.pageX - this.slider.current.offsetLeft;
    const walk = (x - this.startX) * 3; //scroll-fast
    this.slider.current.scrollLeft = this.scrollLeft - walk;
  };
  handleMouseLeave = (e) => {
    this.isDown = false;
  };

  render() {
    return (
      <Row
        style={{
          flexWrap: "unset",
          overflowX: "auto",
          justifyContent: "flex-start",
        }}
        ref={this.slider}
        onMouseDown={this.handleMouseDown}
        onMouseLeave={this.handleMouseLeave}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
      >
        {this.props.children}
      </Row>
    );
  }
}

export default ScrollableRow;
