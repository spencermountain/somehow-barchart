<div align="center">
  <div><b>somehow-barchart</b></div>
  <img src="https://user-images.githubusercontent.com/399657/68222691-6597f180-ffb9-11e9-8a32-a7f38aa8bded.png"/>
  <div>— part of <a href="https://github.com/spencermountain/somehow">somehow</a> —</div>
  <div>WIP svelte infographics</div>
  <div align="center">
    <sub>
      by
      <a href="https://spencermounta.in/">Spencer Kelly</a> 
    </sub>
  </div>
</div>
<div align="right">
  <a href="https://npmjs.org/package/somehow-barchart">
    <img src="https://img.shields.io/npm/v/somehow-barchart.svg?style=flat-square" />
  </a>
</div>
<img height="25px" src="https://user-images.githubusercontent.com/399657/68221862-17ceb980-ffb8-11e9-87d4-7b30b6488f16.png"/>



WIP responsive barchart svelte component

`npm i somehow-barchart`

```html
<script>
  import { Horizontal, Bar } from 'somehow-barchart'
</script>
<Horizontal>
  <Bar color="blue" value="19" />
  <Bar color="red" value="5" />
  <Bar color="green" value="10" label="green" />
</Horizontal>
```

![image](https://user-images.githubusercontent.com/399657/88101585-3556aa00-cb6c-11ea-821c-c7413368889d.png)

### Vertical

```html
<script>
  import { Vertical, Bar } from 'somehow-barchart'
</script>
<Vertical>
  <Bar color="blue" value="19" />
  <Bar color="red" value="5" />
  <Bar color="green" value="10" label="green" />
</Vertical>
```

![image](https://user-images.githubusercontent.com/399657/88101614-41db0280-cb6c-11ea-8611-32b34306f6a0.png)

MIT
