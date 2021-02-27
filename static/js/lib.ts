import React from "react"
window.React = React

import inspect from 'browser-util-inspect';
window.inspect = inspect

import MersenneTwister from "mersennetwister"
import classNames from "classnames"
import * as moment from "moment"
import * as chartjs from "chart.js"
import * as NoSleep from "nosleep.js"
import * as Soundfont from "soundfont-player"

export { MersenneTwister, classNames, moment, chartjs, NoSleep, Soundfont }
