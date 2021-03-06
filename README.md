# vue-flow

这是一个 vue-flow 组件的简单 demo

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

# example for use

import Flow from "@touchpillow/vue-flow";
@Component({
name: "Drag",
components: {
flow: Flow.Flow,
flowItem: Flow.FlowItem,
},
})

    <flow @dropItem="addItem" :listData="listData: isDragItem="status">
        <flow-item v-for="item in listData" :key="item.id :itemData="item">
            <div class="com-item">{{ item.componentData.label }}div>
        </flow-item>
        <span slot="placeholder">please drag a node into flowspan>
    </flow>

# flow attributes

## listData

流程图的数据
type: FlowNodeItem[] 必传

## moveable

流程图的节点是否可拖动
type:boolean defalut:true

## scaleStep

缩放时的步长
type:number defauilt:5(%)

## isDragItem

是否正在拖动节点（只需要考虑外部的节点，流程图内部节点的拖动不需要考虑）
type:boolean default:false

## mode

模式类型
type:string defalut:edit

可选值： edit/limitFun/preview

1. 编辑模式下，节点可拖动可连线，连线可删除，通过 defaultFun 来控制使用的功能;
2. 限制编辑模式下，节点不可拖动和连线，线条不能删除，通过 limitFun 控制可使用的功能; 3. 预览模式下，不能进行任何操作;

## defaultFun

编辑模式下可使用的功能
type:string default:"scale,suit,move"
缩放的值为 scale，自适应屏幕的值为 suit，画布拖动的值为 move，自动排版的值为 compose,defaultFun 的值是功能的值用逗号连接的字符串

## limitFun

限制编辑模式下可使用的功能
type:string default:""
说明同 defaultFun

## defaultLineColor

普通线条颜色
type:string default:#515151

## highlightLineColor

高亮线条颜色
鼠标右键选中线条时，该线条会高亮，并在点击位置出现删除按钮。highlightLineColor 控制高亮状态的线条的颜色

## canvasBg

画布背景颜色
type:string default:#f7f7f7

## clickRange

选中线条时，以线条为中心选中触发范围的半径
type:number default:7

## arrowWidth

绘制的箭头的长度
type:number default:12(px)

## arrowWidth

绘制的箭头的宽度
type:number default:8(px)

## isFlowThrough

是否点击某线条时，高亮整个流程
若值为 true,鼠标左键点击某线条时，该线条所处的全流程均高亮。点击范围受 clickRange 控制

# flow event

## refreshFlowLayout

如果 flow 组件的宽高因非 window.resize 事件引起了变化，那么需要手动调用该方法刷新一些布局

## connectNodeByLine

如果需要通过非界面操作连接节点，可以调用该方法，参数为线条起始和结束节点的 id，类型为 FlowLinePoint
example: this.flow.connectNodeByLine({
startId: id1,
endId: id2,
})

## replaceNodeId

替换某个节点的 id 时请通过调用该方法而非在外部组件直接替换,参数为旧、新 id
example: this.flow.replaceNodeId(oldId,newId)

## initLineListData

如果初始化时 listData 已有数据，或者通过异步加载了数据，请在数据初始化完成时调用该方法
example:this.flow.initLineListData()

## setLineStyle

设置线条的样式。线条样式默认为 solid，目前特殊线条样式只支持 dash，dash 的样式为[5,5]。、
，第一个参数为线条起始、结束节点的 id 组成的数组，类型为 FlowLinePoint[]，第二个参数为线条样式，默认为 solid
example this.flow.setLienStyle([{
startId: id1,
endId: id2,
}],'dash')

## setLineStyleByNode

将某些节点上面的所有线条（结束节点为该节点的线条）全部设置为某样式，目前只支持 solid 和 dash。

，第一个参数为节点 id 组成的数组，类型为 string[]，第二个参数为线条样式，默认为 solid
example:this.flow.setLineStyleByNode([id1,id2],'dash')

# flow emit event

## dropItem

画布上触发 drop 事件时触发，参数类型为 FlowDropData<T>,通知外部组件新增节点，暴露坐标及当期的数据,T 的值为节点自身数据的类型
example:
public dropItem(params: FlowDropData<ComponentNode>) {
this.listData.push(
this.createItem(params.data, params.layout, `${Math.random()}`, 80, 36)
);
}

    public createItem<ComponentNode>(
    item: ComponentNode,
    layout: FlowNodeLayout,
    id: string,
    w: number,
    h: number,
    showFocus = "0"

): FlowNodeItem<ComponentNode> {
return {
componentData: item,
id,
x: layout.x,
y: layout.y,
w,
h,
lineData: [],
childNode: [],
canvasScale: 100,
showFocus,
};
}

FlowNodeLayout 的类型为{
x:number,
y:number
}

## completeALine

线条完成时触发,通知外部组件已新增线条，参数类型为 FlowLinePoint,即该线条起始节点和结束节点的 id
{
startId:id1,
endId:id2,
}

## deleteLine

删除某线条时触发，通知外部组件已删除线条,参数类型为 FlowLinePoint,即该线条起始节点和结束节点的 id
{
startId:id1,
endId:id2,
}

# flow slot

placeholder:为空时的占位内容，默认居中

# flow-item attributes

## itemData

当前 flow-item 的数据，值是 listDat 中的对应项

## moveable

当前节点是否能拖动，优先级高于 flow 组件的 moveable
type:boolean default:true

# listData 的结构说明

listData 的类型为
FlowNodeItem<T = null> {
id: string;
x: number;
y: number;
w: number;
h: number;
showFocus: string;
childNode: string[];
lineData: FlowLineItem[];
canvasScale: number;
componentData: T;
}

其中 T 是节点自身属性，由外部组件控制,与 flow 组件的功能无关，默认类型为 null
id:各节点的 id，必须保证每个节点的 id 不同
x:节点中心在画布的横坐标
y:节点中心在画布纵坐标
w:节点的宽度
h:节点的高度
showFocus:鼠标悬浮在节点上时，是否显示上下两个连线的焦点。默认'0'，上下都显示,'1'显示底部焦点，'2'显示顶部焦点，'3'都不显示：
childNode：保存了该节点的子节点
lineData:保存线条数据
canvasScale:保存画布缩放比例
componentData:节点自身的数据

# 注意事项

## 节点上的 click 事件

为了兼容火狐浏览器的拖拽，节点自身拖拽使用了 mouse 系列的事件，所以为了防止 click 和 mouse 的耦合，我在捕获阶段阻止了 click 事件。如果你在节点自身上需要触发 click 事件，请换成 mouseup 事件

## 兼容性

不兼容 ie
