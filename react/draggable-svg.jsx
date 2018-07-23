let Draggables = {};
class DragSVG extends React.PureComponent {
  constructor(props, context) {
    super(props, context);
    Draggables[props.dragID] = this;
    this.localState = {
      dragging: null
    }
  }
  handleMouseMove = (event) => {
    if (this.localState.dragging) {
      event.preventDefault();
      this.localState.dragging.handleMouseMove.call(this.localState.dragging, event);
    }
  }
  handleMouseUp = (event) => {
    if (this.localState.dragging) {
      event.preventDefault();
      this.localState.dragging.handleMouseUp.call(this.localState.dragging, event);
    }
  }
  handleMouseLeave = (event) => {
    if (this.localState.dragging) {
      event.preventDefault();
      this.localState.dragging.handleMouseUp.call(this.localState.dragging, event);
    }
  }
  avoidContextMenu = (event) =>{
    event.preventDefault();
    return false;
  }
  render() {
    return (
      <svg
        width={this.props.width}
        height={this.props.height}
        onMouseMove={this.handleMouseMove}
        onMouseUp={this.handleMouseUp}
        onMouseLeave={this.handleMouseLeave}
        onContextMenu={this.avoidContextMenu}
      >
        {this.props.children}
      </svg>
    );
  }
}