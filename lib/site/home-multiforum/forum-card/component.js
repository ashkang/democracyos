import React, { Component } from 'react'
import { Link } from 'react-router'
import Geopattern from 'geopattern'

export default class ForumCard extends Component {
  render () {
    return (
      <Link to={this.props.forum.url}>
        <div
          className='forum-card'
          style={{
            backgroundImage: Geopattern.generate(this.props.forum.id).toDataUrl()
          }}>
          <h1>{this.props.forum.title}</h1>
          <p className='desc'>
            {this.props.forum.summary}
          </p>
        </div>
      </Link>
    )
  }
}
