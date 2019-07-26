# parseSRT

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)
[![latest-release](https://img.shields.io/github/release/MrSlide/parseSRT.svg?style=flat-square)](https://github.com/MrSlide/ExtDate/tree/master)
[![GitHub issues](https://img.shields.io/github/issues/MrSlide/parseSRT.svg?style=flat-square)](https://github.com/MrSlide/ExtDate/issues)
[![license](https://img.shields.io/github/license/MrSlide/parseSRT.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A standalone and dependency-free function to parse and convert SRT subtitle data into JSON format.
This has been adapted from the [popcorn.js](http://popcornjs.org/) SRT parse plugin source code. The code to parse the SRT data is basically the same, with some differences in how the data is output.



## Installation

### Via [Bower](http://bower.io/)

```
bower install parse-srt
```

### Via [NPM](https://www.npmjs.com/)

```
npm install parse-srt
```



## Usage

parseSRT is an [UMD](https://github.com/umdjs/umd) module. You can load it into your application either by importing the module, or loading the script in your page.

If you are importing the parseSRT module via [Webpack](https://webpack.github.io/), [Browserify](http://browserify.org/) or similar, make sure that the module name `parse-srt` is being resolved correctly to the [Bower](http://bower.io/) or [NPM](https://www.npmjs.com/) packages folder.

### Via ES6 syntax

```
import parseSRT from 'parse-srt'
```

### Via CommonJS syntax

```
var parseSRT = require('parse-srt')
```

### Via the script tag

```
<script src="/scripts/parseSRT.js"></script> // Change the path as necessary
```



## API

### parseSRT([String] data)

Parse and convert a SRT subtitles file data into JSON format.

**Parameters**

| Name       | Type     | Required | Default                 | Description                                                                                      |
|------------|----------|----------|-------------------------|--------------------------------------------------------------------------------------------------|
| data       | [String] | `false`  | ''                      | The contents of a SRT subtitles file to be converted. If empty, an empty array will be returned. |

**Returns**

[Array] - An array containing an object for each subtitle.

**Example**

```
var jsonSubs = parseSRT(srtData)
```

The subtitle object has the following structure:

| Property   | Type     | Description                                                                                                  |
|------------|----------|--------------------------------------------------------------------------------------------------------------|
| id         | [Number] | The subtitle ID number, which corresponds to the order in the sequence of subtitles present in the SRT file. |
| start      | [Number] | The start timestamp in seconds                                                                               |
| end        | [Number] | The end timestamp in seconds                                                                                 |
| text       | [String] | The contents of the subtitle. HTML tags are kept for styling.                                                |



## Brower support

parseSRT, although not tested in all of them, was created using features supported by these browsers.

- Android Browser 4+
- Blackberry Browser 7+
- Chrome 13+
- Firefox 4+
- Internet Explorer 9+
- Opera 12+
- Opera Mini 5+
- Safari 7+



## Support

If you want to request new features or find any bugs, please open a ticket on the [issues](https://github.com/MrSlide/parseSRT/issues) page and I'll review it as soon as possible.



## Authors and Contributors

Created by Luís Rodrigues ([@MrSlide](https://github.com/MrSlide))



## License and copyright

Released under the [MIT](https://opensource.org/licenses/MIT) license

Copyright (c) 2016 Luís Rodrigues

[String]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/String
[Number]: https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Number
