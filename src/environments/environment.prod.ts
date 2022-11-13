export const environment = {
  production: true,
  APP_API_ROOT: 'https://coinetc.herokuapp.com/api',
  config: getConfig()

};


function getConfig() {
  let config;
  let request = new XMLHttpRequest();
  try {
    request.open('GET', 'https://coinetc.herokuapp.com/api/config', false);
    request.send(null);

    if (request.status === 200) {
      config = request.responseText;
    }

    return JSON.parse(config);
  } catch (e) {
    console.error('environment:getConfig: unable to get api key : ', e);
  }

  return config;
}
