<template>
  <path
      :d="path"
      fill="none"
      stroke="#fff"
      stroke-width="2"
      class="opacity-80"
  />
</template>

<script>
import { computed } from 'vue'
import { pathToString } from 'svg-path-commander'

export default {
  props: {
    nodes: {
      type: Array,
      required: true
    },
    connection: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const path = computed(() => {
      const startNode = props.nodes.find(n => n.id === props.connection.fromNode)
      const endNode = props.nodes.find(n => n.id === props.connection.to)

      if (!startNode || !endNode) return ''

      const start = { x: startNode.x + 60, y: startNode.y + 50 }  // Adjusted to node edge
      const end = { x: endNode.x + 60, y: endNode.y + 50 }        // Adjusted to node edge

      return pathToString([
        ['M', start.x, start.y],
        ['C', start.x + 100, start.y, end.x - 100, end.y, end.x, end.y]
      ])
    })

    return { path }
  }
}
</script>