<script>
  import { setContext, onMount } from 'svelte'
  import { bars } from './store'
  import layout from './layout'

  let arr = []
  onMount(() => {
    arr = layout($bars)
  })
</script>

<style>
  .barchart {
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    text-align: right;
    flex-wrap: nowrap;
    align-self: stretch;
    min-height: 50px;
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
    margin: 5px;
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
    width: 100%;
    margin-top: 10px;
    border-radius: 2px;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
  }
  .bar:hover {
    box-shadow: 2px 2px 8px 0px steelblue;
  }
</style>

<div class="barchart" style="width:100%; height:100%;">
  {#each arr as bar}
    <div class="item">
      <div class="bar" style="background-color:{bar.color}; height:{bar.size}%;" />
      <div class="label">{bar.label || ''}</div>
    </div>
  {/each}
</div>
<slot />
