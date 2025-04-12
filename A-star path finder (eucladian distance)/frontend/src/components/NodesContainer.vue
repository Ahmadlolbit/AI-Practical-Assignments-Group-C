<template>
  <div class="relative w-full h-[600px] bg-gray-800 rounded-lg shadow-xl overflow-hidden">
    <div
        class="absolute inset-0 bg-grid-gray-700"
        style="backgroundSize: '20px 20px'"
    ></div>

    <svg class="absolute inset-0 w-full h-full z-0">
      <Connection
          v-for="(conn, index) in connections"
          :key="index"
          :nodes="nodes"
          :connection="conn"
      />
    </svg>

    <NodeComponent
        v-for="node in nodes"
        :key="node.id"
        :node="node"
        @selected="$emit('node-selected', node.id)"
        @update:position="$emit('node-updated', node.id, $event.x, $event.y)"
    />
  </div>
</template>

<script>
import NodeComponent from './NodeComponent.vue'
import Connection from './Connection.vue'

export default {
  components: { NodeComponent, Connection },
  props: {
    nodes: {
      type: Array,
      required: true
    },
    connections: {
      type: Array,
      required: true
    }
  },
  emits: ['node-selected', 'node-updated']
}
</script>

<style>
.bg-grid-gray-700 {
  background-image: linear-gradient(to right, #374151 1px, transparent 1px),
  linear-gradient(to bottom, #374151 1px, transparent 1px);
}
</style>