define([], function () {
	var config = {};

	config.services = [
		{
			name: 'Local',
			url: 'http://epibeta.jnj.com:8080/WebAPI/'
    }
	];

	config.webAPIRoot = config.services[0].url;
	// config.rServicesHost = 'http://localhost:8081/';
	config.cohortComparisonResultsEnabled = false;
	config.userAuthenticationEnabled = false;

	return config;
});