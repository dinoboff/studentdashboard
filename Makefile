ROOT=`pwd`

PYENV=${ROOT}/pyenv
BIN=${PYENV}/bin
PYTHON=${BIN}/python
PIP=${BIN}/pip

GAEPATH ?= /usr/local/google_appengine
APPSERVER=${GAEPATH}/dev_appserver.py
APPCFG=${GAEPATH}/appcfg.py

PORT=8080
SRC=api
LIB=${SRC}/lib


.PHONY: serve setup-dev


serve:
	${PYTHON} ${APPSERVER} --host=0.0.0.0 --port=${PORT} ${SRC}

setup-dev:
	npm install
	bower install

	# create python virtual environment
	virtualenv ${PYENV}

	# install dependencies
	${PIP} install -r dev-requirements.txt

	# add GAE to path
	echo ${GAEPATH} >> ${PYENV}/lib/python2.7/site-packages/gae.pth
	echo ${ROOT}/${LIB} >> ${PYENV}/lib/python2.7/site-packages/gae.pth
	echo "import dev_appserver; dev_appserver.fix_sys_path()" >> ${PYENV}/lib/python2.7/site-packages/gae.pth

	@echo "A virtual environment has been created in ${PYENV}"
	@echo 'Make sure to run "source ' ${BIN}/activate '"'
	@echo "Make sure you have google app engine installed in ${GAEPATH}"
