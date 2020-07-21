<script>
  import { setContext, onMount } from 'svelte'
  import { bars } from './store'
  import layout from './layout'

  export let width = '100%'
  export let height = '350px'

  let arr = []
  onMount(() => {
    arr = layout($bars)
  })
</script>

<style>
  .container {
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    text-align: right;
    flex-wrap: nowrap;
    align-self: stretch;
  }
  .item {
    display: flex;
    flex: 1;
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    text-align: center;
    flex-wrap: nowrap;
    flex-grow: 1;
    align-self: stretch;
    /* min-width: 100px; */
    /* max-width: 100px; */
  }
  .label {
    color: #a6a4a4;
    min-height: 20px;
    max-height: 20px;
    font-size: 16px;
    width: 100%;
    flex: 1;
    margin-top: 0.5rem;
    text-align: center;
  }
  .bar {
    align-self: center;
    min-width: 20px;
    margin-top: 10px;
    border-radius: 2px;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
  }
</style>

<div class="container" style="width:{width}; height:{height};">
  {#each arr as bar}
    <div class="item">
      <div class="bar" style="background-color:{bar.color}; height:{bar.size}%;" />
      <div class="label">{bar.label || ''}</div>
    </div>
  {/each}
</div>
<slot />
