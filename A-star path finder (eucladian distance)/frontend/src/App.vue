<template>
  <div class="p-4 h-screen bg-gray-900">
    <div class="mb-4 flex gap-2">
      <button
          @click="addNode"
          class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
      >
        Add Node
      </button>
      <button
          @click="sendToBackend"
          class="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
      >
        Save Graph
      </button>
    </div>

    <NodesContainer
        :nodes="nodes"
        :connections="connections"
        @node-selected="handleNodeSelected"
        @node-updated="updateNodePosition"
    />
  </div>
</template>

<script>
import {ref} from 'vue'
import NodesContainer from './components/NodesContainer.vue'
import connection from "./components/Connection.vue";

export default {
  components: {NodesContainer},
  setup() {
    const nodes = ref([])
    const connections = ref([])
    const selectedNode = ref(null)
    let nodeId = 1

    const addNode = () => {
      nodes.value.push({
        id: nodeId++,
        x: Math.random() * 500,
        y: Math.random() * 300,
        letter: '',
        cost: 0
      })
    }

    const updateNodePosition = (id, x, y) => {
      const node = nodes.value.find(n => n.id === id)
      if (node) {
        node.x = x
        node.y = y
      }
    }

    const handleNodeSelected = (nodeId) => {
      if (!selectedNode.value) {
        selectedNode.value = nodeId
      } else {
        if (selectedNode.value !== nodeId) {
          connections.value.push({
            fromNode: selectedNode.value,
            to: nodeId
          })
        }
        selectedNode.value = null
      }
    }

    const sendToBackend = async () => {
        const payload = {
          nodes: nodes.value.map(node => ({
            id: Number(node.id),
            x: Number(node.x),
            y: Number(node.y),
            letter: String(node.letter),
            cost: Number(node.cost)
          })),
          connections: connections.value.map(conn => ({
            fromNode: Number(conn.fromNode),
            to: Number(conn.to)
          }))
        };

        console.log('Sending payload:', JSON.stringify(payload, null, 2));

        const response = await fetch('http://localhost:8000/save-graph', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(payload)
        });
        return await response.json();
    };
    return {
      nodes,
      connections,
      addNode,
      updateNodePosition,
      handleNodeSelected,
      sendToBackend
    }
  }
}
</script>