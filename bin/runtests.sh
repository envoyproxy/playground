#!/bin/bash -E

FAILED=()

trap_errors () {
    local frame=0 command line sub file
    set +v
    while read -r line sub file < <(caller "$frame"); do
        if [[ "$frame" -ne "0" ]]; then
            FAILED+=("  > ${sub}@ ${file} :${line}")
        else
            FAILED+=("${sub}@ ${file} :${line}${command}")
        fi
        ((frame++))
    done
    set -v
}

trap trap_errors ERR
trap exit 1 INT

_docker_compose () {
    COMPOSE_FILE=./dev/docker-compose.yaml docker-compose "$@"
}

js_tests () {
    # JavaScript
    _docker_compose build ui
    _docker_compose run \
		-e CI=1 \
		ui yarn install
    _docker_compose run \
		-e CI=1 \
		ui yarn test --coverage
    _docker_compose run \
		-e CI=1 \
		ui ./node_modules/.bin/eslint --max-warnings 0  src/
}

py_tests () {
    # Python
    _docker_compose build control
    _docker_compose run control pytest
    _docker_compose run control flake8 .
}

sh_tests () {
    find . -name "*.sh" | grep -v node_modules | xargs shellcheck -x
}

run_tests () {
    mkdir -p .cache/coverage
    js_tests
    py_tests
    sh_tests
}

run_tests

if [[ "${#FAILED[@]}" -ne "0" ]]; then
    echo "TESTS FAILED:"
    for failed in "${FAILED[@]}"; do
        echo "$failed" >&2
    done
    exit 1
fi
