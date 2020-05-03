# vue-flow

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn run serve
```

### Compiles and minifies for production

```
yarn run build
```

### Run your tests

```
yarn run test
```

### Lints and fixes files

```
yarn run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Instruction for use;

### flow props

@Prop({ type: String, default: "请拖入节点进行组合" })
public placeholder!: string;

@Prop({ type: String, default: "" })
public limitFun!: string;

@Prop({ type: Boolean, default: true })
private moveable!: boolean;

// nodelistdata
@Prop({ type: Array, default: [] })
private listData!: FlowNodeItem[];

@Prop({ type: Number, default: 10 })
private moveStep!: number;

@Prop({ type: Number, default: 5 })
private scaleStep!: number;
@Prop({ type: Number, default: 7 })
private clickRange!: number;
@Prop({ type: Number, default: 12 })
private arrowWidth!: number;
@Prop({ type: Number, default: 8 })
private arrowHeight!: number;

@Prop({ type: Boolean, default: false })
private isDragItem!: boolean;

@Prop({ type: String, default: "edit" })
private mode!: string;
@Prop({ type: String, default: "#f7f7f7" })
private canvasBg!: string;
@Prop({ type: String, default: "solid" })
private defaultLineStyle!: string;
@Prop({ type: String, default: "scale,suit,move" })
public defaultFun!: string;
@Prop({ type: String, default: "#515151" })
public defaultLineColor!: string;
@Prop({ type: String, default: "#4d81ef" })
public highlightLineColor!: string;
