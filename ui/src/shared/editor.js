
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import {Alert, Col, Label, Row} from 'reactstrap';

import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-python';

import {ActionCopy, ActionClear} from './actions';


export class PlaygroundEditor extends React.PureComponent {
    static propTypes = exact({
        clearConfig: PropTypes.func.isRequired,
        content: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,

        format: PropTypes.string,
        errors: PropTypes.array,
        onHighlight: PropTypes.func,
    });

    copyConfig = () => {
        this.textArea._input.select();
        document.execCommand('copy');
    }

    render () {
        const {
            clearConfig, content, errors,
            onHighlight,
            format, onChange, name, title} = this.props;
        let highlighter = code => highlight(code, languages[format]);
        if (onHighlight) {
            highlighter  = onHighlight;
        }
        return (
            <>
              <Row>
                <Label
                  className="text-right"
                  for="configuration"
                  sm={2}>{title}</Label>
                <Col sm={8} />
                <Col sm={2} className="align-text-bottom">
                  <ActionCopy copy={this.copyConfig} />
                  <ActionClear clear={clearConfig} />
                </Col>
              </Row>
              {(errors.configuration || []).map((e, i) => {
                  return (
                      <Alert
                        className="p-1 mt-2 mb-2"
                        color="danger"
                        key={i}>{e}</Alert>
                  );
              })}
              <Editor
                className="border bg-secondary"
                value={content}
                onValueChange={onChange}
                highlight={highlighter}
                padding={10}
                name={name}
                id={name}
                ref={(textarea) => this.textArea = textarea}
                style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                }}
              />
            </>);
    }
}
