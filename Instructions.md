# example for use

    <flow @dropItem="addItem" :listData="listData: isDragItem="status">
        <flow-item v-for="item in listData" :key="item.id :itemData="item">
            <div class="com-item">{{ item.componentData.label }}div>
        </flow-item>
        <span slot="placeholder">please drag a node into flowspan>
    </flow>

# flow attributes

## listData

data of flow
type: FlowNodeItem[] Parameters must be passed

## moveable

node can move
type:boolean defalut:true

## scaleStep

step of scale
type:number defauilt:5(%)

## isDragItem

Whether the node is being dragged (only external nodes need to be considered, dragging of internal nodes in the flowchart need not be considered)
type:boolean default:false

## mode

mode of flow
type:string defalut:edit

可选值： edit/limitFun/preview

1. In edit mode, the node can be dragged and connected, and the connection can be deleted, and the function used is controlled by defaultFun;
2. In the restricted editing mode, nodes cannot be dragged and connected, lines cannot be deleted, and the available functions are controlled by limitFun;
3. In preview mode, no operation can be performed

## defaultFun

fun in edit mode
type:string default:"scale,suit,move"
The value of scaling is scale, the value of adaptive screen is suit, the value of canvas dragging is move, the value of automatic typesetting is compose, the value of defaultFun is the value of the function, a string connected by commas

## limitFun

fun in limitFun mode
type:string default:""
same as defaultFun

## defaultLineColor

default line color
type:string default:#515151

## highlightLineColor

highlight line color
When the line is selected with the right mouse button, the line will be highlighted and a delete button will appear at the clicked position.

## canvasBg

background of canvas
type:string default:#f7f7f7

## clickRange

When the line is selected, the radius of the trigger range is selected with the line as the center
type:number default:7

## arrowWidth

length of arrow
type:number default:12(px)

## arrowWidth

height of arrow
type:number default:8(px)

## isFlowThrough

Whether to highlight a whole process when clicking on a line
If the value is true, when the left mouse button clicks on a line, the entire process where the line is located is highlighted. Click range is affected clickRange attribute

# flow event

## refreshFlowLayout

If the width and height of the flow component are changed due to a non-window.resize event, you need to manually call this method to refresh some layout

## connectNodeByLine

If you need to connect the nodes through non-interface operations, you can call this method, the parameters are the id of the line start and end nodes, and the type is FlowLinePoint
example: this.flow.connectNodeByLine({
startId: id1,
endId: id2,
})

## replaceNodeId

When replacing the id of a node, please call this method instead of directly replacing it in the external component, the parameters are the old and new id
example: this.flow.replaceNodeId(oldId,newId)

## initLineListData

If listData already has data during initialization, or the data is loaded asynchronously, call this method when the data initialization is complete
example:this.flow.initLineListData()

## setLineStyle

Set the line style. The line style defaults to solid. At present, the special line style only supports dash, and the style of dash is [5,5]. ,
, The first parameter is an array of line start and end node ids, type is FlowLinePoint [], the second parameter is line style, default is solid
example this.flow.setLienStyle([{
startId: id1,
endId: id2,
}],'dash')

## setLineStyleByNode

Set all the lines above some nodes (the end node is the line of this node) to a certain style. Currently only solid and dash are supported.

, The first parameter is an array of node id, type is string [], the second parameter is line style, default is solid
example:this.flow.setLineStyleByNode([id1,id2],'dash')

# flow emit event

## dropItem

Triggered when the drop event is triggered on the canvas, the parameter type is FlowDropData <T>, which informs the external component to add a new node, expose the coordinates and current data, and the value of T is the type of the node ’s own data
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

Triggered when the line is completed, to notify the external component that a line has been added, the parameter type is FlowLinePoint, which is the id of the start node and end node of the line
{
startId:id1,
endId:id2,
}

## deleteLine

Triggered when a line is deleted to notify external components that the line has been deleted. The parameter type is FlowLinePoint, which is the id of the start node and end node of the line
{
startId:id1,
endId:id2,
}

# flow-item attributes

## itemData

The current flow-item data, the value is the corresponding item in listDat

## moveable

Whether the current node can be dragged, the priority is higher than the moveable of the flow component
type:boolean default:true

# listData 的结构说明

type of listData is
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

Where T is the type of the node's own attribute, which is controlled by an external component and has nothing to do with the function of the flow component. The default type is null
id: the id of each node, you must ensure that the id of each node is different
x: the horizontal coordinate of the node center on the canvas
y: the center of the node is on the longitudinal coordinate of the canvas
w: width of node
h: height of the node
showFocus: Whether the focus of the upper and lower lines is displayed when the mouse is hovering over the node. The default is '0', which is displayed up and down, '1' shows the bottom focus, '2' shows the top focus, and '3' shows neither:
childNode: saves the child nodes of the node
lineData: save line data
canvasScale: save the canvas scaling
componentData: the data of the node itself

# Precautions

## click event on node

In order to be compatible with the drag and drop of the Firefox browser, the node itself uses the mouse series of events, so in order to prevent the coupling of click and mouse, I prevented the click event during the capture phase. If you need to trigger the click event on the node itself, please change to the mouseup event

## compatibility

Not compatible with ie
