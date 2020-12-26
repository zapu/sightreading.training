import NoteList from "st/note_list"
import {parseNote, notesSame, noteName, MIDDLE_C_PITCH} from "st/music"

export default class NoteListView extends NoteList {
  constructor(notes, opts = {}) {
    super(notes, opts)
    Object.setPrototypeOf(this, NoteListView.prototype)
    this.pos = 0
  }

  advance() {
    this.pos++
  }

  // must be an array of notes
  matchesHead(notes, anyOctave=false) {
    let first = this[this.pos]

    if (!Array.isArray(notes)) {
      throw new Error("matchesHead: notes should be an array")
    }

    if (Array.isArray(first)) {
      if (first.length != notes.length) {
        return false;
      }
      if (anyOctave) {
        let noteSet = {}
        notes.forEach((n) => noteSet[n.replace(/\d+$/, "")] = true)
        return first.every((n) => noteSet[n.replace(/\d+$/, "")])
      } else {
        const pitches = notes.map(parseNote)
        return first.map(parseNote).every((n) => pitches.indexOf(n) >= 0)
      }
    } else {
      if (anyOctave) {
        return notes.length == 1 && notesSame(notes[0], first)
      } else {
        return notes.length == 1 && parseNote(notes[0]) == parseNote(first)
      }

    }
  }

  currentColumn() {
    let first = this[this.pos];
    if (Array.isArray(first)) {
      return first;
    } else {
      return [first];
    }
  }
}