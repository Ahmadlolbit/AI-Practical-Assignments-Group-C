
Write a code for me that does these requirements in vue.js and tailwind, with a backend of python (FastAPI), I want there to be a beautiful compact website with a grid then an add button to it, after that you have a button to go into connecting mode where you make connections between each one of the Nodes and assign a weight to it, I want it to be darker theme and have multiple colourse for each node based on the weight of the nodes:

A* path finder ( Euclidean distance )
Find the path from (S) to (G) using A* algorithm associated with (Euclidean
distance) algorithm, the app should display the initial board
user can add nodes (their coordinates and their connections )
the board shows the nodes ( S, A, C …etc ) and their cost which (Euclidean
distance) is used to find the cost of each node
after finding the path open another windows and show the solution paths in
order as shown in the lectures
Requirements:
• Initial board is grid based UI
• Main Logic: no libraries is allowed
• Use the (Euclidean distance) to find each nodes cost
• show the solution paths in order

I'll create a Vue.js application with Tailwind CSS for the frontend and FastAPI for the backend to implement an A* pathfinding algorithm with Euclidean distance. The application will have a grid-based UI with functionality to add nodes, create connections between them, and visualize the A* algorithm's solution path.


Vue.js Frontend with Tailwind CSS
Code

FastAPI Backend
Code

Remove the already set nodes in the UI and make the connecting easier because when I click the two nodes it doesn't quit the connecting mode. I want it to quit it. And make the UI More Mono and less colourful. Just the nodes and edges should coloured.

I also would like to make each Node have a certain weight to visit as well and I want you to write the entire front end and back again considering these changes.

I'll revise the code to remove the preset nodes, improve the connection workflow by automatically exiting connection mode after connecting two nodes, simplify the UI with a more monochromatic design, and add the ability to assign visit weights to each node. Here's the updated implementation:


Vue.js Frontend with Monochromatic UI
Code

Updated FastAPI Backend
Code



