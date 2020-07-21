<script>
  import { setContext, onMount } from 'svelte'
  import { bars } from './store'

  export let width = '100%'

  let arr = []
  onMount(() => {
    arr = $bars
  })
</script>

<style>
  .container {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
    align-items: center;
    text-align: center;
    flex-wrap: nowrap;
    align-self: stretch;
  }
  .bar {
    width: 20px;
  }
</style>

<div class="container" style="width:{width};">
  {#each arr as bar}
    <div class="bar">{bar.label || ''}</div>
  {/each}
</div>
<slot />
