import { create } from 'zustand';

const initialNodes = [ /* ... */ ];
const initialEdges = [];

const useFlowStore = create((set, get) => ({
    past: [],
    present: { nodes: initialNodes, edges: initialEdges },
    future: [],
    selectedNodeId: null,
    canUndo: false,
    canRedo: false,

    set: (nodes, edges = false) => {

        const { past, present} = get();
            set({
                past: [...past, present],
                present: { nodes, edges },
                future: [],
                canUndo: true,
                canRedo: false,
            });

    },
    undo: () => {
        const { past, present, future } = get();
        if (past.length === 0) return;
        const previous = past[past.length - 1];
        const newPast = past.slice(0, -1);
        set({
            past: newPast,
            present: previous,
            future: [present, ...future],
            canUndo: newPast.length > 0,
            canRedo: true,

        });
    },
    redo: () => {
        const { past, present, future } = get();
        if (future.length === 0) return;
        const next = future[0];
        const newFuture = future.slice(1);
        set({
            past: [...past, present],
            present: next,
            future: newFuture,
            canUndo: true,
            canRedo: newFuture.length > 0,
        });
    },
    addNode: () => {
        const { present, set } = get();
        const newNode = {
            id: `${+new Date()}`,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            data: { label: '새 노드' },
            type: 'default',
        };
        set([...present.nodes, newNode], present.edges);
    },
    dropNode: (type, position) => {
        const { present, set } = get();
        const newNode = {
            id: `${+new Date()}`,
            type,
            position,
            xPos: position.x,
            yPos: position.y,
            data: { label: type === 'positionNode' ? 'Position' : type, type: 'SNGLVOL' },
        };
        set([...present.nodes, newNode], present.edges);
    },
    deleteSelectedNode: () => {
        const state = get();
        const { present, selectedNodeId } = state;
        if (!selectedNodeId) return;
        const nodes = present.nodes.filter((n) => n.id !== selectedNodeId);
        const edges = present.edges.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId);
        state.set(nodes, edges);
        set({ selectedNodeId: null });
    },
    setSelectedNodeId: (id) => set({ selectedNodeId: id }),
}));

export default useFlowStore;