import { useState } from 'react';

interface Node {
    x: number;
    y: number;
}

interface PathStep {
    node: string;
    coordinates: [number, number];
    g_cost: number;
    h_cost: number;
}

interface PathResult {
    path: string[];
    costs: PathStep[];
}

export default function PathFinder() {
    const [nodes, setNodes] = useState<Record<string, Node>>({});
    const [edges, setEdges] = useState<Array<{ node1: string; node2: string }>>([]);
    const [newNodeId, setNewNodeId] = useState('');
    const [newNodeX, setNewNodeX] = useState(0);
    const [newNodeY, setNewNodeY] = useState(0);
    const [edgeNode1, setEdgeNode1] = useState('');
    const [edgeNode2, setEdgeNode2] = useState('');
    const [startId, setStartId] = useState('');
    const [goalId, setGoalId] = useState('');
    const [pathResult, setPathResult] = useState<PathResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleAddNode = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch(`/nodes/?node_id=${encodeURIComponent(newNodeId)}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ x: newNodeX, y: newNodeY }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to add node');

            setNodes(prev => ({ ...prev, [newNodeId]: { x: newNodeX, y: newNodeY } }));
            setNewNodeId('');
            setNewNodeX(0);
            setNewNodeY(0);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddEdge = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
            const response = await fetch('/edges/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ node1: edgeNode1, node2: edgeNode2 }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.detail || 'Failed to add edge');

            setEdges(prev => [...prev, { node1: edgeNode1, node2: edgeNode2 }]);
            setEdgeNode1('');
            setEdgeNode2('');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleCalculatePath = async () => {
        setError(null);
        if (!startId || !goalId) {
            setError('Please select both start and goal nodes');
            return;
        }

        try {
            const response = await fetch(`/path/${encodeURIComponent(startId)}/${encodeURIComponent(goalId)}`);
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to calculate path');

            setPathResult(data);
        } catch (err) {
            setError(err.message);
            setPathResult(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                {error && (
                    <div className="p-4 bg-red-100 text-red-700 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Add Node Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Add Node</h2>
                    <form onSubmit={handleAddNode} className="space-y-4">
                        <div className="flex gap-4">
                            <input
                                type="text"
                                value={newNodeId}
                                onChange={(e) => setNewNodeId(e.target.value)}
                                placeholder="Node ID"
                                className="flex-1 p-2 border rounded"
                                required
                            />
                            <input
                                type="number"
                                value={newNodeX}
                                onChange={(e) => setNewNodeX(Number(e.target.value))}
                                placeholder="X coordinate"
                                className="flex-1 p-2 border rounded"
                                required
                            />
                            <input
                                type="number"
                                value={newNodeY}
                                onChange={(e) => setNewNodeY(Number(e.target.value))}
                                placeholder="Y coordinate"
                                className="flex-1 p-2 border rounded"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Add Node
                        </button>
                    </form>
                </div>

                {/* Add Edge Form */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Add Edge</h2>
                    <form onSubmit={handleAddEdge} className="space-y-4">
                        <div className="flex gap-4">
                            <select
                                value={edgeNode1}
                                onChange={(e) => setEdgeNode1(e.target.value)}
                                className="flex-1 p-2 border rounded"
                                required
                            >
                                <option value="">Select From Node</option>
                                {Object.keys(nodes).map(id => (
                                    <option key={id} value={id}>{id}</option>
                                ))}
                            </select>
                            <select
                                value={edgeNode2}
                                onChange={(e) => setEdgeNode2(e.target.value)}
                                className="flex-1 p-2 border rounded"
                                required
                            >
                                <option value="">Select To Node</option>
                                {Object.keys(nodes).map(id => (
                                    <option key={id} value={id}>{id}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="submit"
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            Add Edge
                        </button>
                    </form>
                </div>

                {/* Calculate Path Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Calculate Path</h2>
                    <div className="flex gap-4 mb-4">
                        <select
                            value={startId}
                            onChange={(e) => setStartId(e.target.value)}
                            className="flex-1 p-2 border rounded"
                        >
                            <option value="">Select Start Node</option>
                            {Object.keys(nodes).map(id => (
                                <option key={id} value={id}>{id}</option>
                            ))}
                        </select>
                        <select
                            value={goalId}
                            onChange={(e) => setGoalId(e.target.value)}
                            className="flex-1 p-2 border rounded"
                        >
                            <option value="">Select Goal Node</option>
                            {Object.keys(nodes).map(id => (
                                <option key={id} value={id}>{id}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleCalculatePath}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    >
                        Find Path
                    </button>
                </div>

                {/* Path Result */}
                {pathResult && (
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-4">Path Result</h2>
                        <p className="mb-4">
                            Path: <span className="font-medium">{pathResult.path.join(' → ')}</span>
                        </p>
                        <table className="w-full border-collapse">
                            <thead>
                            <tr className="bg-gray-50">
                                <th className="border p-2">Node</th>
                                <th className="border p-2">Coordinates</th>
                                <th className="border p-2">G Cost (Actual)</th>
                                <th className="border p-2">H Cost (Heuristic)</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pathResult.costs.map((step) => (
                                <tr key={step.node} className="hover:bg-gray-50">
                                    <td className="border p-2">{step.node}</td>
                                    <td className="border p-2">({step.coordinates[0]}, {step.coordinates[1]})</td>
                                    <td className="border p-2">{step.g_cost.toFixed(2)}</td>
                                    <td className="border p-2">{step.h_cost.toFixed(2)}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}