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
    justify-content: space-around;
    align-items: flex-start;
    text-align: right;
    flex-wrap: nowrap;
    align-self: stretch;
  }
  .col {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    text-align: center;
    flex-wrap: wrap;
    align-self: stretch;
  }
  .bars {
    flex: 1;
  }
  .labels {
    position: relative;
    flex: 0;
    align-items: flex-end;
    text-align: right;
  }
  .row {
    height: 20px;
    margin-top: 10px;
  }
  .label {
    position: relative;
    top: -1px;
    align-self: flex-end;
    color: #a6a4a4;
    font-size: 16px;
    margin-right: 5px;
    margin-left: 1rem;
    white-space: nowrap;
  }
  .bar {
    position: relative;
    border-radius: 2px;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
  }
  .bar:hover {
    box-shadow: 2px 2px 8px 0px steelblue;
  }
</style>

<div class="barchart">
  <!-- labels -->
  <div class="col labels">
    {#each arr as bar}
      <div class="row label">
        {@html bar.label}
      </div>
    {/each}
  </div>
  <!-- bars -->
  <div class="col bars">
    {#each arr as bar}
      <div class="row bar" style="background-color:{bar.color}; width:{bar.size}%;" />
    {/each}
  </div>

</div>
<slot />
