
import {notesLessThan, notesSame, parseNote, MajorScale} from "music"

export default class NoteList extends Array {
  constructor(notes, opts={}) {
    super();
    Object.setPrototypeOf(this, NoteList.prototype);

    if (opts.generator) {
      this.generator = opts.generator
    }

    if (notes && notes.length) {
      this.push.apply(this, notes);
    }

    // let scale = new MajorScale("C");
    // // this.generator = new StepNotes(scale.getRange(3, 24, 2));
    // // this.generator = new RandomNotes(scale.getRange(3, 24, 2));
    // // this.generator = new MiniSteps(scale.getRange(3, 24, 2));
    // this.generator = new Double(scale.getRange(3, 10, 2), scale.getRange(5, 12));
  }

  getKeyRange() {
    let notes = new MajorScale("C").getRange(3, 24, 2);
    return [notes[0], notes[notes.length - 1]];
  }

  filterByRange(min, max) {
    return new NoteList(this.filter(function(n) {
      if (notesLessThan(n, min)) {
        return false;
      }

      if (notesLessThan(max, n)) {
        return false;
      }

      return true;
    }));
  }

  pushRandom() {
    return this.push(this.generator.nextNote());
  }

  fillBuffer(count) {
    for (let i = 0; i < count; i++) {
      this.pushRandom();
    }
  }

  // if single note is in head
  inHead(note) {
    let first = this[0];
    if (Array.isArray(first)) {
      return first.some((n) => n == note);
    } else {
      return note == first
    }
  }

  toString() {
    return this.map((n) => n.join(" ")).join(", ")
  }

  // converts it to serialize list of note numbers for quick comparisons
  toNoteString() {
    return this.map((n) => n.map(parseNote).join(" ")).join(", ")
  }
}
