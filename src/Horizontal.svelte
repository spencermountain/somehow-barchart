<script>
  import { setContext, onMount } from 'svelte'
  import layout from './layout'
  import { writable } from 'svelte/store'
  export const bars = writable([])
  setContext('bars', bars)
  export let label = ''
  export let numbers = false
  export let max = null
  export let align = 'left'

  let arr = []
  onMount(() => {
    arr = layout($bars, max)
  })
</script>

<div class="container">
  {#if label}
    <div class="title">{label}</div>
  {/if}
  <div class="barchart" class:rightLabel={align === 'right'}>
    <!-- labels -->
    <div class="col labels">
      {#each arr as bar}
        <div class="row label" style="color:{bar.color};">
          {@html bar.label}
        </div>
      {/each}
    </div>
    <!-- bars -->
    <div class="col bars">
      {#each arr as bar}
        <div class="row-left" class:right={align === 'right'}>
          <div
            class="row bar"
            title={bar.title}
            on:click={bar.click()}
            on:mouseenter={bar.hover()}
            style="background-color:{bar.color}; width:{bar.size}%;"
          />
          {#if numbers}
            <div class="value">{bar.value}</div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
<slot />

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
  .rightLabel {
    flex-direction: row-reverse !important;
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
    margin-top: 5px;
    margin-bottom: 5px;
  }
  .label {
    position: relative;
    top: -1px;
    align-self: flex-end;
    color: #a6a4a4;
    font-size: 16px;
    margin-right: 5px;
    margin-left: 1rem;
    margin-right: 1rem;
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
  .container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  .title {
    position: relative;
    color: #949a9e;
    font-size: 0.7rem;
    margin-bottom: 0.3rem;
  }
  .row-left {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    text-align: center;
    flex-wrap: nowrap;
    align-self: stretch;
  }
  .right {
    justify-content: flex-end !important;
  }
  .value {
    color: #949a9e;
    opacity: 0.5;
    font-size: 0.5rem;
    margin-left: 0.3rem;
  }
</style>
