
<div align="center">
  <a href="https://github.com/harrydulaney/pfolie">
    <img src="img/pfolie-logo-1-white.png" alt="Logo" width="180" height="115">
  </a>
</div>

<div align="center">
  
### Pfolie is a suite of web-based investment and financial portfolio tools. Pfolie provides a portal for investors to interact with real-time data about financial markets through a flexible next generation analytics dashboard. The current focus is on cryptocurrency price and market sentiment but tools for traditional financial markets are in development.**
</div>

![](.attachments/images/readme-pic-1.png)
 
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

<div align="center">

### **Beautiful analytics dashboard**
![](.attachments/images/readme-pic-1.png)

![](.attachments/images/top-crypto-by-market-cap.png)

![](.attachments/images/top-trending.png)
----
### **Quick Search** ![](.attachments/images/readme-pic-quick-search.png)

----
### **Real-Time price and volume charts** 
![](.attachments/images/readme-pic-3.png)

![](.attachments/images/volume-charts.png)
----

#### Full Screen Price +  Volume Charts + Market Share Charts
![](.attachments/images/Full-screen-price-charts.png)

![](.attachments/images/Full-screen-market-charts.png)
----

### **Create multiple watchlists**
![](.attachments/images/watch-list-preview.png)
----
 ## **Build and track your portfolio** 
 ![](.attachments/images/build-your-portfolio.png)

 ![](.attachments/images/build-your-portfolio-action.png)

 ![](.attachments/images/edit-transations.png)

----
 ## **Manage multiple portfolios** 
  ![](.attachments/images/multiple-portfolios.png)

  ----

 ## **Awesome mobile experience** 

 </div>
 <div align="center">
    <img src="./.attachments/images/mobile-friendly.png" width="210" height="340">
    <img src="./.attachments/images/mobile-friendly.png" width="210" height="340">
    <img src="./.attachments/images/mobile-friendly.png" width="210" height="340">
</div>

----
### Trending articles multiple news sources
![](.attachments/images/readme-news.png)
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
