import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Tooltip, actions as tooltipActions } from 'redux-tooltip';
import copy from 'deepcopy';
import Treemap from './treemap';
import { moveDown } from './actions';
import DATA from './data.mini';

function collapse(path) {
  let collapsed = copy(DATA), focus = collapsed;
  const remain = [...path];
  while (0 < remain.length) {
    if (typeof focus.children === 'undefined') {
      console.warn(`No children, this is a leaf node`);
      break;
    }

    const name = remain.shift();
    const matches = focus.children.filter(c => c.name === name);
    if (1 < matches.length) {
      console.warn(`Found multiple nodes which have same name: '${name}'`);
      break;
    }
    if (matches.length === 0) {
      console.warn(`No child named '${name}'`);
      break;
    }

    // Crush all children except matched child
    focus.children.forEach(c => {
      if (c.name !== name) {
        c.size = 0; // Crush!
      }
    });

    focus = matches[0];
  }
  return collapsed;
}

@connect(({ app }) => ({ app }))
export default class Home extends Component {
  static displayName = 'Home';
  static contextTypes = { router: PropTypes.object };

  handleMoveDown(name) {
    const { location } = this.props;
    const { router } = this.context;
    if (location.pathname.slice(-1) !== '/') {
      name = '/' + name;
    }
    router.push(`${location.pathname}${name}`);
  }

  handleMoveTo(path) {
    const { router } = this.context;
    router.push(path);
  }

  handleHover(origin, name) {
    // this.props.dispatch(tooltipActions.show({ origin, content: name }));
  }

  handleLeave() {
    // this.props.dispatch(tooltipActions.hide());
  }

  render() {
    const { location } = this.props;
    const path = location.pathname.split('/').filter(s => 0 < s.length);
    const data = collapse(path);
    return (
      <div id="home" style={{ position: 'relative' }}>
        <h1>treemap-with-router</h1>
        <h2>
          <Link to="/" key="top">[TOP]</Link>
          {path.map((name, i) => (
            <span key={`s_${name}_${i}`}>
              {' / '}
              <Link to={'/' + path.slice(0, i + 1).join('/')} key={`l_${name}_${i}`}>{name}</Link>
            </span>
          ))}
        </h2>
        <Treemap
          data={data}
          onMoveDown={::this.handleMoveDown}
          onShowDetail={::this.handleHover}
          onHideDetail={::this.handleLeave}
        />
        <Tooltip />
      </div>
    );
  }
}
