ev-script
=========

JavaScript library supporting Ensemble Video integration.

## Development Setup

### Requirements

* [Node.js](http://nodejs.org/)
* [Ruby](http://www.ruby-lang.org/en/)
* [RubyGems](http://rubygems.org/)
* [Grunt](http://gruntjs.com/)

### Setup

Install dev dependencies:

    npm install

Install bower globally (may require sysadmin privileges):

    npm install bower -g

_Windows users_: mysysgit needs to be installed with the 'Run Git from the
Windows Command Prompt' option set for bower to work.

Install bower packages (see component.json file for a list of these):

    bower install

_Windows users_: I had to run this a few times to successfully install required
packages.  YMMV.

Install compass and compass-normalize:

    gem install compass compass-normalize

Verify success by running the default grunt task:

    grunt

## Demo

Run the grunt demo task:

    grunt demo

and navigate to [https://localhost:8000/demo](https://localhost:8000/demo).
