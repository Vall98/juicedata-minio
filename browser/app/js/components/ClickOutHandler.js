import { Component, createRef } from "react";

class ClickOutHandler extends Component {
  constructor(props) {
    super(props);
    this.wrapperRef = createRef();
  }

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = (event) => {
    const { onClickOut } = this.props;
    if (
      this.wrapperRef.current &&
      !this.wrapperRef.current.contains(event.target)
    ) {
      onClickOut && onClickOut(event);
    }
  };

  render() {
    const { children } = this.props;
    return <div ref={this.wrapperRef}>{children}</div>;
  }
}

export default ClickOutHandler;