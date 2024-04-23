import { patchDirectSelect } from './directSelect';
import { patchSimpleSelect } from './simpleSelect';

export function withCircleSupport(mode: 'simple_select' | 'direct_select') {
	switch (mode) {
		case 'direct_select': return patchDirectSelect();
		case 'simple_select': return patchSimpleSelect();
		default: throw new Error(`mode ${mode} not supported! Choose direct_select eather simpe_select`)
	}
}
