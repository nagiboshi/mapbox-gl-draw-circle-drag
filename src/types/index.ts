import { DrawCustomMode, MapMouseEvent } from '@mapbox/mapbox-gl-draw';
import { StringSet } from '@mapbox/mapbox-gl-draw';
export type DirectModeSelect = {
	fireUpdate: () => void;
	fireActionable: (state: Record<string, any>) => void;
	startDragging: (state: Record<string, any>, e: MapMouseEvent) => void;
	stopDragging: (state: Record<string, any>) => void;
	onVertex: (state: Record<string, any>) => void;
	onMidpoint: (state: Record<string, any>) => void;
	pathsToCoordinates: (
		featureId: string,
		paths: Array<string>
	) => Array<{ featureId: string; coord_path: string }>;
	onFeature: (state: Record<string, any>, e: MapMouseEvent) => void;
	dragFeature: (
		state: Record<string, any>,
		e: MapMouseEvent,
		delta: { lng: number; lat: number }
	) => void;
	dragVertex: (
		state: Record<string, any>,
		e: MapMouseEvent,
		delta: { lng: number; lat: number }
	) => void;
	clickNoTarget: () => void;
	clickInactive: () => void;
	clickActiveFeature: (state: Record<string, any>) => void;
} & DrawCustomMode;

export type SimpleSelect = {
	fireUpdate: () => void;
	fireActionable: () => void;
	getUniqueIds: (features: GeoJSON.GeoJSON) => StringSet;
	stopExtendedInteractions: (state: SimpleSelectState) => void;
	clickAnywhere: (state: SimpleSelectState) => void;
	clickOnVertex: (state: Record<string, any>, e: MapMouseEvent) => void;
	startOnActiveFeature: (state: SimpleSelectState, e: MapMouseEvent) => void;
	clickOnFeature: (state: SimpleSelectState, e: MapMouseEvent) => void;
	startBoxSelect: (state: SimpleSelectState, e: MapMouseEvent) => void;
	whileBoxSelect: (state: SimpleSelectState, e: MapMouseEvent) => void;
	dragMove: (state: SimpleSelectState, e: MapMouseEvent) => void;
} & DrawCustomMode<SimpleSelectState>;

type FeatureId = string;

export type SimpleSelectState = {
	dragMoveLocation: null | { lng: number; lat: number };
	boxSelectStartLocation: MouseEvent | null;
	boxSelectElement: undefined;
	boxSelecting: boolean;
	canBoxSelect: boolean;
	dragMoving: boolean;
	canDragMove: boolean;
	initiallySelectedFeatureIds: Array<FeatureId>[];
};
