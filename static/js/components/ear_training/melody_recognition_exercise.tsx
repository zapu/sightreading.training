import * as React from "react"
import {classNames, MersenneTwister, NoSleep} from "lib"
import * as types from "prop-types"

import {SongNoteList} from "song_note_list"
import Slider from "components/slider"
import Select from "components/select"

import {noteName, parseNote} from "music"
import SongParser from "song_parser"
import {isMobile} from "browser"

import {IconShuffle} from "components/icons"

import {setTitle} from "globals"

export default class MelodyRecognitionExercise extends React.Component {
  static exerciseName = "Interval Melodies"
  static exerciseId = "melody_recognition"
  static melodies = [
    {
      interval: "m2",
      direction: "asc",
      song: "min2_asc",
      title: "Jaws"
    }, {
      interval: "m2",
      direction: "desc",
      song: "min2_desc",
      title: "Joy To The World"
    }, {
      interval: "M2",
      direction: "asc",
      song: "Maj2_asc",
      title: "Silent Night"
    }, {
      interval: "M2",
      direction: "desc",
      song: "Maj2_desc",
      title: "Mary Had A Little Lamb"
    }, {
      interval: "m3",
      direction: "asc",
      song: "min3_asc",
      title: "Greensleves",
    }, {
      interval: "m3",
      direction: "desc",
      song: "min3_desc",
      title: "Hey Jude",
    }, {
      interval: "M3",
      direction: "asc",
      song: "Maj3_asc",
      title: "On When The Saints",
    }, {
      interval: "M3",
      direction: "desc",
      song: "Maj3_desc",
      title: "Swing Low Sweet Chariot",
    }, {
      interval: "P4",
      direction: "asc",
      song: "P4_asc",
      title: "Here Comes The Bride",
    }, {
      interval: "P4",
      direction: "desc",
      song: "P4_desc",
      title: "I've Been Working On The Rail Road",
    }, {
      interval: "T",
      direction: "asc",
      song: "T_asc",
      title: "The Simpsons",
    }, {
      interval: "P5",
      direction: "asc",
      song: "P5_asc",
      title: "Star Wars",
    }, {
      interval: "P5",
      direction: "desc",
      song: "P5_desc",
      title: "Flintstones",
    }, {
      interval: "m6",
      direction: "asc",
      song: "min6_asc",
      title: "Entertainer",
    }, {
      interval: "M6",
      direction: "asc",
      song: "Maj6_asc",
      title: "NBC",
    }, {
      interval: "m7",
      direction: "asc",
      song: "min7_asc",
      title: "Star Trek",
    }, {
      interval: "M7",
      direction: "asc",
      song: "Maj7_asc",
      title: "Take On Me",
    }, {
      interval: "P8",
      direction: "asc",
      song: "P8_asc",
      title: "Somewhere Over The Rainbow",
    }, {
      interval: "P8",
      direction: "desc",
      song: "P8_desc",
      title: "To Zanarkand",
    }
  ]

