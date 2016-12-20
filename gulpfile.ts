import { Gulpclass, Task, SequenceTask } from "gulpclass/Decorators";

let gulp       = require("gulp");
let rename     = require('gulp-rename');
let livereload = require('gulp-livereload');

@Gulpclass()
export class Gulpfile {
    @Task("jade")
    jade() {
        let jade = require('gulp-jade');

        return gulp.src("./src/views/*.jade")
            .pipe(
                jade()
            )
            .pipe(
                gulp.dest('./web/views')
            )
            .pipe(
                livereload()
            )
    }

    @Task("typescript")
    typescript() {
        let project = require('gulp-typescript').createProject('tsconfig.json');

        gulp.src("node_modules/systemjs/dist/system.src.js")
            .pipe(
                rename('system.js')
            )
            .pipe(
                gulp.dest('./web/js')
            )

        gulp.src("node_modules/reflect-metadata/Reflect.js")
            .pipe(
                rename('reflect.js')
            )
            .pipe(
                gulp.dest('./web/js')
            )

        gulp.src("node_modules/zone.js/dist/zone.js")
            .pipe(
                rename('zone.js')
            )
            .pipe(
                gulp.dest('./web/js')
            )

        return gulp.src('./src/**/*.ts')
            .pipe(
                project()
            )
            .pipe(
                gulp.dest('./web')
            )
            .pipe(
                livereload()
            )
    }

    @Task("sass")
    sass() {
        let sass = require('gulp-sass');

        return gulp.src("./src/css/*.scss")
            .pipe(
                sass()
            )
            .pipe(
                gulp.dest('./web/css')
            )
            .pipe(
                livereload()
            )
    }

    @SequenceTask("build")
    build() {
        return ["jade", "typescript", "sass"];
    }

    @Task("watch", ["build"])
    watch() {
        livereload.listen();

        gulp.watch('./src/**/*.jade', ['jade']);
        gulp.watch('./src/**/*.ts', ['typescript']);
        gulp.watch('./src/**/*.scss', ['sass']);

        return ["build"];
    }

    @Task("default", ["build"])
    default() {
        return ["build"];
    }
}
