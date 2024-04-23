import { Polygon, Feature, Point } from 'geojson';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
export function createSupplementaryPointsForCircle(
	geojson: Feature<Polygon>,
	circleFeatureProperties: Record<string, any>
): Array<Feature<Point>> | null {
	const { geometry } = geojson;

	if (!circleFeatureProperties || !circleFeatureProperties.isCircle)
		return null;
	const supplementaryPoints = [];
	const vertices = geometry.coordinates[0].slice(0, -1);
	for (
		let index = 0;
		index < vertices.length;
		index += Math.round(vertices.length / 4)
	) {
		supplementaryPoints.push(
			MapboxDraw.lib.createVertex(
				geojson.properties!.id,
				vertices[index],
				`0.${index}`,
				false
			)
		);
	}
	return supplementaryPoints;
}
