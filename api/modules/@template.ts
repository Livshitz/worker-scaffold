import { libx } from 'libx.js/build/bundles/essentials.js';

export class Module {
	public constructor(public options?: Partial<ModuleOptions>) {
		this.options = { ...new ModuleOptions(), ...options };
		libx.log.d('Module:ctor');
	}

}

export class ModuleOptions {

}