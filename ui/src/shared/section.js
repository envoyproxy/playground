
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';


export class PlaygroundSection extends React.PureComponent {
    static propTypes = exact({
        children: PropTypes.oneOfType([
            PropTypes.array,
            PropTypes.object]).isRequired,
        title: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.string]).isRequired,
        icon: PropTypes.string.isRequired,
    });

    render () {
        const {children, title, icon} = this.props;
        return (
	    <section className="control-pane">
              <header className="pt-1 pb-1 bg-dark border-top border-bottom">
                <img
                  alt={title}
                  src={icon}
                  className="ml-2 mr-2"
                  width="24px" />
                {title}
              </header>
              <div className="pt-2 bg-medium scrollable">
                {children}
              </div>
            </section>);
    }
}
