import React, { Component } from 'react'
import PropTypes from 'prop-types'

const parentStyles = {
  overflow: 'hidden',
  position: 'relative'
}

const defaultStyles = {
  position: 'relative',
  cursor: 'pointer',
  display: 'block',
  float: 'left'
}

const defaultStatusStyles = {
  fontSize: '12px',
  color: '#666',
  float: 'left',
  position: 'absolute',
  width: 'auto',
  top: '-5px',
  textAlign: 'left',
  pointerEvents: 'none'
}

const getHalfStarStyles = (color, uniqueness) => {
  return `
    .react-stars-${uniqueness}:before {
      position: absolute;
      overflow: hidden;
      display: block;
      z-index: 1;
      top: 0; left: 0;
      width: 50%;
      content: attr(data-forhalf);
      color: ${color};
  }`
}

class ReactStars extends Component {

  constructor(props) {

    super(props)

    // set defaults

    props = Object.assign({}, props)

    this.state = {
      uniqueness: (Math.random() + '').replace('.', ''),
      value: props.value || 0,
      stars: [],
      halfStar: {
        at: Math.floor(props.value),
        hidden: props.half && props.value % 1 < 0.5
      },
      hoverIndex: 0,
    }

    this.state.config = {
      count: props.count,
      size: props.size,
      char: props.char,
      // default color of inactive star
      color1: props.color1,
      // color of an active star
      color2: props.color2,
      half: props.half,
      edit: props.edit,
      showStatus: props.showStatus,
      statusColor: props.statusColor,
      statusFontSize: props.statusFontSize,
      statusWidth: props.statusWidth,
    }

  }

  componentDidMount() {
    this.setState({
      stars: this.getStars(this.state.value)
    })
  }

  componentWillReceiveProps(props) {
    this.setState({
      stars: this.getStars(props.value),
      value: props.value,
      halfStar: {
        at: Math.floor(props.value),
        hidden: this.state.config.half && props.value % 1 < 0.5
      }
    })
  }

  isDecimal(value) {
    return value % 1 !== 0
  }

  getRate() {
    let stars
    if (this.state.config.half) {
      stars = Math.floor(this.state.value)
    } else {
      stars = Math.round(this.state.value)
    }
    return stars
  }

  getStars(activeCount) {
    if (typeof activeCount === 'undefined') {
      activeCount = this.getRate()
    }
    let stars = []
    for (let i = 0; i < this.state.config.count; i++) {
      stars.push({
        active: i <= activeCount - 1
      })
    }
    return stars
  }

  mouseOver(event) {
    let { config, halfStar } = this.state
    if (!config.edit) return;
    let index = Number(event.target.getAttribute('data-index'))
    if (config.half) {
      const isAtHalf = this.moreThanHalf(event, config.size)
      halfStar.hidden = isAtHalf
      if (isAtHalf) index = index + 1
      halfStar.at = index
    } else {
      index = index + 1
    }
    if (this.props.onHover) {
      this.props.onHover(true, index);
    }
    this.setState({
      stars: this.getStars(index),
      hoverIndex: index,
    })
  }

  moreThanHalf(event, size) {
    let { target } = event
    var mouseAt = event.clientX - target.getBoundingClientRect().left
    mouseAt = Math.round(Math.abs(mouseAt))
    return mouseAt > size / 2
  }

  mouseLeave() {
    const { value, halfStar, config } = this.state
    if (!config.edit) return
    if (config.half) {
      halfStar.hidden = !this.isDecimal(value)
      halfStar.at = Math.floor(this.state.value)
    }
    if (this.props.onHover) {
      this.props.onHover(false);
    }
    this.setState({
      stars: this.getStars(),
      hoverIndex: 0,
    })
  }

  clicked(event) {
    const { config, halfStar } = this.state
    if (!config.edit) return
    let index = Number(event.target.getAttribute('data-index'))
    let value
    if (config.half) {
      const isAtHalf = this.moreThanHalf(event, config.size)
      halfStar.hidden = isAtHalf
      if (isAtHalf) index = index + 1
      value = isAtHalf ? index : index + .5
      halfStar.at = index
    } else {
      value = index = index + 1
    }
    this.setState({
      value: value,
      stars: this.getStars(index),
    })
    this.props.onChange(value)
  }

  renderHalfStarStyleElement() {
    const { config, uniqueness } = this.state
    return (
      <style dangerouslySetInnerHTML={{
        __html: getHalfStarStyles(config.color2, uniqueness)
      }}></style>
    )
  }

  renderStars() {
    const { halfStar, stars, uniqueness, config, currentStatus, hoverIndex } = this.state
    const { color1, color2, size, char, half, edit, showStatus, statusColor,
    statusWidth, statusFontSize } = config
    const selectedStars = stars.filter((star) => star.active);
    return stars.map((star, i) => {
      let starClass = ''
      if (half && !halfStar.hidden && halfStar.at === i) {
        starClass = `react-stars-${uniqueness}`
      }
      const style = Object.assign({}, defaultStyles, {
        color: star.active ? color2 : color1,
        cursor: edit ? 'pointer' : 'default',
        fontSize: `${size}px`
      });
      const statusStyle = Object.assign({}, defaultStatusStyles, {
        color: star.active ? '#C60C30' : statusColor,
        width: `${statusWidth}px`,
        fontSize: `${statusFontSize}px`
      });

      const status = hoverIndex === (i + 1) || selectedStars.length === (i +1)
      ? this.props.status[i + 1] : '';

      return (
        <span key={i} >
          <span
            className={starClass}
            style={style}
          >
            <span style={statusStyle}>
              {showStatus && status}
            </span>
            <span
              data-index={i}
              data-forhalf={char}
              onMouseOver={this.mouseOver.bind(this)}
              onMouseMove={this.mouseOver.bind(this)}
              onMouseLeave={this.mouseLeave.bind(this)}
              onClick={this.clicked.bind(this)}
            >
              {char}
            </span>
          </span>
        </span>
      )
    })
  }

  render() {
    const {
      className
    } = this.props

    return (
      <div className={className} style={parentStyles}>
        {this.state.config.half ?
          this.renderHalfStarStyleElement() : ''}
        {this.renderStars()}
      </div>
    )
  }

}

ReactStars.propTypes = {
  className: PropTypes.string,
  edit: PropTypes.bool,
  half: PropTypes.bool,
  value: PropTypes.number,
  count: PropTypes.number,
  char: PropTypes.string,
  size: PropTypes.number,
  color1: PropTypes.string,
  color2: PropTypes.string,
  status: PropTypes.object,
  showStatus: PropTypes.bool,
  onHover: PropTypes.func
}

ReactStars.defaultProps = {
  edit: true,
  half: true,
  value: 0,
  count: 5,
  char: '★',
  size: 15,
  color1: 'gray',
  color2: '#ffd700',
  showStatus: true,
  status: {
    0: '',
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
  },
  statusColor: '#666',
  statusFontSize: '12',
  statusWidth: '80',
  onChange: () => { }
};

export default ReactStars
