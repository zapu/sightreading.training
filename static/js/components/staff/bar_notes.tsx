
import * as React from "react"
import {classNames} from "lib"
import {parseNote, noteStaffOffset} from "music"

import * as types from "prop-types"

export default class BarNotes extends React.PureComponent {
  static defaultProps = {
    heldNotes: {},
    offsetLeft: 0,
  }

  static propTypes = {
    notes: types.array.isRequired,
    heldNotes: types.object.isRequired,
    offsetLeft: types.number.isRequired,
  }

  render() {
    let out = this.props.notes.map(this.renderNote.bind(this))

    if (out.length) {
      return out
    }

    return null
  }

  renderNote(note, idx) {
    const key = this.props.keySignature
    let noteName = note.note
    let pitch = parseNote(noteName)

    let pixelsPerBeat = this.props.pixelsPerBeat
    let row = noteStaffOffset(noteName)

    let fromTop = this.props.upperRow - row
    let fromLeft = note.getStart() * pixelsPerBeat + 2
    let width = note.getRenderStop() * pixelsPerBeat - fromLeft - 4

    let accidentals = key.accidentalsForNote(noteName)

    let style = {
      top: `${Math.floor(fromTop * 25/2)}%`,
      left: `${this.props.offsetLeft + fromLeft}px`,
      width: `${width}px`
    }

    let outsideLoop = false

    if (this.props.loopLeft != null && this.props.loopRight != null) {
      outsideLoop = note.getStart() < this.props.loopLeft || note.getStart() >= this.props.loopRight
    }

    let held = this.props.heldNotes[note.id]

    return <div
      className={classNames("note_bar", {
        is_flat: accidentals == -1,
        is_sharp: accidentals == 1,
        is_natural: accidentals == 0,
        held,
        outside_loop: outsideLoop,
      })}
      title={noteName}
      style={style}
      key={`bar-note-${idx}`}></div>
  }
}
