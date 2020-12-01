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
    COMPOSE_FILE=./composition/docker-compose.yaml docker-compose "$@"
}

_docker_compose_run () {
    _docker_compose run --rm -e CI=1 "$@"
}

js_tests () {
    local testtype;
    testtype="$1"
    _docker_compose build ui
    _docker_compose_run ui yarn install
    if [[ -z "$testtype" || "$testtype" == "test" ]]; then
	_docker_compose_run ui yarn test --coverage
    fi
    if [[ -z "$testtype" || "$testtype" == "lint" ]]; then
	_docker_compose_run ui yarn lint
    fi
}

py_tests () {
    local testtype;
    testtype="$1"
    _docker_compose build control
    if [[ -z "$testtype" || "$testtype" == "test" ]]; then
	_docker_compose_run control pytest
    fi
    if [[ -z "$testtype" || "$testtype" == "typing" ]]; then
	# todo: remove skip on imports
	_docker_compose_run control mypy --namespace-packages playground/control
    fi
    if [[ -z "$testtype" || "$testtype" == "lint" ]]; then
	_docker_compose_run control flake8 playground/control tests/
    fi
}

sh_tests () {
    find . -name "*.sh" | grep -v node_modules | xargs shellcheck -x
}

run_tests () {
    local testtype;
    testtype="$1"
    if [[ -n "$testtype" ]]; then
	shift
    fi
    mkdir -p .cache/coverage
    if [[ -z "$testtype" || "$testtype" == "js" ]]; then
	js_tests "$@"
    fi
    if [[ -z "$testtype" || "$testtype" == "py" ]]; then
	py_tests "$@"
    fi
    if [[ -z "$testtype" || "$testtype" == "sh" ]]; then
	sh_tests "$@"
    fi
}

run_tests "$@"

if [[ "${#FAILED[@]}" -ne "0" ]]; then
    echo "TESTS FAILED:"
    for failed in "${FAILED[@]}"; do
        echo "$failed" >&2
    done
    exit 1
fi
