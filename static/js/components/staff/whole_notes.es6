import * as React from "react"
import {classNames} from "lib"
import {parseNote, noteStaffOffset} from "st/music"

import * as types from "prop-types"

export default class WholeNotes extends React.PureComponent {
  static propTypes = {
    notes: types.array.isRequired,
    keySignature: types.object.isRequired,
    upperRow: types.number,
    lowerRow: types.number,
    pixelsPerBeat: types.number,
    offsetLeft: types.number,
    // noteClasses, staticNoteClasses
  }

  render() {
    let out = this.props.notes.map((n, idx) =>
      this.renderNote(n, idx, this.getNotesByColumn()))

    if (out.length) {
      return out
    }

    return null
  }

  // used to offset notes when they are stacked
  getNotesByColumn() {
    let notesByColumn = {}

    this.props.notes.forEach(n => {
      let column = n.getStart().toString()

      if (!notesByColumn[column]) {
        notesByColumn[column] = [n]
      } else {
        notesByColumn[column].push(n)
      }
    })

    return notesByColumn
  }

  renderNote(note, idx, notesByColumn) {
    const props = this.props
    let key = props.keySignature

    let noteName = key.enharmonic(note.note)

    let pitch = parseNote(noteName)
    let row = noteStaffOffset(noteName)

    let fromTop = props.upperRow - row;
    let offsetLeft = props.offsetLeft || 0
    let left = offsetLeft + note.getStart() * this.props.pixelsPerBeat

    let column = notesByColumn[note.getStart().toString()]

    let style = {
      top: `${Math.floor(fromTop * 25/2)}%`,
      left: `${left}px`
    }

    let outside = row > props.upperRow || row < props.lowerRow
    let accidentals = key.accidentalsForNote(noteName)

    let noteClasses = null
    if (props.noteClasses) {
      noteClasses = props.noteClasses[note.id]
    }

    let classes = classNames("whole_note", "note", {
      is_flat: accidentals == -1,
      is_sharp: accidentals == 1,
      is_natural: accidentals == 0,
      outside: outside,
    }, noteClasses, props.staticNoteClasses)

    let parts = [
      <img key="head" className="primary" src="static/svg/noteheads.s0.svg" />
    ]

    if (accidentals == 0) {
      parts.push(<img key="natural" className="accidental natural" src="static/svg/natural.svg" />)
    }

    if (accidentals == -1) {
      parts.push(<img key="flat" className="accidental flat" src="static/svg/flat.svg" />)
    }

    if (accidentals == 1) {
      parts.push(<img key="sharp" className="accidental sharp" src="static/svg/sharp.svg" />)
    }

    return <div
      key={`note-${idx}`}
      style={style}
      data-note={note.note}
      data-midi-note={pitch}
      className={classes}
      >{parts}</div>
  }
}
