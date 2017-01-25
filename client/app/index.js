function component () {
  var element = document.createElement('div')
  element.innerHTML = 'Привет'
  return element
}

document.body.appendChild(component())
