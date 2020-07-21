<script>
  import { setContext, onMount } from 'svelte'
  import { bars } from './store'
  import layout from './layout'

  export let width = '100%'

  let arr = []
  onMount(() => {
    arr = layout($bars)
  })
</script>

<style>
  .container {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-around;
    align-items: flex-start;
    text-align: right;
    flex-wrap: nowrap;
    align-self: stretch;
  }
  .item {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: end;
    text-align: right;
    flex-wrap: nowrap;
    align-self: stretch;
  }
  .label {
    color: #a6a4a4;
    min-width: 100px;
    max-width: 100px;
    font-size: 16px;
    margin-right: 1rem;
  }
  .bar {
    height: 20px;
    margin-top: 10px;
    border-radius: 2px;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
  }
</style>

<div class="container" style="width:{width};">
  {#each arr as bar}
    <div class="item">
      <div class="label">{bar.label || ''}</div>
      <div class="bar" style="background-color:{bar.color}; min-width:{bar.size}%;" />
    </div>
  {/each}
</div>
<slot />
