/*global N*/
import * as React from "react"

import {Link, NavLink} from "react-router-dom"

class SongCell extends React.PureComponent {
  render() {
    let song = this.props.song
    let publishStatus

    if (song.publish_status == "draft") {
      publishStatus = <div className="publish_status">Draft</div>
    }

    return <div className="song_cell">
      {publishStatus}

      <div className="song_title">
        <Link to={song.url}>{song.title}</Link>
      </div>
      <div className="song_creator">
        {song.user.name}
      </div>
      <div className="song_stats">
        <span>Notes: {song.notes_count}</span>
        <span>Duration: {song.beats_duration}</span>
      </div>
    </div>
  }
}


export default class SongsPage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    this.refreshSongs()
  }

  componentWillUnmount() {
    if (this.request) {
      this.request.abort()
      delete this.request
    }
  }

  refreshSongs() {
    if (this.state.loading) {
      return
    }

    this.setState({
      loading: true
    })

    let request = new XMLHttpRequest()
    request.open("GET", `/songs.json`)
    request.send()
    request.onload = (e) => {
      delete this.request
      try {
        let res = JSON.parse(request.responseText)
        console.log(res)
        this.setState({
          loading: false,
          songs: res.songs || [],
          mySongs: res.my_songs || [],
        })
      } catch (e) {
        this.setState({loading: false, error_message: "Failed to fetch stats"})
      }
    }

    this.request = request
  }

  renderSidebar() {
    return <section className="sidebar">
      <Link to="/new-song" className="button new_song_button">Create a new song</Link>

      <nav>
        <ul>
          <li>
            <NavLink activeClassName="active" to="/play-along">Overview</NavLink>
          </li>
          <li>All Songs</li>
        </ul>
      </nav>
    </section>
  }

  renderMySongs() {
    if (!N.session.currentUser) {
      return null
    }

    let songList
    if (this.state.mySongs && this.state.mySongs.length) {
      songList = <ul className="song_cell_list">{this.state.mySongs.map(song =>
        <li key={song.id}>
          <SongCell song={song} key={song.id}/>
        </li>
      )}</ul>
    }

    if (!songList) {
      songList = <React.Fragment>
        <p>Any songs you create or edit will show up here.</p>
        <p>
          <Link to="/new-song" className="button new_song_button">Create a new song</Link>
        </p>
      </React.Fragment>
    }

    return <section>
      <h2>My Songs</h2>
      {songList}
    </section>
  }


  renderContent() {
    let recentlyPlayed
    if (false) {
      recentlyPlayed = <section>
        <h2>Recently Played</h2>
      </section>
    }

    return <section className="content_column">
      {recentlyPlayed}
      <section>
        <h2>Songs</h2>
        <ul className="song_cell_list">{this.state.songs.map(song =>
          <li key={song.id}>
            <SongCell song={song} key={song.id}/>
          </li>
        )}</ul>
      </section>

      {this.renderMySongs()}
    </section>
  }

  render() {
    if (!this.state.songs) {
      return <div className="page_container">Loading...</div>
    }

    return <div className="songs_page page_container">
      {this.renderSidebar()}
      {this.renderContent()}
    </div>
  }
}
