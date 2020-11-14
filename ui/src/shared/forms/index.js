import {connect} from 'react-redux';

import {BaseAliasForm} from './alias';
import {BasePortMappingForm} from './ports';

export {
    FormIntroMessage,
    PlaygroundForm,
    PlaygroundFormGroup,
    PlaygroundFormGroupRow} from './base';


const mapModalStateToProps = function(state) {
    return {
        form: state.form.value,
    };
}


const AliasForm = connect(mapModalStateToProps)(BaseAliasForm);
const PortMappingForm = connect(mapModalStateToProps)(BasePortMappingForm);

export {AliasForm, PortMappingForm}
