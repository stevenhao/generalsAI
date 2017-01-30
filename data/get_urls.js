function loadMore() {
  var btn = document.getElementsByClassName("small inverted center-horizontal")[0];
  if (btn.innerText !== "Load More") {
    dumpData();
  } else {
    btn.click();
    setTimeout(function() { loadMore() }, 100);
  }
}

function dumpData() {
  var urls = Array.from(document.links).filter((item) => {
    return item.href.match('http://generals.io/replays/*');
  }).map((item) => {
    return item.pathname.split('/')[2];
  });
  console.log(urls.join('\n'));
}

loadMore();