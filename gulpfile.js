var gulp = require("gulp");
var plugins = require("gulp-load-plugins")();
plugins.del = require("del");

require("../gulp-ps-tasks/tasks")(gulp, plugins);