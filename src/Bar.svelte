<script>
  import { getContext } from 'svelte'
  export let color = 'steelblue'
  export let label = ''
  export let value = '0'
  export let title = ''
  export let hover = () => {}
  export let click = () => {}

  let bars = getContext('bars')
  import c from 'spencer-color'
  let colors = c.colors
  color = colors[color] || color

  let stack = getContext('stack')

  $bars.push({
    value: Number(value),
    color,
    label,
    hover,
    click,
    title,
    stack
  })
</script>

<div />
