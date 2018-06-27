import React, { Component } from 'react'
import t from 't-component'
import shuffle from 'lodash.shuffle'
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc'
import userConnector from 'lib/site/connectors/user'
import topicStore from 'lib/stores/topic-store/topic-store'
import ChangeVote from '../change-vote-button/component'

class Hierarchy extends Component {
  constructor (props) {
    super(props)
    this.prepareState(this.props)
    this.handleVote = this.handleVote.bind(this)
  }

  componentWillReceiveProps (props) {
    this.prepareState(props)
  }

  prepareState (props) {
    const items = props.topic.action.results.map((item) => item.value)
    this.state = {
      value: props.topic.voted,
      voted: props.topic.voted,
      changingVote: false,
      items: props.topic.voted ? items : shuffle(items)
    }
  }

  handleVote (e) {
    if (!this.props.user.state.fulfilled) return

    const { items } = this.state
    topicStore
      .vote(this.props.topic.id, items.toString())
      .then(() => {
        this.setState({
          voted: true,
          changingVote: false
        })
      })
      .catch((err) => {
        console.warn('Error on vote setState', err)
        this.setState({
          voted: false
        })
      })
  }

  changeVote = () => {
    this.setState({
      changingVote: true
    })
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex !== newIndex) {
      const { items } = this.state

      this.setState({
        items: arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  render () {
    const { value, changingVote, items } = this.state
    const { topic, user } = this.props

    const votesTotal = topic.action.count

    const showVoteBox = !(topic.closed || topic.voted) || changingVote
    const showChangeVote = (!topic.closed && topic.voted) && !changingVote
    const showResult = topic.closed && topic.voted

    return (
      <div className='topics-hierarchy'>
        {showVoteBox && <h4>
          {t('proposal-behavior.hierarchy')}
        </h4>
        }
        {
          showResult && <h4>
            {t('proposal-behavior.hierarchy.result')}
          </h4>
        }

        { showVoteBox && <div>
          <div className='row'>
            <div className='col-sm-12'>
              <SortableList
                helperClass='sortable-li-focus'
                items={items}
                onSortEnd={this.onSortEnd} />
            </div>
          </div>
          <VoteBox onVote={this.handleVote} />
        </div>

        }
        {
          showChangeVote && <div>
            <div className='row'>
              <div className='col-sm-12'>
                <VotedBox votes={value.split(',')} />
                <ChangeVote handleClick={this.changeVote} />
              </div>
            </div>
          </div>
        }
        {
          showResult && <span>
            <ResultBox
              votesTotals={votesTotal}
              results={topic.action.results} />
          </span>
        }
        {
        user.state.fulfilled &&
        !topic.privileges.canVote &&
          <p className='text-mute overlay-vote'>
            <span className='icon-lock' />
            <span className='text'>
              {t('privileges-alert.not-can-vote-and-comment')}
            </span>
          </p>
        }
      </div>
    )
  }
}

const SortableList = SortableContainer(({ items }) => {
  return (
    <ol>
      {items.map((value, index) => (
        <SortableItem key={`item-${index}`} index={index} value={value} />
      ))}
    </ol>
  )
})

const SortableItem = SortableElement(({ value }) =>
  <li className='sortable-li'>{value}</li>
)

function VotedBox ({ votes }) {
  return (
    <div className='voted-box'>
      <p>{t('proposal-options.voted')}</p>
      <ol>
        {votes.map((vote, index) => {
          return (
            <li key={`voted-${index}`} className='voted-li'>
              { vote }
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function VoteBox ({ onVote }) {
  return (
    <div className='vote-box'>
      <div className='vote-options'>
        <div className='direct-vote'>
          <button
            className='btn btn-primary'
            onClick={onVote}>
            {t('topics.actions.poll.do')}
          </button>
        </div>
      </div>
    </div>
  )
}

function ResultBox ({ votesTotals, results }) {
  const noVoted = votesTotals === 0
  if (noVoted) {
    return (
      <div className='results-box topic-article-content row'>
        <p className='alert alert-info col-sm-12'>
          {t('proposal-options.no-votes-cast')}
        </p>
      </div>
    )
  }

  return (
    <ol>
      {results.map((vote, index) => {
        return (
          <li key={`item-${index}`} className='result-voted-li'>
            { vote.value }
            <span className='voted-porcentage'>{ vote.porcentage }</span>
          </li>
        )
      })}
    </ol>
  )
}

export default userConnector(Hierarchy)
