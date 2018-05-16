class PropControls extends React.Component {
  backFrame = () => {
    let frame = this.props.frame;
    frame-=1;
    this.props.gotoFrame(frame);
  }
  forwardFrame = () => {
    let frame = this.props.frame;
    frame+=1;
    this.props.gotoFrame(frame);
  }
  render() {
    return (
      <div>
        <button onClick={this.backFrame}> {"\u2190"} </button>
        <input type="number" readOnly style={{width: 50}} value={this.props.frame} />
        <button onClick={this.forwardFrame}> {"\u2192"} </button>
      </div>
    );
  }
}

VS3D.MoveLink();