<template>
  <div class="min-h-screen bg-gray-900 text-gray-100 p-4">
    <header class="mb-6">
      <h1 class="text-2xl font-bold text-white">A* Pathfinder</h1>
      <p class="text-gray-400">Using Euclidean Distance Heuristic</p>
    </header>

    <div class="flex flex-col lg:flex-row gap-6">
      <!-- Grid Panel -->
      <div class="bg-gray-800 p-4 rounded-lg shadow-lg flex-1">
        <div class="flex justify-between mb-4">
          <h2 class="text-lg font-semibold text-white">Grid</h2>
          <div class="flex gap-2">
            <button
                @click="toggleAddNodeMode"
                class="px-3 py-1 rounded-md"
                :class="addNodeMode ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
            >
              {{ addNodeMode ? 'Adding Node' : 'Add Node' }}
            </button>
            <button
                @click="toggleConnectionMode"
                class="px-3 py-1 rounded-md"
                :class="connectionMode ? 'bg-gray-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'"
                :disabled="nodes.length < 2"
            >
              {{ connectionMode ? 'Connecting Nodes' : 'Connect Nodes' }}
            </button>
            <button
                @click="findPath"
                class="px-3 py-1 rounded-md bg-gray-600 hover:bg-gray-700 text-white"
                :disabled="!startNode || !goalNode || nodes.length < 2"
            >
              Find Path
            </button>
          </div>
        </div>

        <!-- Grid Canvas -->
        <div
            class="w-full h-96 bg-gray-900 border border-gray-700 rounded-md relative overflow-hidden"
            ref="gridCanvas"
            @click="handleGridClick"
            @mousemove="handleMouseMove"
        >
          <!-- Connection lines -->
          <svg class="absolute inset-0 w-full h-full pointer-events-none">
            <line
                v-for="connection in connections"
                :key="`${connection.from}-${connection.to}`"
                :x1="nodes[connection.from].x"
                :y1="nodes[connection.from].y"
                :x2="nodes[connection.to].x"
                :y2="nodes[connection.to].y"
                :stroke="getConnectionColor(connection.weight)"
                stroke-width="2"
                :stroke-dasharray="connection.temp ? '5,5' : ''"
            />
            <line
                v-if="tempConnection.active"
                :x1="tempConnection.fromX"
                :y1="tempConnection.fromY"
                :x2="tempConnection.toX"
                :y2="tempConnection.toY"
                stroke="#4b5563"
                stroke-width="2"
                stroke-dasharray="5,5"
            />
            <!-- Path lines if solution exists -->
            <line
                v-for="(edge, index) in solutionPath"
                :key="`path-${index}`"
                :x1="nodes[edge.from].x"
                :y1="nodes[edge.from].y"
                :x2="nodes[edge.to].x"
                :y2="nodes[edge.to].y"
                stroke="#10b981"
                stroke-width="4"
            />
          </svg>

          <!-- Nodes -->
          <div
              v-for="(node, index) in nodes"
              :key="index"
              class="absolute rounded-full flex items-center justify-center font-bold border-2 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
              :class="getNodeClasses(index)"
              :style="{
              left: `${node.x}px`, 
              top: `${node.y}px`,
              width: '40px',
              height: '40px'
            }"
              @click.stop="handleNodeClick(index)"
          >
            {{ node.label }}
          </div>

          <!-- Connection weights -->
          <div
              v-for="connection in connections"
              :key="`weight-${connection.from}-${connection.to}`"
              class="absolute bg-gray-800 px-2 py-1 rounded-sm text-xs text-white"
              :style="{
              left: `${(nodes[connection.from].x + nodes[connection.to].x) / 2}px`,
              top: `${(nodes[connection.from].y + nodes[connection.to].y) / 2}px`,
              transform: 'translate(-50%, -50%)'
            }"
          >
            {{ Math.round(connection.weight * 100) / 100 }}
          </div>
        </div>
      </div>

      <!-- Controls & Info Panel -->
      <div class="bg-gray-800 p-4 rounded-lg shadow-lg w-full lg:w-80">
        <h2 class="text-lg font-semibold text-white mb-4">Node Controls</h2>

        <div v-if="selectedNode !== null" class="mb-6">
          <h3 class="text-lg text-white mb-2">Selected Node: {{ nodes[selectedNode].label }}</h3>

          <div class="grid grid-cols-2 gap-2 mb-4">
            <div class="form-group">
              <label class="block text-sm text-gray-400">Label</label>
              <input
                  v-model="nodes[selectedNode].label"
                  class="w-full bg-gray-700 border border-gray-600 rounded p-1 text-white"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm text-gray-400">Type</label>
              <select
                  v-model="nodes[selectedNode].type"
                  class="w-full bg-gray-700 border border-gray-600 rounded p-1 text-white"
              >
                <option value="normal">Normal</option>
                <option value="start">Start (S)</option>
                <option value="goal">Goal (G)</option>
              </select>
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm text-gray-400">Visit Weight</label>
            <input
                v-model.number="nodes[selectedNode].visitWeight"
                type="number"
                min="0"
                step="1"
                class="w-full bg-gray-700 border border-gray-600 rounded p-1 text-white"
                placeholder="Cost to visit this node"
            />
            <p class="text-xs text-gray-500 mt-1">Additional cost when passing through this node</p>
          </div>

          <div class="flex justify-end">
            <button
                @click="deleteNode(selectedNode)"
                class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
            >
              Delete Node
            </button>
          </div>
        </div>

        <div v-if="connectionMode && selectedNode !== null" class="mb-6">
          <h3 class="text-lg text-white mb-2">Connect From {{ nodes[selectedNode].label }}</h3>
          <p class="text-sm text-gray-400">Click on another node to create a connection</p>
        </div>

        <div v-if="newConnectionModal.show" class="mb-6 p-3 bg-gray-700 rounded-md">
          <h3 class="text-lg text-white mb-2">Connection Weight</h3>
          <p class="text-sm mb-2">
            {{ nodes[newConnectionModal.from].label }} to {{ nodes[newConnectionModal.to].label }}
          </p>
          <p class="text-sm text-gray-400 mb-2">
            Euclidean distance: {{ Math.round(newConnectionModal.euclideanDistance * 100) / 100 }}
          </p>
          <div class="flex items-center gap-2">
            <input
                v-model.number="newConnectionModal.weight"
                type="number"
                step="0.1"
                class="w-full bg-gray-800 border border-gray-600 rounded p-1 text-white"
            />
            <button
                @click="confirmConnection"
                class="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
            >
              Save
            </button>
          </div>
        </div>

        <div class="mb-4">
          <h3 class="text-lg text-white mb-2">Algorithm Info</h3>
          <p class="text-sm text-gray-300">
            A* algorithm finds the shortest path from start to goal using a heuristic (Euclidean distance)
            to estimate the cost to reach the goal.
          </p>
        </div>

        <div v-if="solutionPath.length > 0">
          <h3 class="text-lg text-white mb-2">Solution Path</h3>
          <div class="bg-gray-700 p-2 rounded-md">
            <div class="flex flex-wrap gap-2">
              <span
                  v-for="(step, index) in solutionSteps"
                  :key="index"
                  class="text-white"
              >
                {{ step }}{{ index < solutionSteps.length - 1 ? ' → ' : '' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Solution Modal -->
    <div v-if="showSolutionModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 class="text-2xl font-bold text-white mb-4">A* Path Solution</h2>

        <div class="mb-6">
          <h3 class="text-lg font-semibold text-white mb-2">Path Found:</h3>
          <div class="bg-gray-700 p-3 rounded-md text-lg">
            <div class="flex flex-wrap gap-2">
              <span
                  v-for="(step, index) in solutionSteps"
                  :key="index"
                  class="text-white"
              >
                {{ step }}{{ index < solutionSteps.length - 1 ? ' → ' : '' }}
              </span>
            </div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="text-lg font-semibold text-white mb-2">Algorithm Steps:</h3>
          <div class="bg-gray-700 p-3 rounded-md">
            <div v-for="(step, index) in algorithmSteps" :key="index" class="mb-2 last:mb-0">
              <p class="text-gray-200">{{ step }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end">
          <button
              @click="showSolutionModal = false"
              class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      nodes: [],
      connections: [],
      selectedNode: null,
      addNodeMode: false,
      connectionMode: false,
      nextNodeId: 1,
      tempConnection: {
        active: false,
        fromX: 0,
        fromY: 0,
        toX: 0,
        toY: 0,
      },
      newConnectionModal: {
        show: false,
        from: null,
        to: null,
        weight: 0,
        euclideanDistance: 0,
      },
      solutionPath: [],
      solutionSteps: [],
      algorithmSteps: [],
      showSolutionModal: false,
    };
  },
  computed: {
    startNode() {
      return this.nodes.findIndex(node => node.type === 'start');
    },
    goalNode() {
      return this.nodes.findIndex(node => node.type === 'goal');
    }
  },
  methods: {
    toggleAddNodeMode() {
      this.addNodeMode = !this.addNodeMode;
      if (this.addNodeMode) {
        this.connectionMode = false;
        this.selectedNode = null;
      }
    },

    toggleConnectionMode() {
      this.connectionMode = !this.connectionMode;
      if (this.connectionMode) {
        this.addNodeMode = false;
      } else {
        this.selectedNode = null;
      }
    },

    handleGridClick(event) {
      if (this.addNodeMode) {
        const rect = this.$refs.gridCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        this.addNode(x, y);
      }
    },

    handleMouseMove(event) {
      if (this.connectionMode && this.selectedNode !== null) {
        const rect = this.$refs.gridCanvas.getBoundingClientRect();
        this.tempConnection = {
          active: true,
          fromX: this.nodes[this.selectedNode].x,
          fromY: this.nodes[this.selectedNode].y,
          toX: event.clientX - rect.left,
          toY: event.clientY - rect.top,
        };
      }
    },

    addNode(x, y) {
      // Generate a label based on the next available letter or number
      const label = String.fromCharCode(65 + (this.nextNodeId - 1) % 26);

      this.nodes.push({
        x,
        y,
        label,
        type: 'normal',
        visitWeight: 0,
        f: 0,
        g: 0,
        h: 0
      });

      this.nextNodeId++;
    },

    handleNodeClick(nodeIndex) {
      if (this.connectionMode && this.selectedNode !== null && this.selectedNode !== nodeIndex) {
        // Creating a connection between nodes
        this.createConnection(this.selectedNode, nodeIndex);
        return;
      }

      this.selectedNode = nodeIndex;
      this.tempConnection.active = false;
    },

    createConnection(fromIndex, toIndex) {
      // Check if connection already exists
      const existingConnection = this.connections.find(conn =>
          (conn.from === fromIndex && conn.to === toIndex) ||
          (conn.from === toIndex && conn.to === fromIndex)
      );

      if (existingConnection) {
        alert('Connection already exists between these nodes');
        return;
      }

      const distance = this.calculateEuclideanDistance(this.nodes[fromIndex], this.nodes[toIndex]);

      this.newConnectionModal = {
        show: true,
        from: fromIndex,
        to: toIndex,
        weight: distance,
        euclideanDistance: distance
      };
    },

    confirmConnection() {
      this.connections.push({
        from: this.newConnectionModal.from,
        to: this.newConnectionModal.to,
        weight: this.newConnectionModal.weight
      });

      this.newConnectionModal.show = false;

      // Exit connection mode after creating a connection
      this.connectionMode = false;
      this.selectedNode = null;
      this.tempConnection.active = false;
    },

    deleteNode(index) {
      // Remove all connections involving this node
      this.connections = this.connections.filter(conn =>
          conn.from !== index && conn.to !== index
      );

      // Remove the node
      this.nodes.splice(index, 1);

      // Update connection indices for nodes that came after the deleted node
      this.connections = this.connections.map(conn => {
        return {
          from: conn.from > index ? conn.from - 1 : conn.from,
          to: conn.to > index ? conn.to - 1 : conn.to,
          weight: conn.weight
        };
      });

      this.selectedNode = null;
    },

    calculateEuclideanDistance(node1, node2) {
      const dx = node2.x - node1.x;
      const dy = node2.y - node1.y;
      return Math.sqrt(dx * dx + dy * dy) / 40; // Scale down for better visualization
    },

    getNodeClasses(index) {
      const node = this.nodes[index];
      const isSelected = this.selectedNode === index;
      const inPath = this.solutionPath.some(edge =>
          (edge.from === index || edge.to === index)
      );

      const baseClasses = "border-gray-600";

      if (node.type === 'start') {
        return `${baseClasses} bg-green-500 text-white ${isSelected ? 'ring-2 ring-white' : ''}`;
      } else if (node.type === 'goal') {
        return `${baseClasses} bg-red-500 text-white ${isSelected ? 'ring-2 ring-white' : ''}`;
      } else if (inPath) {
        return `${baseClasses} bg-teal-500 text-white ${isSelected ? 'ring-2 ring-white' : ''}`;
      } else {
        // Use grayscale with opacity based on visit weight
        const weightClass = this.getNodeWeightClass(node.visitWeight);
        return `${baseClasses} ${weightClass} text-white ${isSelected ? 'ring-2 ring-white' : ''}`;
      }
    },

    getNodeWeightClass(weight) {
      if (weight === 0) return 'bg-gray-500';
      if (weight <= 5) return 'bg-gray-600';
      if (weight <= 10) return 'bg-gray-700';
      return 'bg-gray-800';
    },

    getConnectionColor(weight) {
      // Simple grayscale color scale for connections
      if (weight <= 2) return '#d1d5db'; // gray-300
      if (weight <= 5) return '#9ca3af'; // gray-400
      if (weight <= 10) return '#6b7280'; // gray-500
      return '#4b5563'; // gray-600
    },

    findPath() {
      if (this.startNode === -1 || this.goalNode === -1) {
        alert('Please set start and goal nodes');
        return;
      }

      // Reset previous solution
      this.solutionPath = [];
      this.solutionSteps = [];
      this.algorithmSteps = [];

      // Send the data to the backend for A* processing
      this.runAStarAlgorithm();
    },

    runAStarAlgorithm() {
      // Implementing A* algorithm directly in frontend
      // In a real application, you'd make an API call to the backend

      // Reset all nodes' values
      this.nodes.forEach(node => {
        node.f = 0;
        node.g = Infinity;
        node.h = 0;
        node.parent = null;
      });

      // Set up start node
      this.nodes[this.startNode].g = 0;
      this.nodes[this.startNode].h = this.calculateEuclideanDistance(
          this.nodes[this.startNode],
          this.nodes[this.goalNode]
      );
      this.nodes[this.startNode].f = this.nodes[this.startNode].h;

      const openSet = [this.startNode];
      const closedSet = [];

      this.algorithmSteps.push(`Starting A* search from ${this.nodes[this.startNode].label} to ${this.nodes[this.goalNode].label}`);

      while (openSet.length > 0) {
        // Find node with lowest f score in open set
        let lowestIndex = 0;
        for (let i = 0; i < openSet.length; i++) {
          if (this.nodes[openSet[i]].f < this.nodes[openSet[lowestIndex]].f) {
            lowestIndex = i;
          }
        }

        const current = openSet[lowestIndex];

        // Check if we reached the goal
        if (current === this.goalNode) {
          this.algorithmSteps.push(`Goal found! Reconstructing path...`);
          this.reconstructPath();
          this.showSolutionModal = true;
          return;
        }

        // Remove current from open set and add to closed set
        openSet.splice(lowestIndex, 1);
        closedSet.push(current);

        this.algorithmSteps.push(`Examining node ${this.nodes[current].label} (f=${Math.round(this.nodes[current].f * 100) / 100})`);

        // Get all neighbors of current node
        const neighbors = this.getNeighbors(current);

        for (const neighbor of neighbors) {
          // Skip if neighbor is in closed set
          if (closedSet.includes(neighbor.index)) {
            continue;
          }

          // Calculate tentative g score (including the visit weight of the neighbor node)
          const tentativeG = this.nodes[current].g + neighbor.weight + this.nodes[neighbor.index].visitWeight;

          // Check if we need to add neighbor to open set
          const isNew = !openSet.includes(neighbor.index);

          if (isNew || tentativeG < this.nodes[neighbor.index].g) {
            // Update neighbor values
            this.nodes[neighbor.index].parent = current;
            this.nodes[neighbor.index].g = tentativeG;
            this.nodes[neighbor.index].h = this.calculateEuclideanDistance(
                this.nodes[neighbor.index],
                this.nodes[this.goalNode]
            );
            this.nodes[neighbor.index].f = this.nodes[neighbor.index].g + this.nodes[neighbor.index].h;

            this.algorithmSteps.push(
                `Updated node ${this.nodes[neighbor.index].label}: g=${Math.round(this.nodes[neighbor.index].g * 100) / 100}, ` +
                `h=${Math.round(this.nodes[neighbor.index].h * 100) / 100}, ` +
                `f=${Math.round(this.nodes[neighbor.index].f * 100) / 100}` +
                (this.nodes[neighbor.index].visitWeight > 0 ? ` (includes visit weight: ${this.nodes[neighbor.index].visitWeight})` : '')
            );

            if (isNew) {
              openSet.push(neighbor.index);
              this.algorithmSteps.push(`Added ${this.nodes[neighbor.index].label} to open set`);
            }
          }
        }
      }

      this.algorithmSteps.push("No path found!");
      this.showSolutionModal = true;
    },

    getNeighbors(nodeIndex) {
      const neighbors = [];

      // Find all connections involving this node
      this.connections.forEach(conn => {
        if (conn.from === nodeIndex) {
          neighbors.push({
            index: conn.to,
            weight: conn.weight
          });
        } else if (conn.to === nodeIndex) {
          neighbors.push({
            index: conn.from,
            weight: conn.weight
          });
        }
      });

      return neighbors;
    },

    reconstructPath() {
      let current = this.goalNode;
      const path = [];
      const steps = [this.nodes[this.goalNode].label];

      while (current !== this.startNode) {
        const parent = this.nodes[current].parent;
        path.push({ from: parent, to: current });
        steps.unshift(this.nodes[parent].label);
        current = parent;
      }

      this.solutionPath = path;
      this.solutionSteps = steps;

      this.algorithmSteps.push(`Path found: ${steps.join(' → ')}`);
      this.algorithmSteps.push(`Total cost: ${Math.round(this.nodes[this.goalNode].g * 100) / 100}`);
    }
  }
};
</script>
