
<div align="center">
  <a href="https://github.com/harrydulaney/pfolie">
    <img src="img/pfolie-logo-1-white.png" alt="Logo" width="120" height="80">
  </a>
</div>
<div align="center">

### **[Pfolie.com](https://pfolie.com) is a suite of web-based investment and financial portfolio tools. Pfolie provides a portal for investors to interact with real-time data about financial markets through a flexible next generation analytics dashboard. The current focus is on cryptocurrency price and market sentiment but tools for traditional financial markets are in development.**

</div>

----
## **Build With:**
- #### Angular 15+
- #### Node.js
- #### Express.js
- #### PostgreSQL
- #### Firebase
- #### CoinGecko API
- #### Highcharts
- #### Chart.js
____
## **Features:**
 - #### Watchlist and asset tracking
 - #### Portfolio tracking with visual insights 
 - #### Quick search individual asset and market data
 - #### Real-Time view of asset prices
 - #### Market and Exchange snapshots
 - #### News from multiple sources
 - #### Article reader
____
### **Beautiful Analytics Dashboard** ![](.attachments/images/readme-pic-1.png)
----
### **Quick Search** ![](.attachments/images/readme-pic-quick-search.png)

----
### **Real-Time Price and Market data** ![](.attachments/images/readme-pic-3.png)
----
### **Historical Price and asset metadata**
----

### **Create a Watchlist and Track Assets**
----
 ## **Build and Track your Portfolio** 
 ### **Build** 
### **Track**

### **Your Portfolio** 

----

## Aggregated Market News and Sentiment
### Multiple News Sources ![](.attachments/images/readme-news.png)
----
## License

<a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/3.0/"><img alt="Creative Commons License" style="border-width:0" src="https://i.creativecommons.org/l/by-nc-nd/3.0/88x31.png" /></a><br />This work is licensed under a <a rel="license" href="http://creativecommons.org/licenses/by-nc-nd/3.0/">Creative Commons Attribution-NonCommercial-NoDerivs 3.0 Unported License</a>.

----

## **Development**:
### **Requiements**:
- **Angular 15+ (to support standalone components)**
- **Create the following files:**
  - **API env varibles file**:
    - **../api/.env**
      - **APP_API_ROOT**=http://localhost:8080/api
      - **DATABASE_URL**={postgres-sql-connection-string}
      - **CORS_CONFIG**=https://coinetc.herokuapp.com,https://pfolie.com,https://www.pfolie.com
      - **CORS_CONFIG_LOCAL**=http://localhost:4200,http://localhost:8080
  - **The front-end env variable file:** 
    - **Create your own or reach out the project owners for dev env variables**
    - **./.env (in project root)**
      - **NG_APP_FB_API_KEY**=
      - **NG_APP_FB_AUTH_DOMAIN**=
      - **NG_APP_FB_DATABASE_URL**=
      - **NG_APP_FB_PROJECT_ID**=
      - **NG_APP_FB_STORAGE_BUCKET**=
      - **NG_APP_FB_MESSAGING_SENDER_ID**=
      - **NG_APP_FB_APP_ID**=
      - **NG_APP_FB_MEASUREMENT_ID**=
      - **NG_APP_CG_API_KEY**=
## **Run Local (Starts API and Front-end)**
 - **npm run start:local:all**


