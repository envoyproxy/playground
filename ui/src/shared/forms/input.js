
import React from 'react';
import PropTypes from 'prop-types';

import {Alert, Input} from 'reactstrap';


export class PlaygroundInput extends React.PureComponent {
    static propTypes = {
        name: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        type: PropTypes.string,
        id: PropTypes.string,
        disabled: PropTypes.bool,
        errors: PropTypes.object,
    };

    render () {
        const {errors, id, name, type='text', ...props} = this.props;
        return (
            <>
              <Input
                {...props}
                id={id || name}
                type={type}
                name={name}
              />
              {(errors.name || []).map((e, i) => {
                  return (
                      <Alert
                        className="p-1 mt-2 mb-2"
                        color="danger"
                        key={i}>{e}</Alert>
                  );
              })}
            </>);
    }
}
