import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {
    Col, Collapse, CardBody,
    Card, CardHeader, Row} from 'reactstrap';

import {ActionRemove, ActionEdit} from './actions';


export class AccordionItem extends React.PureComponent {
    static propTypes = exact({
        children: PropTypes.array.isRequired,
        title: PropTypes.string.isRequired,
        id: PropTypes.string.isRequired,
        resource: PropTypes.object.isRequired,
        onEdit: PropTypes.func,
        onDelete: PropTypes.func,
        className: PropTypes.string,
    });

    render() {
        const {children} = this.props;
        return children;
    }
}


export default class Accordion extends React.Component {
    static propTypes = exact({
        children: PropTypes.array.isRequired,
        editable: PropTypes.bool,
        logo: PropTypes.func,
    });

    state = {open: null, cards: []};

    toggle = (evt) => {
        const {value: name} = evt.currentTarget.attributes.name;
        let {open} = this.state;
        if (name !== open) {
            open = name;
        } else {
            open = null;
        }
        this.setState({open});
    }

    onDelete = (evt, handler) => {
        evt.preventDefault();
        evt.stopPropagation();
        handler(evt.target.attributes.name.value);
    }

    onEdit = (evt, handler) => {
        evt.preventDefault();
        evt.stopPropagation();
        handler(evt);
    }

    render() {
	const {open} = this.state;
        const {editable, children, logo} = this.props;
	return (
	    <div className="container control-pane-scroll p-0 pl-1 pr-1 pb-3">
	      {children.map((child, index) => {
                  const {className, children: content, id, onEdit, onDelete, title, resource} = child.props;
                  const _logo = logo(resource);
                  let isOpen = false;
                  if (open === id || open === index) {
                      isOpen = true;
                  }
                  let _className = "p-0 m-0 accordion-item";
                  if (className) {
                      _className += ' ' + className;
                  }
                  console.log('ACCORDION', className);
		  return (
		      <Card className={_className} key={index}>
			<CardHeader
                          className="p-0 pl-1 m-0 bg-darkish font-weight-light"
                          onClick={this.toggle}
                          name={id}>
                          <Row className="m-0">
                            <Col sm={8}>
                              <img
                                alt={title}
                                src={_logo}
                                className="mr-2"
                                width="18px" />
                              {title}
                            </Col>
                            <Col sm={4} className="text-right">
                              <ActionRemove
                                title={title}
                                name={id}
                                className="mr-2"
                                remove={evt => this.onDelete(evt, onDelete)} />
                              {editable &&
                               <ActionEdit
                                 title={title}
                                 className="mr-2"
                                 edit={evt => this.onEdit(evt, onEdit)} />
                              }
                            </Col>
                          </Row>
                           </CardHeader>
			<Collapse isOpen={isOpen}>
		          <CardBody className="p-0">
                            {content}
                          </CardBody>
			</Collapse>
		      </Card>
		  );
	      })}
	    </div>
	);
    }
}
