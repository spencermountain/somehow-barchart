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
