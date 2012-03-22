window.elementInViewport = (el) -> 
  top = el.offsetTop
  left = el.offsetLeft
  width = el.offsetWidth
  height = el.offsetHeight
  
  while(el.offsetParent) 
    el = el.offsetParent
    top += el.offsetTop
    left += el.offsetLeft
  
  return ( top >= window.pageYOffset &&
           left >= window.pageXOffset &&
           (top + height) <= (window.pageYOffset + window.innerHeight) &&
           (left + width) <= (window.pageXOffset + window.innerWidth))
