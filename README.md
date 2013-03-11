ev-script
=========

JavaScript library supporting Ensemble Video integration.

## Development Setup

Assumes [Node.js](http://nodejs.org/) is installed.

Due to an issue in a grunt-requirejs dependency, it needs to be installed prior
to installing the remainder of the dev dependencies:

    npm install grunt-requirejs

Then you can install the remainder of the dependencies:

    npm install

Install bower globally (may require sysadmin privileges):

    npm install bower -g

Install bower packages (see component.json file for a list of these):

    bower install

Install compass-normalize:

    gem install compass-normalize

Verify success by running the default grunt task:

    grunt


## Demo

Run the grunt demo task:

    grunt demo

and navigate to [https://localhost:8000/demo](https://localhost:8000/demo).