  static melodyCache = {}
  static fetchMelody(name) {
    if (!this.melodyCache[name]) {
      this.melodyCache[name] = new Promise((resolve, reject) => {
        let request = new XMLHttpRequest()
        request.open("GET", `./static/music/interval_melodies/${name}.lml?${+new Date()}`)
        request.onerror = () => reject(request.statusText)
        request.onload = (e) => {
          let songText = request.responseText
          let song

          try {
            song = SongParser.load(songText)
          } catch (e) {
            console.log(e)
            return reject(`Failed to parse: ${name}`)
          }

          // transpose to middle c
          let root = parseNote(song[0].note)
          song = song.transpose(60 - root)

          resolve(song)
        }

        request.send()
      })

    }

    return this.melodyCache[name]
  }

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      playbackBpm: 90,
      playbackTranspose: 0,
      enabledIntervals: {},
      rand: new MersenneTwister(),
      autoplayRandomizeRoot: true,
      autoplayIntervalOrder: "default",
    }
  }

  componentDidMount() {
    let loadingCount = 0

    setTitle("Learn Intervals Ear Training Exercise")

    this.setState({
      loading: true
    })

    let melodySongs = {}
    let enabled = {}

    MelodyRecognitionExercise.melodies.forEach((m) => {
      loadingCount += 1
      MelodyRecognitionExercise.fetchMelody(m.song).then(song => {
        loadingCount -= 1
        melodySongs[m.song] = song
        enabled[`${m.interval}-${m.direction}`] = true

        if (loadingCount == 0) {
          this.setState({
            loading: false,
            melodySongs,
            enabledIntervals: enabled
          })
        }
      }).catch(e => console.warn(e))
    })
  }

  componentWillUnmount() {
    if (this.state.playingTimer) {
      this.state.playingTimer.stop()
    }

    if (this.state.autoplayTimer) {
      this.state.autoplayTimer.stop()
    }

    if (this.nosleep && this.nosleepEnabled) {
      this.nosleep.disable()
      this.nosleepEnabled = false
    }
  }

  nextMelody(fn) {
    let intervals = MelodyRecognitionExercise.melodies.filter(m =>
      this.state.enabledIntervals[`${m.interval}-${m.direction}`]
    )

    let interval = intervals[this.state.rand.int() % intervals.length]

    this.setState({
      currentMelody: interval
    }, fn)
  }

  playCurrentRoot() {
    let current = this.state.currentMelody

    if (!current) {
      return
    }

    let song = this.state.melodySongs[current.song]
    let first = new SongNoteList()
    let note = song[0].clone()
    note.duration = 1
    first.push(note)
    return this.playSong(first)
  }

  playCurrentInterval() {
    let current = this.state.currentMelody

    if (!current) {
      return
    }

    let song = this.state.melodySongs[current.song]
    let first = new SongNoteList()

    let note1 = song[0].clone()
    let note2 = song[1].clone()

    note1.duration = 1
    note2.duration = 1


    if (this.state.autoplayIntervalOrder == "reverse") {
      note1.start = 1
      note2.start = 0
    } else if (this.state.autoplayIntervalOrder == "harmonic") {
      note1.start = 0
      note2.start = 0
    } else {
      note1.start = 0
      note2.start = 1
    }

    first.push(note1)
    first.push(note2)

    return this.playSong(first)
  }

  playCurrentSong() {
    let current = this.state.currentMelody

    if (!current) {
      return
    }

    return this.playSong(this.state.melodySongs[current.song])
  }

  playSong(song) {
    song = song.transpose(this.state.playbackTranspose)

    let timer = song.play(this.props.midiOutput, {
      bpm: this.state.playbackBpm
    })

    this.setState({
      playing: true,
      playingTimer: timer
    })

    timer.getPromise().then(() => {
      this.setState({
        playing: false,
        playingTimer: null,
      })
    })

    return timer
  }

  autoplayDelay(time, fn) {
    let timer
    let t = window.setTimeout(() => {
      if (this.state.autoplayTimer == timer) {
        this.setState({
          autoplayTimer: undefined
        })
      }
      fn()
    }, time)

    timer = {
      stop: (reason) => {
        window.clearTimeout(t)
        if (reason == "skip") {
          fn()
        }
      }
    }

    this.setState({
      autoplayTimer: timer
    })
  }

  autoplayNextInterval() {
    if (isMobile() && !this.nosleepEnabled) {
      this.nosleep = this.nosleep || new NoSleep()
      this.nosleep.enable()
      this.nosleepEnabled = true
    }

    if (this.state.autoplayRandomizeRoot) {
      this.setState({
        playbackTranspose: (this.state.rand.int() % 36) - 18
      })
    }

    this.nextMelody(() => {
      let timer = this.playCurrentInterval()
      this.setState({
        autoplayTimer: timer,
        autoplayState: "playingInterval"
      })

      timer.getPromise().then((reason) => {
        if (reason == "stop") {
          return
        }

        this.autoplayDelay(2000, () => {
          let timer = this.playCurrentSong()
          this.setState({
            autoplayTimer: timer,
            autoplayState: "playingMelody"
          })

          timer.getPromise().then((reason) => {
            if (reason == "stop") {
              return
            }

            this.autoplayDelay(2000, () => {
              this.autoplayNextInterval()
            })
          })
        })
      })
    })
  }

  render() {
    return <div className="melody_recognition_exercise">
      <div className="exercise_header">
        {this.props.toggleSidebarButton}
        <h1 className="exercise_label">Interval Recognition</h1>
      </div>

      {this.state.loading ?
        <div className="page_container">Loading</div>
      :
        <div className="page_container">
          {this.renderSongPlayer()}
          {this.renderIntervalSettings()}
          {this.renderAutoplayer()}
        </div>
      }
    </div>
  }

  renderAutoplayer() {
    let skipButton
    if (this.state.autoplayTimer) {
      skipButton = <button
        onClick={(e) => {
          this.state.autoplayTimer.stop("skip")
        }}
      >Skip</button>
    }


    return <section className="auto_player">
      <h3>Autoplay Mode</h3>
      <p>Repeatedly plays a random interval, a pause, then the associated melody. No input required, listen along and try to identify the intervals.</p>

      <fieldset className="autoplay_options">
        <legend>Autoplay options</legend>
        <ul >
          <li>
            <label>
              <input
                checked={this.state.autoplayRandomizeRoot}
                onChange={e => {
                  this.setState({
                    autoplayRandomizeRoot: e.target.checked
                  })
                }}
                type="checkbox" />
                <span className="input_label">Randomly transpose</span>
            </label>
          </li>
          <li>
            <label>
              <span className="input_label">Playback mode</span>
              <Select
                value={this.state.autoplayIntervalOrder}
                onChange={(v) => this.setState({ autoplayIntervalOrder: v })}
                options={[
                  {name: "In order", value: "default"},
                  {name: "Reverse", value: "reverse"},
                  {name: "Harmonic", value: "harmonic"},
                ]}
              />
            </label>
          </li>
        </ul>
      </fieldset>

      <p>
        <button
          onClick={(e) => {
            e.preventDefault()
            if (this.state.autoplayTimer) {
              this.state.autoplayTimer.stop()

              if (this.nosleep && this.nosleepEnabled) {
                this.nosleep.disable()
                this.nosleepEnabled = false
              }

              this.setState({
                autoplayTimer: undefined,
                autoplayState: undefined,
              })
            } else {
              this.autoplayNextInterval()
            }
          }}
          >{this.state.autoplayTimer ? "Stop" : "Start autoplay"}</button>
        {" "}
        {skipButton}
      </p>
    </section>
  }

  renderSongPlayer() {
    let current = this.state.currentMelody

    let currentSongTools
    if (current) {
      let currentSong = this.state.melodySongs[current.song]

      let stopSong
      if (this.state.playingTimer && !this.state.autoplayTimer) {
        stopSong = <button
          type="button"
          onClick={e => this.state.playingTimer.stop() }>Stop</button>
      }

      let firstNote = noteName(parseNote(currentSong[0].note) + this.state.playbackTranspose)

      let disabled = !!(this.state.playing || this.state.autoplayTimer)

      let title = `${current.interval} - ${current.title} (${firstNote})`
      if (this.state.autoplayState == "playingInterval") {
        title = "Listen to interval..."
      }

      currentSongTools = <div className="current_song">
        <div className="song_title">{title}</div>
        <div className="song_controls">
          <button
            disabled={disabled}
            type="button"
            onClick={e => {
              this.playCurrentRoot()
            }}>Play root</button>

          <button
            disabled={disabled}
            type="button"
            onClick={e => {
              this.playCurrentInterval()
            }}
            >Play interval</button>

          <button
            type="button"
            disabled={disabled}
            onClick={e => {
              this.playCurrentSong()
          }}>Play melody</button>
          {stopSong}
        </div>
      </div>
    } else {
      currentSongTools = <div className="current_song">
        Press <strong>Next melody</strong> to randomly pick a interval to practice
      </div>
    }

    let disabled = !!(this.state.playing || this.state.autoplayTimer)

    return <div className="song_selector">
      <div className="global_controls">
        <button
          disabled={disabled}
          onClick={(e) => { this.nextMelody() }}>Next melody</button>

        <label className="slider_group">
          <span>BPM</span>
          <Slider
            min={40}
            max={160}
            onChange={(value) => {
              this.setState({ playbackBpm: value })
            }}
            value={this.state.playbackBpm} />
          <code>{this.state.playbackBpm}</code>
        </label>

        <label className="slider_group">
          <span>Transpose</span>
          <Slider
            min={-24}
            max={24}
            onChange={(value) => {
              this.setState({ playbackTranspose: value })
            }}
            value={this.state.playbackTranspose} />
          <code>{this.state.playbackTranspose}</code>
          <button
          type="button"
          title="Randomize Transpose"
            onClick={e=>
              this.setState({
                playbackTranspose: (this.state.rand.int() % 36) - 18
              })
            }
            className="shuffle_button">
              <IconShuffle width={16} height={16} />
            </button>
        </label>
      </div>
      {currentSongTools}
    </div>
  }

  renderIntervalSettings() {
    let inputs = MelodyRecognitionExercise.melodies.map((m) => {
      let key = `${m.interval}-${m.direction}`

      return <li key={key} title={m.title}>
        <label>
          <input
            type="checkbox"
            onChange={e => {
              this.setState({
                enabledIntervals: {
                  ...this.state.enabledIntervals,
                  [key]: e.target.checked,
                }
              })
            }}
            checked={this.state.enabledIntervals[key] || false} />
          {" "}
          <span className="label">{m.interval} {m.name} ({m.direction})</span>
        </label>
      </li>
    })

    let enabledFiltered = fn => {
      let keys = MelodyRecognitionExercise.melodies
        .filter(fn)
        .map(m => `${m.interval}-${m.direction}`)

      let enabled = {}
      for (let key of keys) {
        enabled[key] = true
      }

      return enabled
    }

    let toggleAllButton = null
    // if it's empty add a toggle all button
    if (Object.keys(this.state.enabledIntervals || {}).length == 0) {
      toggleAllButton = <button
        type="button"
        onClick={e => this.setState({ enabledIntervals: enabledFiltered(m => true)})}
        >All on</button>
    } else {
      toggleAllButton = <button
        type="button"
        onClick={e => this.setState({ enabledIntervals: {} })}
        >All off</button>
    }

    return <section className="interval_settings">
      <fieldset className="enabled_intervals">
        <legend>Intervals</legend>

        <ul>
          {inputs}
        </ul>

        <div className="button_toggles">
          {toggleAllButton}
          {" "}
          <button
            type="button"
            onClick={e =>
              this.setState({
                enabledIntervals: enabledFiltered(m => m.direction == "asc")
              })
            }
            >All Ascending</button>
          {" "}
          <button
            type="button"
            onClick={e =>
              this.setState({
                enabledIntervals: enabledFiltered(m => m.direction == "desc")
              })
            }
            >All Descending</button>
        </div>
      </fieldset>
    </section>
  }
}
