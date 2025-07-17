import { types, type Instance } from 'mobx-state-tree';

export interface MapControlCommand {
  action: string;
  value?: string;
  data?: any;
}

export const MapStore = types
  .model('MapStore', {
    // Current map view state
    // 37°47'21"N 122°23'52"W
    longitude: types.optional(types.number, -87.6319),
    latitude: types.optional(types.number, 41.883415),
    zoom: types.optional(types.number, 14.5),
    bearing: types.optional(types.number, 15.165878375019094),
    pitch: types.optional(types.number, 45),
    // Map control state
    isControlActive: types.optional(types.boolean, false),
  })
  .volatile(self => ({
    // Store pending map commands from AI
    pendingCommands: [] as MapControlCommand[],
    // 41.88341413374059-87.630091075785714.57273962016686450
    mapState: {
      latitude: self.latitude,
      longitude: self.longitude,
      zoom: self.zoom,
      bearing: self.bearing,
      pitch: self.pitch,
    } as any,
  }))
  .actions(self => ({
    // Update map view state
    setMapView(longitude: number, latitude: number, zoom: number) {
      console.log(latitude, longitude, zoom, self.mapState.pitch, self.mapState.bearing);
      self.longitude = longitude;
      self.latitude = latitude;
      self.zoom = zoom;

      // Also update the mapState object to keep it in sync
      self.mapState = {
        ...self.mapState,
        longitude,
        latitude,
        zoom,
      };
    },

    // Handle map control commands from AI
    executeMapCommand(command: MapControlCommand) {
      console.log('[DEBUG_LOG] Executing map command:', command);

      switch (command.action) {
        case 'zoom_to': {
          if (command.data?.target) {
            // For now, we'll implement a simple zoom behavior
            // In a real implementation, this could parse coordinates or location names
            const zoomLevel = 10; // Default zoom level for zoom_to commands
            self.zoom = zoomLevel;
            console.log('[DEBUG_LOG] Zoomed to level:', zoomLevel);
          }
          break;
        }

        case 'add_point': {
          if (command.data?.pointId) {
            console.log('[DEBUG_LOG] Adding point:', command.data.pointId);
            // Point addition logic would go here
          }
          break;
        }

        case 'add_dataset':
        case 'remove_dataset': {
          if (command.data?.datasetId) {
            console.log('[DEBUG_LOG] Dataset operation:', command.action, command.data.datasetId);
            // Dataset management logic would go here
          }
          break;
        }

        case 'search_datasets': {
          console.log('[DEBUG_LOG] Searching datasets:', command.data?.searchTerm);
          // Dataset search logic would go here
          break;
        }

        default:
          console.warn('[DEBUG_LOG] Unknown map command:', command.action);
      }

      self.isControlActive = true;

      // Clear the command after a short delay
      setTimeout(() => {
        self.isControlActive = false;
      }, 1000);
    },

    // Add a command to the pending queue
    addPendingCommand(command: MapControlCommand) {
      self.pendingCommands.push(command);
    },

    // Process all pending commands
    processPendingCommands() {
      while (self.pendingCommands.length > 0) {
        const command = self.pendingCommands.shift();
        if (command) {
          this.executeMapCommand(command);
        }
      }
    },

    // Clear all pending commands
    clearPendingCommands() {
      self.pendingCommands.splice(0);
    },
  }));

export type IMapStore = Instance<typeof MapStore>;
