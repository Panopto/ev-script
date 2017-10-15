ev-script
=========

JavaScript library supporting Ensemble Video integration.

## Development Setup

### Requirements

* [Node.js](http://nodejs.org/)
* [Grunt](http://gruntjs.com/)

### Setup

Install dependencies:

    npm install

Build jquery-ui:

    cd node_modules/jquery-ui
    npm install
    grunt sizer

Verify success by running the default grunt task:

    cd ../..
    grunt

## Demo

Run the grunt demo task:

    grunt demo

and navigate to [https://localhost:8000/demo](https://localhost:8000/demo).
