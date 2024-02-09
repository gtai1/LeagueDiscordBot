import * as Pino from 'pino';

export default Pino.pino({
	transport: {
		target: 'pino-pretty',
		options: {
			colorize: true,
			ignore: 'pid,hostname',
			translateTime: 'SYS:standard',
			destination: 'logs.log',
		},
	},
});
