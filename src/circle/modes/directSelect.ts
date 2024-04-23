import MapboxDraw from "@mapbox/mapbox-gl-draw";
import { DrawCustomModeThis, MapMouseEvent } from "@mapbox/mapbox-gl-draw";
import { DirectModeSelect } from "../../types";
import { Feature } from "geojson";
import distance from "@turf/distance";
import { createSupplementaryPointsForCircle } from "../utils/createSupplementaryPoints";
import circle from "@turf/circle";
export function patchDirectSelect() {
  return {
    ...MapboxDraw.modes.direct_select,
    ...{
      dragFeature: function (
        this: DrawCustomModeThis,
        state: Record<string, any>,
        e: MapboxDraw.MapMouseEvent,
        delta: { lng: number; lat: number }
      ) {
        MapboxDraw.lib.moveFeatures(this.getSelected(), delta);
        this.getSelected()
          .filter((feature) => feature.properties!.isCircle)
          .map((circle) => circle.properties!.center)
          .forEach((center) => {
            center[0] += delta.lng;
            center[1] += delta.lat;
          });
        state.dragMoveLocation = e.lngLat;
      },
      dragVertex: function (
        state: Record<string, any>,
        e: MapMouseEvent,
        delta: { lng: number; lat: number }
      ) {
        if (state.feature.properties.isCircle) {
          const center = state.feature.properties.center;
          const movedVertex = [e.lngLat.lng, e.lngLat.lat];
          const radiusInKm = distance(center, movedVertex, {
            units: "kilometers",
          });
          const circleCoords = circle(center, radiusInKm, {
            steps: 60,
            units: "kilometers",
          }).geometry.coordinates;
          state.feature.incomingCoords(circleCoords);
          state.feature.properties.radiusInKm = radiusInKm;
        } else {
          const selectedCoords = state.selectedCoordPaths.map(
            (coord_path: string) => state.feature.getCoordinate(coord_path)
          );
          const selectedCoordPoints = selectedCoords.map((coords: string) => ({
            type: MapboxDraw.constants.geojsonTypes.FEATURE,
            properties: {},
            geometry: {
              type: MapboxDraw.constants.geojsonTypes.POINT,
              coordinates: coords,
            },
          }));

          const constrainedDelta = MapboxDraw.lib.constrainFeatureMovement(
            selectedCoordPoints,
            delta
          );
          for (let i = 0; i < selectedCoords.length; i++) {
            const coord = selectedCoords[i];
            state.feature.updateCoordinate(
              state.selectedCoordPaths[i],
              coord[0] + constrainedDelta.lng,
              coord[1] + constrainedDelta.lat
            );
          }
        }
      },

      toDisplayFeatures: function (
        this: DrawCustomModeThis & DirectModeSelect,
        state: Record<string, any>,
        geojson: Feature,
        display: (geojson: GeoJSON.GeoJSON) => void
      ) {
        if (state.featureId === geojson.properties!.id) {
          geojson.properties!.active = MapboxDraw.constants.activeStates.ACTIVE;
          const supplementaryPoints = state.feature.properties.isCircle
            ? createSupplementaryPointsForCircle(
                geojson as any,
                state.feature.properties
              )
            : MapboxDraw.lib.createSupplementaryPoints(geojson, {
                map: this.map,
                midpoints: true,
                selectedPaths: state.selectedCoordPaths,
              } as any);
          display(geojson);
          supplementaryPoints!.forEach(display);
        } else {
          geojson.properties!.active =
            MapboxDraw.constants.activeStates.INACTIVE;
          display(geojson);
        }
        this.fireActionable(state);
      },
    },
  };
}
