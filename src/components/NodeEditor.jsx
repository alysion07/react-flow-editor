import React, { useState, useRef, useCallback, useMemo, useEffect  } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Controls,
    Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

import NodePalette from './NodePalette';
import PositionNode from './Node.jsx'; // 커스텀 노드 임포트
import NodeInspector from "./NodeInspector.jsx";
import useFlowStore from './store/useFlowStore.jsx';
import { componentTypes, componentCategories } from './ComponentsType.jsx';

import './styles/NodeEditor.css';


const proOptions = { hideAttribution: true };

let id = 0;
const getId = () => `node_${id++}`;

const NodeEditor = () => {

    // 커스텀 노드 타입 등록
    const nodeTypes = useMemo(() => ({
        positionNode: PositionNode,
    }), []);

    const store = useFlowStore();
    const [nodes, setNodes] = useState(store.present.nodes);
    const [edges, setEdges] = useState(store.present.edges);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);

    useEffect(() => {
        setNodes(store.present.nodes);
        setEdges(store.present.edges);
    }, [store.present.nodes, store.present.edges]);

    const handleNodesChange = useCallback((changes) => {
        const updatedNodes = applyNodeChanges(changes, nodes);
        setNodes(updatedNodes); // 👉 로컬 상태만 갱신
    }, [nodes]);

    const handleEdgesChange = useCallback((changes) => {
        const updatedEdges = applyEdgeChanges(changes, edges);
        setEdges(updatedEdges);
    }, [nodes, edges, store]);

    const handleNodeDragStop = useCallback((_, draggedNode) => {
        const updatedNodes = nodes.map((node) =>
            node.id === draggedNode.id ? { ...node, position: draggedNode.position } : node
        );
        setNodes(updatedNodes);
        store.set(updatedNodes, edges);
    }, [nodes, edges, store]);

    const handleConnect = useCallback((connection) => {
        const updatedEdges = addEdge(connection, edges);
        setEdges(updatedEdges);
        store.set(nodes, updatedEdges);
    }, [nodes, edges, store]);

    const onNodeClick = useCallback((event, node) => {
        console.log('Node clicked',node );
        store.setSelectedNodeId(node.id);
        setSelectedNode(node);
    }, []);

    const handleDrop = useCallback((event) => {
        event.preventDefault();
        const type = event.dataTransfer.getData('application/reactflow');
        if (!type) return;

        const position = reactFlowInstance.screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        });

        store.dropNode(type, position);
    }, [reactFlowInstance, store]);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onPaneClick = useCallback(() => {
        setSelectedNode(null);
    }, [setSelectedNode]);

    return (
        <div className="node-editor">
            <NodePalette />
            <ReactFlowProvider>
                <div className="reactflow-wrapper" ref={reactFlowWrapper}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                >
                    <button onClick={store.undo} disabled={!store.canUndo }>Undo</button>
                    <button onClick={store.redo} disabled={!store.canRedo }>Redo</button>
                    <ReactFlow
                        onInit={setReactFlowInstance}
                        proOptions={proOptions}
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes} // 커스텀 노드 타입
                        onNodesChange={handleNodesChange}
                        onNodeClick={onNodeClick}
                        onNodeDragStop={handleNodeDragStop} // 노드 드래그 완료 이벤트 핸들러 추가
                        onEdgesChange={handleEdgesChange}
                        defaultEdgeOptions={{ type: 'smoothstep' }}
                        connectionLineType='smoothstep'
                        onConnect={handleConnect}
                        onPaneClick={onPaneClick}
                    >
                        <Controls />
                        <Background />
                    </ReactFlow>
                </div>
                <NodeInspector
                     selectedNode={selectedNode}
                     componentTypes={componentTypes}
                    // onPropertyChange={handleNodePropertyChange}
                />
            </ReactFlowProvider>
        </div>
    );
};

export default NodeEditor;