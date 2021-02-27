import * as React from "react"
import {keyCodeToChar, noteForKey} from "keyboard_input"
import * as types from "prop-types"

export default class Hotkeys extends React.Component {
  static propTypes = {
    onDown: types.func,
    onUp: types.func,
    keyMap: types.object,
  }

  constructor(props) {
    super(props)
    this.state = {
      heldKeys: {}
    }
  }

  componentDidMount()  {
    this.downListener = event => {
      if (event.shiftKey || event.altKey || event.ctrlKey) {
        return
      }

      if (event.target.matches("input, button, textarea")) {
        return
      }

      if (this.state.heldKeys[event.keyCode]) {
        // ignore keyboard repeat
        return
      }

      this.state.heldKeys[event.keyCode] = true
      const key = keyCodeToChar(event.keyCode)

      this.triggerKeyMap(key, event)

      if (this.props.onDown) {
        this.props.onDown(key, event)
      }
    }

    this.upListener = event => {
      const key = keyCodeToChar(event.keyCode)

      if (!this.state.heldKeys[event.keyCode]) {
        return
      }

      delete this.state.heldKeys[event.keyCode]

      if (this.props.onUp) {
        this.props.onUp(key, event)
      }
    }

    window.addEventListener("keydown", this.downListener)
    window.addEventListener("keyup", this.upListener)
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.downListener)
    window.removeEventListener("keyup", this.upListener)
  }

  triggerKeyMap(key, event) {
    if (!this.props.keyMap) {
      return
    }

    let fn = this.props.keyMap[key]
    if (fn) {
      fn(event)
      return true
    }

    return false
  }

  render() {
    // placholder element
    return <span className="hotkeys" style={{ display: "none" }}></span>
  }
}
