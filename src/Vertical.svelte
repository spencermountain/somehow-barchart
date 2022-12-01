<script>
  import { setContext, onMount } from 'svelte'
  import layout from './layout'
  import { writable } from 'svelte/store'
  export const bars = writable([])
  setContext('bars', bars)

  export let label = ''
  export let max = null
  export let axis = false
  export let height = '100%'
  export let numbers = false

  let arr = []
  onMount(() => {
    arr = layout($bars, max)
    console.log(arr)
  })
</script>

<div class="container" style="height:{height};">
  {#if label}
    <div class="title">{label}</div>
  {/if}
  <div class="barchart" style="width:100%; height:100%;">
    {#if axis}
      <div class="axis" />
    {/if}
    <!-- {#each arr as stack} -->
    {#each arr as bar}
      <div class="item" style="max-width:{bar.share}%; min-width:{bar.share}%;">
        {#if numbers}
          <div class="value">{bar.value}</div>
        {/if}
        <div
          class="bar"
          title={bar.title}
          style="background-color:{bar.color}; height:{bar.size}%; "
        />
        <div class="label" style="color:{bar.color};">{bar.label || ''}</div>
      </div>
      <!-- {/each} -->
    {/each}
  </div>
</div>
<slot />

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
    /* flex: 1; */
    flex-direction: column;
    justify-content: flex-end;
    align-items: center;
    text-align: center;
    flex-wrap: nowrap;
    /* flex-grow: 1; */
    align-self: stretch;
    padding: 5px;
    box-sizing: border-box;
    /* margin: 5px; */
    /* overflow: hidden; */
  }
  .label {
    color: #a6a4a4;
    min-height: 20px;
    max-height: 20px;
    font-size: 12px;
    width: 100%;
    flex: 1;
    margin-top: 0.5rem;
    text-align: center;
    opacity: 0.7;
  }
  .bar {
    align-self: center;
    min-width: 20px;
    width: 100%;
    margin-top: 5px;
    border-radius: 2px;
    box-shadow: 2px 2px 8px 0px rgba(0, 0, 0, 0.2);
  }
  .bar:hover {
    box-shadow: 2px 2px 8px 0px steelblue;
  }
  .container {
    height: 100%;
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
  .value {
    color: #949a9e;
    opacity: 0.5;
    font-size: 0.5rem;
  }
  .axis {
    height: 90%;
    top: 5%;
    width: 2px;
    margin-right: 5px;
    background-color: lightgrey;
  }
</style>
