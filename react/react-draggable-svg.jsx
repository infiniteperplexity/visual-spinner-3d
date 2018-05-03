class DraggableSVG extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.dsvg_dragging = null;
  }
  handleMouseMove = (event) => {
    if (this.dsvg_dragging) {
      event.preventDefault();
      this.dsvg_dragging.handleMouseMove.call(this.dragging, event);
    }
  }
  handleMouseUp = (event) => {
    if (this.dsvg_dragging) {
      event.preventDefault();
      this.dsvg_dragging.handleMouseUp.call(this.dragging, event);
    }
  }
  render() {
    return (
      <svg 
        ref={(e)=>(this.dsvg_element=e)}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp} 
        ...this.props} >
        {this.props.children}
      </svg>
    );
  }
}

class DraggableG extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      dsvg_dragged: false,
      dsvg_xoffset: 0,
      dsvg_yoffset: 0,
      dsvg_x: 0,
      dsvg_y: 0
    };
    if (!props.svg) {
      throw new Error("DraggableG not provided with a parent DraggableSVG.");
    }
    this.dsvg_parent = props.svg;
  }
  componentDidMount() {
    let e = this.dsvg_gelement;
    while (e.nodeName!=="svg") {
      e = e.parentNode;
      if (e===null) {
        return null;
      }
    }
    // matrix transformation stuff
    this.dsvg_point = e.createSVGPoint();
    this.dsvg_matrix = this.dsvg_gelement.getScreenCTM().inverse();
  }
  handleMouseDown = (event) => {
    event.preventDefault();
    this.setState({dsvg_dragged: true});
    this.dsvg_parent.dsvg_element.dsvg_dragging = this;
    // note: harmless violation of React state management practices
    this.dsvg_point.x = event.clientX;
    this.dsvg_point.y = event.clientY;
    let p = this.dsvg_point.matrixTransform(this.dsvg_matrix);
    this.setState({dsvg_xoffset: p.x - this.state.dsvg_x});
    this.setState({dsvg_yoffset: p.y - this.state.dsvg_y});
  }
  handleMouseUp = (event) => {
    event.preventDefault();
    this.setState({dsvg_dragged: false});
    this.dsvg_component.dsvg_element.dsvg_dragging = null;
  }
  handleMouseMove = (event) => {
    event.preventDefault();
    // note: harmless violation of React state management practices
    this.dsvg_point.x = event.clientX;
    this.dsvg_point.y = event.clientY;
    if(this.state.dsvg_dragged) {
      let p = this.dsvg_point.matrixTransform(this.dsvg_matrix);
      this.setState({dsvg_x: p.x-this.state.dsvg_xoffset});
      this.setState({dsvg_y: p.y-this.state.dsvg_yoffset});
    }
  }
  render() {
    return (
      <g 
        ref={(e)=>(this.dsvg_gelement=e)}
        transform={"translate("+this.state.dsvg_x+","+this.state.dsvg_y+")"}
        onMouseDown={this.handleMouseDown}
        onMouseUp={this.handleMouseUp}
        onMouseMove={this.handleMouseMove}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.props.children}
      </g>
    );
  }
}