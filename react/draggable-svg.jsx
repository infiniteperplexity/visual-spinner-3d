let Draggables = {};
class DragSVG extends React.Component {
  constructor(props, context) {
    super(props, context);
    Draggables[props.dragID] = this;
    this.info = {
      dragging: null,
      dragID: props.dragID
    }
  }
  handleMouseMove = (event) => {
    if (this.info.dragging) {
      event.preventDefault();
      this.info.dragging.handleMouseMove.call(this.info.dragging, event);
    }
  }
  handleMouseUp = (event) => {
    if (this.info.dragging) {
      event.preventDefault();
      this.info.dragging.handleMouseUp.call(this.info.dragging, event);
    }
  }
  handleMouseLeave = (event) => {
    if (this.info.dragging) {
      event.preventDefault();
      this.info.dragging.handleMouseUp.call(this.info.dragging, event);
    }
  }
  render() {
    return (
      <svg
        width={this.props.width}
        height={this.props.height}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseLeave={this.handleMouseLeave}
      >
        {this.props.children}
      </svg>
    );
  }
}