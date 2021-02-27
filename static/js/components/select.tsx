import * as React from "react"
import {classNames} from "lib"
import * as types from "prop-types"
import {IconDownArrow} from "components/icons"

export default class Select extends React.Component {
  static propTypes = {
    options: types.array.isRequired,
    name: types.string,
  }

  constructor(props) {
    super(props)
    this.state = {}
  }

  onChange(e) {
    let value = e.target.value
    if (this.props.onChange) {
      if (value == this.props.value) {
        return
      }

      this.props.onChange(value)
    } else {
      if (value == this.state.value) {
        return
      }

      this.setState({ value })
    }
  }

  render() {
    let current = this.currentOption()

    return <div className={classNames("select_component", this.props.className, {
      focused: this.state.focused
    })}>
      <div className="selected_option">
        <span className="selected_option_name">{current.name}</span>
        <IconDownArrow width={12} />
      </div>
      <select
        value={current.value}
        name={this.props.name}
        onFocus={e => this.setState({ focused: true })}
        onBlur={e => this.setState({ focused: false })}
        onChange={e => this.onChange(e)}>
      {
        this.props.options.map((o, idx) => {
          return <option key={idx} value={o.value}>{o.name}</option>
        })
      }
      </select>
    </div>
  }

  findOption(optionValue) {
    for (let o of this.props.options) {
      if (o.value == optionValue) {
        return o
      }
    }
  }

  // name of what's currently selected
  currentOption() {
    const searchValue = this.props.value || this.state.value
    let ret
    if (searchValue != undefined) {
      ret = this.findOption(searchValue)
    }
    return ret ? ret : this.props.options[0]
  }
}
