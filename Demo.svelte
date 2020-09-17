<script>
  import { Horizontal, Vertical, Bar } from './src'
</script>

<style>

</style>

<div class="main m4">
  <h2>somehow-barchart</h2>
  <div>
    a svelte barchart component -
    <a href="https://github.com/spencermountain/somehow-barchart" class="m4">github</a>
  </div>
  <div class="mt4">
    <Horizontal>
      <Bar color="blue" value="19" />
      <Bar color="red" value="5" label="red" />
      <Bar color="green" value="10" label="green label" />
    </Horizontal>
  </div>
  <div class="m4 h8" style="margin:8rem;">
    <Vertical>
      <Bar color="blue" value="19" label="blue" />
      <Bar color="red" value="5" label="" />
      <Bar color="green" value="10" label="" />
    </Vertical>
  </div>
</div>
