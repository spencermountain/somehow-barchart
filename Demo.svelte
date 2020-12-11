<script>
  import { Horizontal, Vertical, Bar, Stack } from './src'
</script>

<style>
  .m4 {
    margin-top: 6rem;
    /* width: 50%; */
  }
</style>

<div class="main m4">
  <h2>somehow-barchart</h2>
  <div>
    a svelte barchart component -
    <a href="https://github.com/spencermountain/somehow-barchart" class="m4">github</a>
  </div>
  <!-- <div class="m4">
    <Horizontal label="build size">
      <Bar color="lightblue" label="jquery" value="84" />
      <Bar color="lightblue" label="react" value="140" />
      <Bar color="orange" label="compromise" value="170" />
      <Bar color="lightblue" label="d3" value="230" />
      <Bar color="lightblue" label="ember" value="435" />
      <Bar color="lightblue" label="angular" value="560" />
    </Horizontal>
  </div> -->
  <div class="m4 h8 w8" style="margin:8rem;">
    <Vertical numbers={true} label="build size:">
      <Stack>
        <Bar color="blue" label="d3" value="230" />
        <Bar color="orange" label="ember" value="435" />
      </Stack>
      <Stack>
        <Bar color="red" label="angular" value="560" />
        <Bar color="lightblue" label="d3" value="230" />
      </Stack>
      <Stack>
        <Bar color="lightblue" label="ember" value="435" />
        <Bar color="lightblue" label="angular" value="560" />
      </Stack>
    </Vertical>
  </div>
</div>
