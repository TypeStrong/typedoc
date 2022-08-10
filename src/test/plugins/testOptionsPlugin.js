// eslint-disable-next-line @typescript-eslint/no-var-requires
const { ParameterType } = require('../../../');
exports.load = (app) => {
	app.options.addDeclaration({
		help: 'Test option parsing with default values from plugins',
		name: 'testOptions',
		type: ParameterType.Mixed,
		defaultValue: {
			foo: 'foo',
			bar: ['foo', 'bar']
		},
	});
}