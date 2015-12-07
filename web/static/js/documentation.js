function isNodeClass (clazz) {
  return clazz.startsWith('node')
}

function forEach(nodelist, f) {
  Array.prototype.forEach.call(nodelist, f)
}

function toggleCollapse(row) {
  row.classList.toggle('collapsed-parent')
  forEach(row.parentNode.querySelectorAll('.json-row'), function (elem) {
    elem.classList.remove('collapsed')
  })
  forEach(row.parentNode.querySelectorAll('.collapsed-parent'), function (parent) {
    forEach(row.parentNode.querySelectorAll('.' + parent.className.split(' ').filter(isNodeClass).join('.')), function (elem) {
      if (!elem.classList.contains('collapsed') && elem !== parent) {
        elem.classList.add('collapsed')
      }
    })
  })
}
var clickHandler = function(e) {
  function findParentRow(el) {
    while ((el = el.parentElement) && !el.classList.contains('json-row'));
    return el
  }
  toggleCollapse(findParentRow(e.currentTarget));
}

forEach(document.querySelectorAll('.json-row .collapsible'), function(node) {
    node.addEventListener('click', clickHandler, false)
})

forEach(document.querySelectorAll('.json-row:first-child'), toggleCollapse)

forEach(document.querySelectorAll('.api-tester'), function(elem) {
  var exampleSelector = elem.querySelector(".examples select")
  if (exampleSelector) {
    exampleSelector.addEventListener("change", function(a,b,c) {
      var data = event.target.options[event.target.selectedIndex].dataset.exampledata
      elem.querySelector("textarea").value=data
    })
  }

  elem.querySelector(".try").addEventListener('click', function() {
    elem.className = "api-tester loading"
    var options = {credentials: 'include', method: elem.dataset.method, headers: {'Content-Type': 'application/json'}};

    var dataElem = elem.querySelector("textarea");
    if (dataElem) {
      options.body = dataElem.value
    }

    var path = elem.dataset.path

    Array.prototype.slice.call(elem.querySelectorAll(".parameters input"),0).forEach(function(input) {
      path = path.replace('{' + input.name + '}', encodeURIComponent(input.value))
    })

    fetch(document.location.protocol + "//" + document.location.host + path, options)
      .then(function(response) {
        var resultElem = elem.querySelector(".result");
        elem.className = "api-tester"
        response.text().then(function(text, err) {
          if (response.status == 401) {
            resultElem.innerHTML = response.status + " " + response.statusText + ' <a href="/tor" target="_new">Login</a>'
          } else if (text) {
            resultElem.innerHTML = response.status + " " + response.statusText + "<pre>" + text + "</pre>"
          } else {
            resultElem.innerHTML = response.status + " " + response.statusText
          }
        })
      })
  })
})

