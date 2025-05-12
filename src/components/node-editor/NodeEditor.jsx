import React, {useState, useRef, useCallback, useMemo, useEffect, use} from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    Controls,
    Background,
} from 'reactflow';
import 'reactflow/dist/style.css';

import useFlowStore from '../store/useFlowStore.jsx';
import { componentTypes } from './ComponentsType.jsx';

import NodePalette from './NodePalette.jsx';

import NodeItem from './NodeItem.jsx';
import {SimplifiedNode} from "./simpleNode.jsx";
import HeatStructure from "./controls/HeatStructure.jsx";

import NodeInspector from "./NodeInspector.jsx";
import Toolbar from "./Toolbar.jsx";
import GeneralSettingPane from "./GeneralSettingPane.jsx";

import './styles/NodeEditor.css';

const proOptions = { hideAttribution: true };

const NodeEditor = () => {

    // 커스텀 노드 타입 등록
    const nodeTypes = useMemo(() => ({
        node: NodeItem,
        simple: SimplifiedNode,

    }), []);

    const store = useFlowStore();
    const [nodes, setNodes] = useState(store.present.nodes);
    const [edges, setEdges] = useState(store.present.edges);
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isSimplified, setIsSimplified] = useState(false);

    const fileInputRef = React.useRef(null);

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

    const handleNodeDragStart = useCallback( (event, node, nodes) => {
        store.setNodeDragStart(event, node, nodes)
    }, [[nodes, nodes, edges]] )

// 컴포넌트에서 사용
    const handleNodeDragStop = useCallback((_, draggedNode) => {
        store.handleNodeDragStop(draggedNode);
    }, [store]);

    const handleConnect = useCallback((connection) => {
        const updatedEdges = addEdge(connection, edges);
        setEdges(updatedEdges);
        store.set(nodes, updatedEdges);
    }, [nodes, edges, store]);

    const onNodeClick = useCallback((event, node) => {
        store.setSelectedNodeId(node.id);
        setSelectedNode(node);
    }, []);

    const onGenSettings = useCallback(() => {
        setSelectedNode({id: 'genset', type: 'GENSET', data: { label: 'Genset', componentType: 'GENSET' }});
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

    const renderInspector = useCallback(() => {
        if (!selectedNode || !selectedNode.data) return null;

        // 선택한 노드의 componentType 가져오기
        const componentType = selectedNode.data.componentType;

        // componentType에 따라 다른 컴포넌트 렌더링
        switch(componentType) {
            case "HEATSTR":
                return (
                    <HeatStructure
                        selectedNode={selectedNode}
                    />
                );
            case "SNGLVOL":
            case "TMDPVOL":
            case "SNGLJUN":
            case "TMDPJUN":
            case "PIPE":
            case "PUMP":
                return (
                    <NodeInspector
                        selectedNode={selectedNode}
                        componentTypes={componentTypes}
                        onPropertyChange={() => {console.log( 'todo onPropertyChange ')}}
                    />
                );
                case "GENSET":
                    return ( <GeneralSettingPane/>);
            default:
                console.log("Unknown component type:", componentType);
                return (
                    <div className="inspector-placeholder">
                        <h3>선택한 노드: {selectedNode.data.label}</h3>
                        <p>컴포넌트 타입: {componentType || "없음"}</p>
                    </div>
                );
        }
    }, [selectedNode]);

    // Import 핸들러
    const handleImport = useCallback(() => {
        // 숨겨진 파일 입력 요소 클릭 트리거
        fileInputRef.current?.click();
    }, []);

    const handleExport = useCallback(() => {
        if (reactFlowInstance) {
            const flowData = reactFlowInstance.toObject();
            const jsonString = JSON.stringify(flowData, null, 2);

            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'flow-diagram.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [reactFlowInstance]);

    // 파일 변경 이벤트 처리
    const handleFileChange = useCallback((event) => {
        const fileReader = new FileReader();
        const file = event.target.files[0];

        if (!file) return;

        fileReader.onload = (e) => {
            try {
                const flowData = JSON.parse(e.target.result);

                // 유효성 검사
                if (flowData && flowData.nodes && flowData.edges) {
                    // 스토어의 importFlow 함수 호출
                    store.importFlow(flowData);

                    // ReactFlow 화면 중앙 맞추기
                    setTimeout(() => {
                        reactFlowInstance?.fitView({ padding: 0.1 });
                    }, 50);
                } else {
                    alert('유효하지 않은 다이어그램 파일입니다.');
                }
            } catch (error) {
                console.error('파일 파싱 중 오류 발생:', error);
                alert('파일을 불러오는 중 오류가 발생했습니다.');
            }
        };

        fileReader.readAsText(file);
        event.target.value = null;
    }, [store, reactFlowInstance]);

    const handleSimplify = useCallback(() => {
        setIsSimplified(!isSimplified);

        console.log('handleSimplify')

        // if (isSimplified) {
        //     setNodes(store.present.nodes);
        //     setEdges(store.present.edges);
        // } else {
        //     const simplifiedNodes = nodes.map(node => ({
        //         ...node,
        //         type: 'simple',
        //         data: { label: node.data.label },
        //     }));
        //     setNodes(simplifiedNodes);
        // }

    } , [setIsSimplified]);


    return (
        <div className="node-editor">

            <NodePalette componentsType={componentTypes} />
            <ReactFlowProvider>


                <div className="reactflow-wrapper" ref={reactFlowWrapper}
                        onDrop={handleDrop}
                >
                    <ReactFlow
                        onDragOver={handleDragOver}
                        onInit={setReactFlowInstance}
                        proOptions={proOptions}
                        nodes={nodes}
                        edges={edges}
                        nodeTypes={nodeTypes} // 커스텀 노드 타입
                        onNodesChange={handleNodesChange}
                        onNodeClick={onNodeClick}
                        onNodeDragStart={handleNodeDragStart}
                        onNodeDragStop={handleNodeDragStop} // 노드 드래그 완료 이벤트 핸들러 추가
                        onEdgesChange={handleEdgesChange}
                        defaultEdgeOptions={{ type: 'smoothstep' }}
                        connectionLineType='smoothstep'
                        onConnect={handleConnect}
                        onPaneClick={onPaneClick}
                    >
                        <Toolbar
                            onUndo={store.undo}
                            onRedo={store.redo}
                            canUndo={store.canUndo}
                            canRedo={store.canRedo}
                            onImport={handleImport}
                            onExport={handleExport}
                            onGeneralSetting={onGenSettings}
                            projectName={ 'default project' }
                            onSimplify={handleSimplify}
                        />
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                        />
                        <Controls />
                        <Background />
                    </ReactFlow>
                </div>
                <div className="right-panel">
                    {selectedNode ? renderInspector() :  null }
                </div>
            </ReactFlowProvider>
        </div>
    );
};

export default NodeEditor;