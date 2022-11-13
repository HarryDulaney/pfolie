export const environment = {
  production: false,
  APP_API_ROOT: 'http://localhost:8080/api',
  config: getConfig(),
};

function getConfig() {
  let config;
  let request = new XMLHttpRequest();
  try {
    request.open('GET', 'http://localhost:8080/api/config', false);
    request.send(null);

    if (request.status === 200) {
      config = request.responseText;
    }

    return JSON.parse(config);
  } catch (e) {
    console.error('environment:getConfig: unable to get api key : ', e);
  }
}
