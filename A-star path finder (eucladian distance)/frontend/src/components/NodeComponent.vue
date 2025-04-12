<template>
  <div
      class="absolute w-[120px] rounded-lg shadow-xl p-4 cursor-move border-2 transition-all z-10"
      :class="[valueColorClass, selected ? 'ring-2 ring-white' : '']"
      :style="{ left: `${node.x}px`, top: `${node.y}px` }"
      @click.stop="handleClick"
      ref="nodeElement"
  >
    <div class="flex flex-col items-center space-y-2">
      <input
          v-model="node.letter"
          type="text"
          class="w-full text-lg text-center bg-transparent text-white placeholder-gray-400 focus:outline-none pb-1 border-b border-gray-500"
          placeholder="Label"
          @click.stop
          maxlength="1"
      />
      <input
          v-model.number="node.cost"
          type="number"
          class="w-full text-base text-center bg-transparent text-gray-300 focus:outline-none"
          placeholder="Cost"
          @click.stop
          min="0"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import interact from 'interactjs'

export default {
  props: {
    node: {
      type: Object,
      required: true
    }
  },
  emits: ['selected', 'update:position'],
  setup(props, { emit }) {
    const nodeElement = ref(null)
    const selected = ref(false)

    const valueColorClass = computed(() => {
      if (props.node.letter === 'S') return 'border-green-500 bg-green-500/10'
      if (props.node.letter === 'G') return 'border-red-500 bg-red-500/10'
      return 'border-blue-500 bg-blue-500/10'
    })

    onMounted(() => {
      interact(nodeElement.value).draggable({
        listeners: {
          move(event) {
            const { dx, dy } = event
            const newX = props.node.x + dx
            const newY = props.node.y + dy
            emit('update:position', { x: newX, y: newY })
          }
        }
      })
    })

    const handleClick = () => {
      selected.value = !selected.value
      emit('selected', props.node.id)
    }

    return {
      nodeElement,
      selected,
      valueColorClass,
      handleClick
    }
  }
}
</script>