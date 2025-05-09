import React from 'react';
import './NodePalette.css';

const nodeTypes = [
    { type: 'input', label: '입력 노드' },
    { type: 'default', label: '기본 노드' },
    { type: 'output', label: '출력 노드' },
    { type: 'positionNode', label: '위치 표시 노드' }, // 새로운 노드 타입 추가
];

const NodePalette = () => {
    const onDragStart = (event, nodeType) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="node-palette">
            <div className="palette-header">노드 팔레트</div>
            <div className="palette-nodes">
                {nodeTypes.map((node) => (
                    <div
                        key={node.type}
                        className="palette-node"
                        draggable
                        onDragStart={(event) => onDragStart(event, node.type)}
                    >
                        {node.label}
                    </div>
                ))}
            </div>
        </aside>
    );
};

export default NodePalette;