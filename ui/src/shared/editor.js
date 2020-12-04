
import React from 'react';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

import ReactMarkdown from 'react-markdown';

import {Alert, Col, Label, Row} from 'reactstrap';

import Editor from 'react-simple-code-editor';
import {highlight, languages} from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-yaml';
import 'prismjs/components/prism-python';

import {ActionCopy, ActionClear} from './actions';
import {PlaygroundSelectInput} from './forms';


export class ExampleSearch extends React.PureComponent {
    static propTypes = exact({
        examples: PropTypes.array.isRequired,
        onExampleSelect: PropTypes.func.isRequired,
    });

    render () {
        const {examples=[], onExampleSelect} = this.props;
        if (examples.length === 0) {
            return '';
        }
        return (
            <PlaygroundSelectInput
              name="example"
              onChange={onExampleSelect}
              noOption="Select an example"
              options={examples.map(k => [k, k])}
            />
        );
    }
}


export class PlaygroundEditor extends React.Component {
    static propTypes = exact({
        content: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,

        clearConfig: PropTypes.func,
        format: PropTypes.string,
        errors: PropTypes.array,
        onHighlight: PropTypes.func,
        onExampleSelect: PropTypes.func,
        examples: PropTypes.object,
    });

    state = {description: ''};

    copyConfig = () => {
        this.textArea._input.select();
        document.execCommand('copy');
    }

    onExampleSelect = async (evt) => {
        const {examples, onExampleSelect} = this.props;
        await onExampleSelect(evt);
        if (examples[evt.target.value] && examples[evt.target.value].description) {
            this.setState({description: examples[evt.target.value].description});
        } else {
            this.setState({description: ''});
        }
    }

    render () {
        const {
            clearConfig, content, errors=[],
            onHighlight,
            examples=[],
            format, onChange, name, title} = this.props;
        const {description} = this.state;
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
                <Col sm={5} />
                <Col sm={3}>
                  <ExampleSearch
                    onExampleSelect={this.onExampleSelect}
                    examples={Object.keys(examples)} />
                </Col>
                <Col sm={2} className="align-text-bottom">
                  <ActionCopy copy={this.copyConfig} />
                  {clearConfig &&
                   <ActionClear clear={clearConfig} />
                  }
                </Col>
              </Row>
              {description &&
               <Row className="pl-3 pr-3 pt-2 pb-2">
                 <Col sm={12}>
                   <Alert color="info" className="mb-0 pb-0">
                     <ReactMarkdown>
                       {description}
                     </ReactMarkdown>
                   </Alert>
                 </Col>
               </Row>
              }
              {(errors.configuration || []).map((e, i) => {
                  return (
                      <Alert
                        className="p-1 mt-2 mb-2"
                        color="danger"
                        key={i}>{e}</Alert>
                  );
              })}
              <Row>
                <Col
                  sm={12}>
                <Editor
                  className="border bg-code mb-0 m-2 mr-3 ml-3 rounded"
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
                </Col>
              </Row>
            </>);
    }
}
