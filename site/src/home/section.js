
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Col, Row} from 'reactstrap';


export class PlaygroundSiteSection extends React.PureComponent {
    static propTypes = exact({
        section: PropTypes.object.isRequired
    });

    render () {
        const {section} = this.props;
        const {content, icon, title} = section;
        return (
	    <Col>
              <section className="mt-3">
                <header className="bg-dark p-2">
                  <img src={icon} width="22px" className="ml-1 mr-2" alt={title} />
                  {title}
                </header>
                {content}
              </section>
	    </Col>);
    }
}


export class PlaygroundSiteSectionRow extends React.PureComponent {
    static propTypes = exact({
        row: PropTypes.array.isRequired
    });

    render () {
        const {row} = this.props;
        return (
	    <Row>
              {row.map((section, i) => {
                  return (
                      <PlaygroundSiteSection
                        key={i}
                        section={section} />
                  );
              })}
	    </Row>);

    }
}


export class PlaygroundSiteSections extends React.PureComponent {
    static propTypes = exact({
        sections: PropTypes.array.isRequired
    });

    render () {
        const {sections} = this.props;
        return (
            <Col>
              {sections.map((row, i) => {
                  return (
                      <PlaygroundSiteSectionRow
                        key={i}
                        row={row} />
                  );
              })}
            </Col>);
    }
}
