

export class NameValidator {

    constructor (store) {
        this.store = store;
    }

    validate = (name, taken) => {
        const state = this.store.getState();
        const {value: meta} = state.meta;

        const {max_length, min_length} = meta;
        let valid = true;
        const _errors = [];

        if (name.length < parseInt(min_length)) {
            valid = false;
        }
        if (name.length > parseInt(max_length)) {
            valid = false;
            _errors.push('Name too long, maximum ' + max_length + ' chars.');
        }
        for (const forbidden of ['..', '--', '__']) {
            if (name.indexOf(forbidden) !== -1) {
                valid = false;
                _errors.push('Name cannot contain \'' + forbidden + '\'');
            }
        }
        if (name.length > 0 && !name.match(/[a-z]+[a-z0-9.\-_]*$/)) {
            valid = false;
            _errors.push('Name contains forbidden characters');
        }
        if ((taken || []).indexOf(name) !== -1) {
            valid = false;
            _errors.push('Name exists already');
        }
        const errors = {};
        if (_errors.length > 0) {
            errors.name = _errors;
        }
        return {valid, errors};
    }
}
