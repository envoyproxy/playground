
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {connect} from 'react-redux';

import {Button} from 'reactstrap';

import {PlaygroundSiteContext} from "../app/context";


export class PlaygroundSiteRepoEvent extends React.PureComponent {
    static contextType = PlaygroundSiteContext;
    static propTypes = exact({
        event: PropTypes.object.isRequired
    });

    render () {
        const {ago} =  this.context;
        const {event} = this.props;
        const {actor, created_at, payload, type} = event;
        const {avatar_url, login} = actor;
        const {action, number} = payload;

        // const parsed = parseGithubEvent(event);
        let verb = action;
        let object = '';

        if (type === "PushEvent") {
            verb = 'pushed';
        }

        if (type === "PullRequestEvent") {
            object = `PR #${number}`;
        }

        if (type === "IssueCommentEvent" && action === 'created') {
            const {comment} = payload;
            const {url} = comment;
            verb = <a href={url}>commented</a>;
        }

        return  (
            <ul>
              <li>
                <img src={avatar_url} width="22px" className="ml-1 mr-2" alt="Playground" />
                {login} {verb} {object}
                {' '}{ago.format(new Date(created_at))}
              </li>
            </ul>
        );
    }
}


export class BasePlaygroundSiteRepoInfo extends React.Component {
    static contextType = PlaygroundSiteContext;
    static propTypes = exact({
        repo: PropTypes.object.isRequired,
        dispatch: PropTypes.func,
    });

    state = {showAll: false};

    showMore = () => {
        this.setState({showAll: true});
    }

    render () {
        const {repository} = this.context;
        const {showAll} = this.state;
        const {repo} = this.props;
        const{issues, events} = repo;
        const _events = [...events];
        if (!showAll) {
            _events.length = 5;
        }
        return (
            <div  className="p-2 pt-4">
              <dl className="p-2">
                <dt>Repository</dt>
                <dd>
                  {repository}
                </dd>
                <dd>
                  issues: {issues}
                </dd>
                <dt>Recent activity</dt>
                <dd>
                  {_events.map((event, i) => {
                      return (
                          <PlaygroundSiteRepoEvent
                            key={i}
                            event={event} />);
                  })}
                  {!showAll &&
                   <Button onClick={this.showMore}>Show more...</Button>
                  }
                </dd>
              </dl>
            </div>
        );
    }
}


export const mapStateToProps = function(state) {
    return {
        repo: state.repo.value,
    };
};

export default connect(mapStateToProps)(BasePlaygroundSiteRepoInfo);
