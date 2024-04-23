import MapboxDraw, { DrawCustomModeThis } from '@mapbox/mapbox-gl-draw';
import { createSupplementaryPointsForCircle } from '../utils/createSupplementaryPoints';
import { MapMouseEvent } from 'mapbox-gl';
import { Feature, Polygon } from 'geojson';
import { SimpleSelect, SimpleSelectState } from '../../types';

export function patchSimpleSelect() {
	return {
		...MapboxDraw.modes.simple_select,
		...{
			dragMove: function (
				this: DrawCustomModeThis & SimpleSelect,
				state: SimpleSelectState,
				e: MapMouseEvent
			) {
				// Dragging when drag move is enabled
				state.dragMoving = true;
				e.originalEvent.stopPropagation();

				const delta = {
					lng: e.lngLat.lng - state.dragMoveLocation!.lng,
					lat: e.lngLat.lat - state.dragMoveLocation!.lat,
				};

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

			toDisplayFeatures: function (
				this: DrawCustomModeThis & SimpleSelect,
				_state: Record<string, any>,
				geojson: Feature,
				display: (geojson: Feature) => void
			) {
				geojson.properties!.active = this.isSelected(
					geojson.properties!.id
				)
					? MapboxDraw.constants.activeStates.ACTIVE
					: MapboxDraw.constants.activeStates.INACTIVE;
				display(geojson);
				const featureProperties = this.getFeature(
					geojson.properties!.id
				).properties;
				this.fireActionable();
				if (
					geojson.properties!.active !==
						MapboxDraw.constants.activeStates.ACTIVE ||
					geojson.geometry.type ===
						MapboxDraw.constants.geojsonTypes.POINT
				) {
					return;
				}
				const supplementaryPoints = featureProperties!.isCircle
					? createSupplementaryPointsForCircle(
							geojson as Feature<Polygon>,
							featureProperties as any
						)
					: MapboxDraw.lib.createSupplementaryPoints(geojson);
				supplementaryPoints!.forEach(display);
			},
		},
	};
}
// module.exports = SimpleSelectModeOverride;
