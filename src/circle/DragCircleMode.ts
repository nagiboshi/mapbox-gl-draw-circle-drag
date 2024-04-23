import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { MapMouseEvent } from 'mapbox-gl';
import circle from '@turf/circle';
import distance from '@turf/distance';
import dragPan from './utils/dragPan';
const DragCircleMode: any = {
	onSetup() {
		const circle = this.newFeature({
			type: MapboxDraw.constants.geojsonTypes.FEATURE,
			properties: {
				isCircle: true,
				center: [],
			},
			geometry: {
				type: MapboxDraw.constants.geojsonTypes.POLYGON,
				coordinates: [[]],
			},
		});

		this.addFeature(circle);
		this.clearSelectedFeatures();
		dragPan.disable(this);
		MapboxDraw.lib.doubleClickZoom.disable(this);
		this.updateUIClasses({ mouse: MapboxDraw.constants.cursors.ADD });
		this.setActionableState({
			trash: true,
		});
		return {
			circle,
			currentVertexPosition: 0,
		};
	},

	onClick(state: Record<string, any>, _e: MapMouseEvent) {
		// don't draw the circle if its a tap or click event
		state.circle.properties.center = [];
	},

	onMouseDown(state: Record<string, any>, e: MapMouseEvent) {
		e.preventDefault();
		const currentCenter = state.circle.properties.center;
		if (currentCenter.length === 0) {
			state.circle.properties.center = [e.lngLat.lng, e.lngLat.lat];
		}
	},
	onDrag(state: Record<string, any>, e: MapMouseEvent) {
		const center = state.circle.properties.center;
		if (center.length > 0) {
		
			const distanceInKm = distance(
				center,
				[e.lngLat.lng, e.lngLat.lat],
				{ units: 'kilometers' }
			);
			const circleCoords = circle(center, distanceInKm, {
				steps: 60,
				units: 'kilometers',
			});
			state.circle.incomingCoords(circleCoords.geometry.coordinates);
			state.circle.properties.radiusInKm = distanceInKm;
		}
	},
	onStop(state: Record<string, any>) {
		this.updateUIClasses({ mouse: MapboxDraw.constants.cursors.NONE });

		if (!this.getFeature(state.circle.id)) {
			return;
		}

		if (state.circle.isValid()) {
			this.map.fire(MapboxDraw.constants.events.CREATE, {
				features: [state.circle.toGeoJSON()],
			});
			return;
		}

		this.deleteFeature([state.circle.id], { silent: true });
		this.changeMode(
			MapboxDraw.constants.modes.SIMPLE_SELECT,
			{},
			{ silent: true }
		);
	},

	onMouseUp(state: Record<string, any>, _e: any) {
		this.updateUIClasses({ mouse: MapboxDraw.constants.cursors.POINTER });
		this.changeMode(MapboxDraw.constants.modes.SIMPLE_SELECT, {
			featuresId: state.circle.id,
		});
	},

	toDisplayFeatures(
		state: Record<string, any>,
		geojson: any,
		display: (geoJSON: GeoJSON.GeoJSON) => void
	) {
		const isActivePolygon = geojson.properties.id === state.circle.id;
		geojson.properties.active = isActivePolygon.toString();
		if (!isActivePolygon) {
			display(geojson);
			return;
		}

		if (state.circle.properties.center.length != 0) {
			display(geojson);
		}
	},
};

export default DragCircleMode;
