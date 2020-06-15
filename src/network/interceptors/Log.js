const DEBUG = __DEV__;

export function requestLog(config) {
	if (DEBUG) {
		console.log(`>>> ${config.method}: ${config.url}`);
		if (config.data) {
			console.log('>>>data', config.data);
		}
		if (config.params) {
			console.log('>>>params', config.params);
		}
		if (config.headers) {
			console.log(config.headers);
		}
	}
	return config;
}

export function requestError(error) {
	if (DEBUG) {
		console.log(error);
	}
	return Promise.reject(error);
}

export function responseLog(response) {
	if (DEBUG) {
		const config = response.config;
		console.log(`<<< ${response.status} ${config.method}: ${config.url}`);
		console.log(response);
	}
	return response;
}

export function responseError(error) {
	if (DEBUG) {
		const config = error.config;
		const response = error.response;
		if (response) {
			console.log(`<<< ${response.status} ${config.method}: ${config.url}`);
			console.log(response);
		} else {
			console.log(`<<< ${config.method}: ${config.url}`);
			console.log('network log error', error);
		}
	}
	return Promise.reject(error);
}