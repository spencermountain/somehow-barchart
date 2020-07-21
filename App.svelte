<script>
  import { Horizontal, Vertical, Bar } from './src'
</script>

<style>

</style>

<div class="main">
  <h2>somehow-barchart</h2>
  <a href="https://github.com/spencermountain/somehow-barchart" class="m4">github</a>
  <div class="w10 m4">
    <Horizontal>
      <Bar color="blue" value="19" />
      <Bar color="red" value="5" label="red" />
      <Bar color="green" value="10" label="green" />
    </Horizontal>
  </div>
  <div class="w10 m4" style="margin:8rem;">
    <Vertical width="400px">
      <Bar color="blue" value="19" />
      <Bar color="red" value="5" label="red" />
      <Bar color="green" value="10" label="green" />
    </Vertical>
  </div>
</div>
