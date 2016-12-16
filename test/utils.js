function delay() {
  return function (done) {
    setTimeout(function () {
      done()
    }, 1000);
  }
}

module.exports = {
  delay: delay
};
