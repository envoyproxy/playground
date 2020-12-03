

export class URLMangler {

    docker = (image) => {
        let parts;
        const _image = image.split(':')[0];
        if (_image.indexOf('/') === -1) {
            parts = [
                'https://hub.docker.com/_',
                _image];
        } else {
            parts = [
                'https://hub.docker.com/r',
                _image];
        }
        return parts.join('/');
    };
};
