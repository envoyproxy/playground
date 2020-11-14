import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Collapse, CardBody, Card, CardHeader} from 'reactstrap';

import {ActionRemove, ActionEdit} from './actions';


export class AccordionItem extends React.PureComponent {
    render() {
        return "ITEM";
    }
}


export default class Accordion extends React.Component {
    static propTypes = exact({
        children: PropTypes.array.isRequired,
        logo: PropTypes.func,
    });

    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = { open: 0, cards: [1, 2, 3, 4, 5] };
    }

    toggle(e) {
	let event = e.target.dataset.event;
        this.setState({ open: this.state.open === Number(event) ? 0 : Number(event) });
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
        const {children, logo} = this.props;
	return (
	    <div className="container p-0 control-pane-scroll">
	      {children.map((child, index) => {
                  const {children: content, onEdit, onDelete, title, resource} = child.props;
                  const _logo = logo(resource);
		  return (
		      <Card className="p-0 m-0" key={index}>
			<CardHeader
                          className="p-0 pl-3 m-0"
                          onClick={this.toggle}
                          data-event={index}>
                          <img
                            alt={title}
                            src={_logo}
                            className="mr-2"
                            width="18px" />
                          {title}
                          <ActionRemove
                            title={title}
                            name={title}
                            className="float-right ml-2 mr-2"
                            remove={evt => this.onDelete(evt, onDelete)} />
                          <ActionEdit
                            title={title}
                            className="float-right ml-2 mr-2"
                            edit={evt => this.onEdit(evt, onEdit)} />
                        </CardHeader>
			<Collapse isOpen={open === index}>
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
