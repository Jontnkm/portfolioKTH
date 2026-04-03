const { src, dest, series, parallel, watch } = require('gulp');
const ejs = require('gulp-ejs');
const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const clean = require('gulp-clean');
const browserSync = require('browser-sync').create();

// dist 폴더 삭제
function clear() {
    console.log("dist 폴더를 삭제 합니다.");
    return src('./project/dist/', { read: false, allowEmpty: true })
        .pipe(clean());
}

// common 폴더 복사
function commonCopy() {
    console.log("common 파일을 복사합니다.");
    return src(['./project/src/common/**/*', '!./project/src/common/scss/**/*'])
        .pipe(dest('./project/dist/common'));
}

// 이미지 복사
function imageCopy() {
    console.log("이미지 복사 중...");
    return src('./project/src/common/images/**/*')
        .pipe(dest('./project/dist/common/images'))
        .on('end', () => { browserSync.reload(); });
}

// guide 폴더 복사
// function guideCopy() {
//     console.log("guide 파일을 복사합니다.");
//     return src(['./project/src/guide/**/*'])
//         .pipe(dest('./project/dist/guide'));
// }

// ejs를 html로 변환
function compileEjs() {
    console.log("EJS 컴파일 프로세스 가동...");
    return src([
        'project/src/**/*.html',
        'project/src/**/*.ejs'
    ], { base: 'project/src' }) // base 경로에서 ./ 제거
        .pipe(ejs({}, { ext: '.html' }).on('error', function(err) {
            console.error('EJS 에러 발생:', err);
            this.emit('end');
        }))
        .pipe(dest('./project/dist'))
        .on('end', () => {
            browserSync.reload();
            console.log(">>> 컴파일 및 브라우저 새로고침 완료");
        });
}

// scss 설정
var scssOptions = {
    indentType: "tab",
    indentWidth: 1,
    precision: 6,
    sourceComments: true,
    quietDeps: true, // Sass 경고 로그 숨기기
    logger: {
        warn: function(message) { /* 경고 무시 */ },
        debug: function(message) { /* 디버그 무시 */ }
    }
};

function compileScss() {
    // 확장자 부분을 {scss,css}로 변경하여 두 종류 모두 읽어옵니다.
    return src(['./project/src/scss/**/*.scss', './project/src/common/css/**/*.css'])
        .pipe(sourcemaps.init())
        .pipe(scss(scssOptions).on('error', scss.logError))
        .pipe(sourcemaps.write('../maps'))
        .pipe(dest('./project/dist/common/css'))
        .pipe(browserSync.stream());
}

function compileJs() {
    console.log("js compile");
    return src('./project/src/common/js/**/*')
        .pipe(dest('./project/dist/common/js'));
}

// 실시간 감지
function watcher() {
    // interval을 더 좁히고 polling을 강화합니다.
    const watchOptions = { usePolling: true, interval: 100, ignoreInitial: true };

    console.log("파일 변경 감지 대기 중... (header.ejs를 수정해 보세요)");

    // 경로 앞에 ./를 제거한 형태와 포함한 형태 모두 감시하도록 설정 (가장 확실한 방법)
    const ejsWatcher = watch([
        'project/src/**/*.html', 
        'project/src/**/*.ejs',
        './project/src/**/*.html',
        './project/src/**/*.ejs'
    ], watchOptions, series(compileEjs));

    // 감시자가 파일을 인식하는 즉시 터미널에 경로를 찍습니다.
    ejsWatcher.on('change', function(path) {
        console.log('-----------------------------------------');
        console.log('신호 포착! 변경된 파일: ' + path);
    });

    watch('project/src/scss/**/*.scss', watchOptions, series(compileScss));
    watch('project/src/common/css/**/*.css', watchOptions, series(compileScss));
    watch('project/src/common/js/**/*.js', watchOptions, series(compileJs));
    watch('project/src/common/images/**/*', watchOptions, series(imageCopy));
}

// 로컬서버
function browser(cb) {
    browserSync.init({
        server: {
            baseDir: './project/dist',
            directory: true,
        },
        startPath: "/index.html",
    });
    cb();
}

// Task 등록
const build = series(imageCopy, commonCopy, compileScss, compileEjs, compileJs);
//guideCopy

exports.reset = series(clear, build);
exports.build = build;
exports.watch = series(build, watcher);
exports.default = series(build, parallel(watcher, browser));