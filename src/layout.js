const getMax = function (arr) {
  let max = arr[0]
  for (let i = 1; i < arr.length; ++i) {
    if (arr[i] > max) {
      max = arr[i]
    }
  }
  return max
}

const linear = function (obj) {
  let world = obj.world || []
  let minmax = obj.minmax || obj.minMax || []
  const calc = (num) => {
    let range = minmax[1] - minmax[0]
    let percent = (num - minmax[0]) / range
    let size = world[1] - world[0]
    return size * percent
  }

  return calc
}

const layoutByStack = function (arr, max) {
  let byStack = {}
  arr.forEach((a) => {
    byStack[a.stack] = byStack[a.stack] || []
    byStack[a.stack].push(a)
  })
  // console.log(byStack)
  byStack = Object.keys(byStack).map((k) => byStack[k])
}

const layout = function (arr, max) {
  // compuate a stacked layout
  // if (arr && arr[0] && arr[0].stack) {
  //   return layoutByStack(arr, max)
  // }
  max = max || getMax(arr.map((a) => a.value))
  let scale = linear({
    world: [0, 100],
    minmax: [0, max]
  })
  let percent = 1 / arr.length
  arr.forEach((o) => {
    o.size = scale(o.value)
    o.share = percent * 100
    o.already = 0
  })
  // convert to stacked format
  // arr = arr.map((o) => [o])
  return arr
}

export default layout
