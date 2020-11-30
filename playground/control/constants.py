# -*- coding: utf-8 -*-

# this will give total 20, 10 per proxies/services
MAX_NETWORK_CONNECTIONS = 10

MIN_NAME_LENGTH = 2
MAX_NAME_LENGTH = 32
MIN_CONFIG_LENGTH = 7
MAX_CONFIG_LENGTH = 4096

RE_NAME = r'[a-z]+[a-z0-9\.\-_]*$'
RE_NOT_NAME = r'(?!.*(__|\.\.|\-\-)+.*$)'
RE_UUID = r'[0-9a-f]+$'
