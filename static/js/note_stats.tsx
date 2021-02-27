
import {csrfToken} from "globals"

export default class NoteStats {
  static TIMER_SIZE = 30*1000

  constructor(currentUser, opts={}) {
    this.currentUser = currentUser
    this.noteHitStats = {}
    this.streak = 0
    this.hits = 0
    this.misses = 0

    this.lastHitTime = undefined
    this.averageHitTime = 0

    this.resetBuffer()
  }

  resetBuffer() {
    this.buffer = {
      hits: 0,
      misses: 0,
    }
  }

  setTimerUrl(url) {
    this.flushTimer()
    this.timerUrl = url
  }

  startTimer() {
    if (!this.timerUrl) {
      return
    }

    this.lastActivity = +new Date

    if (this.timerFlushTimeout) {
      return
    }

    let timerStart = +new Date
    this.timerFlushTimeout = setTimeout(() => {
      let now = +new Date
      let activityTime = this.lastActivity - timerStart

      this.flushTimer(activityTime)
      delete this.timerFlushTimeout

      let sinceLastActivity = now - this.lastActivity
      if (sinceLastActivity < NoteStats.TIMER_SIZE / 2) {
        this.startTimer()
      }

    }, NoteStats.TIMER_SIZE)
  }


  hitNotes(notes) {
    for (let note of notes) {
      this.incrementNote(note, 1);
    }

    let now = +new Date;

    this.startTimer()

    if (this.lastHitTime) {
      let timeTaken = now - this.lastHitTime;

      if (!this.isOutlierTime(timeTaken)) {
        this.averageHitTime = (this.averageHitTime * this.hits + timeTaken) / (this.hits + 1);
        for (let note of notes) {
          let noteStats = this.noteHitStats[this.normalizeNote(note)];
          noteStats.averageHitTime = ((noteStats.averageHitTime || 0) * (noteStats.hits || 0) + timeTaken) / (noteStats.hits + 1);
        }
      }
    }

    this.lastHitTime = now

    this.streak += 1;
    this.hits += 1;
    this.buffer.hits += 1;
    this.flushLater()
  }

  missNotes(notes) {
    for (let note of notes) {
      this.incrementNote(note, -1);
    }

    this.startTimer()

    this.streak = 0;
    this.misses += 1;
    this.buffer.misses += 1;
    this.flushLater()
  }

  incrementNote(note, val) {
    note = this.normalizeNote(note);
    let stats = this.noteHitStats[note] = this.noteHitStats[note] || {};

    if (val > 0) {
      stats.hits = (stats.hits || 0) + val;
    } else if (val < 0){
      stats.misses = (stats.misses || 0) - val;
    }
  }

  makeThrottle(fn, wait) {
    let timer = null
    return () => {
      let args = arguments
      if (timer) {
        return
      }

      timer = setTimeout(() => {
        timer = null
        fn.apply(args)
      }, wait)
    }
  }

  flushLater() {
    if (!this.currentUser) {
      return
    }

    this.flushLater = this.makeThrottle(this.flush.bind(this), 5000)
    window.addEventListener("beforeunload", () => {
      this.flush()
    })

    this.flushLater()
  }

  flush() {
    let d = new FormData()
    d.append("csrf_token", csrfToken())
    for (let key in this.buffer) {
      d.append(key, "" + this.buffer[key])
    }

    var request = new XMLHttpRequest()
    request.open("POST", "/hits.json")
    request.send(d)
    this.resetBuffer()
  }

  flushTimer(activityTime) {
    if (!this.timerUrl) {
      return
    }


    let d = new FormData()
    d.append("csrf_token", csrfToken())

    let sendTime = NoteStats.TIMER_SIZE

    if (activityTime < sendTime / 2) {
      sendTime = activityTime
    }

    sendTime = Math.round(sendTime / 1000)

    if (sendTime < 2) {
      return
    }

    d.append("time_spent", `${sendTime}`)

    var request = new XMLHttpRequest()
    request.open("POST", this.timerUrl)
    request.send(d)
  }

  isOutlierTime(timeTaken) {
    if (this.averageHitTime == 0) {
      return false;
    }

    return timeTaken > this.averageHitTime * 10 + 1000;
  }

  normalizeNote(note) {
    return note.replace(/\d+$/, "");
  }
}
