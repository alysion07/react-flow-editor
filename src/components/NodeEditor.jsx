import React, { useState, useRef, useCallback } from 'react';
import ReactFlow, {
    ReactFlowProvider,
    addEdge,
    useNodesState,
    useEdgesState,
    Controls
} from 'reactflow';
import 'reactflow/dist/style.css';

import NodePalette from './NodePalette';
import PositionNode from './PositionNode'; // 커스텀 노드 임포트
import './NodeEditor.css';

const initialNodes = [];
const initialEdges = [];

// 커스텀 노드 타입 등록
const nodeTypes = {
    positionNode: PositionNode,
};

let id = 0;
const getId = () => `node_${id++}`;

const NodeEditor = () => {
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    // 노드 드래그가 끝났을 때 position 값 업데이트
    const onNodeDragStop = useCallback((event, node) => {
        setNodes((nds) =>
            nds.map((n) => {
                if (n.id === node.id) {
                    // 노드의 현재 position 값을 xPos, yPos로 전달
                    return {
                        ...n,
                        xPos: node.position.x,
                        yPos: node.position.y,
                    };
                }
                return n;
            })
        );
    }, [setNodes]);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
            const type = event.dataTransfer.getData('application/reactflow');

            // 노드 타입 유효성 체크
            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowInstance.project({
                x: event.clientX - reactFlowBounds.left,
                y: event.clientY - reactFlowBounds.top,
            });

            // 새 노드 생성 시 position 값을 xPos, yPos로도 설정
            const newNode = {
                id: getId(),
                type,
                position,
                xPos: position.x, // 초기 x 좌표 저장
                yPos: position.y, // 초기 y 좌표 저장
                data: { label: `${type === 'positionNode' ? 'Position' : type} 노드` },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes]
    );

    return (
        <div className="node-editor">
            <NodePalette />
            <ReactFlowProvider>
                <div className="reactflow-wrapper" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeDragStop={onNodeDragStop} // 노드 드래그 완료 이벤트 핸들러 추가
                        nodeTypes={nodeTypes} // 커스텀 노드 타입
                        defaultEdgeOptions={{ type: 'smoothstep' }}
                        connectionLineType='smoothstep'
                        fitView
                    >
                        <Controls />
                    </ReactFlow>
                </div>
            </ReactFlowProvider>
        </div>
    );
};

export default NodeEditor;