<script>
  import { getContext } from 'svelte'
  export let color = 'steelblue'
  export let label = ''
  export let value = '0'
  export let title = ''

  let bars = getContext('bars')
  import c from 'spencer-color'
  let colors = c.colors
  color = colors[color] || color

  let stack = getContext('stack')

  $bars.push({
    color: color,
    value: Number(value),
    label: label,
    title: title,
    stack: stack
  })
</script>

<div />
