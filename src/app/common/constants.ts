export const CONSTANT = {
  FORMAT: {
    USD: '1.2-10',
    USD_SHORT: '1.2-2',
    BTC: '1.2-12',
    PERCENT: '1.1-3',
    PERCENT_DEC: '1.1-3',
    PERCENT_EX_LONG: '1.2-9',
    PERCENT_EX_SHORT: '1.2-2',
  },
  SCREEN_SIZE: {
    XS: 'XSmall',
    S: 'Small',
    M: 'Medium',
    L: 'Large',
    XL: 'XLarge',
    UNKNOWN: 'Unknown'
  }

};

export const GLOBAL_EVENT = {
  MOBILE_CHANGE: 'mobile-change'
}

export const TOOLTIP_OPTIONS = {
  tooltipPosition: 'left'

}

export const TOOLBAR = {
  NEW_COMPONENT: 'Add Component',
  RENAME: 'Rename',
  DELETE: 'Delete',
  OPEN: 'Open',
  SIDEBAR_RIGHT: 'Float Right',
  SIDEBAR_BOTTOM: 'Float Bottom',
  CURRENCY: {
    'usd': 'US Dollar'
  }

}

export const API_ROOTS = {
  COINGECKO: 'https://api.coingecko.com/api/v3',
  COIN_MARKET_CAP: 'https://pro-api.coinmarketcap.com'
};

export const RSS_FEEDS = {
  CoinTelegraph: 'https://cointelegraph.com/feed',
  CoinJournal: 'https://coinjournal.net/news/category/analysis/feed/'
};

export const FEED_SOURCES = [
  'CoinTelegraph',
  'CoinJournal'
]


export const API_ROUTES = {
  // Coin Gecko
  PING: "/ping",
  SEARCH_TRENDING: "/search/trending",
  COIN_LIST: "/coins/list",
  COIN_MARKET: "/coins/markets",
  COIN_TICKERS: "/coins/{id}/tickers",
  COIN_HISTORY: "/coins/{id}/history",
  COIN_MARKET_CHART: "/coins/{id}/market_chart",
  COIN_MARKET_CHART_RANGE: "/coins/{id}/market_chart/range",
  COIN_STATUS_UPDATES: "/coins/{id}/status_updates",
  COIN_OHLC: "/coins/{id}/ohlc",
  SIMPLE_PRICE: "/simple/price",
  SIMPLE_SUPPORTED_CURRENCIES: "/simple/supported_vs_currencies",
  SIMPLE_TOKEN_PRICE: "/simple/token_price/{id}",
  CONTRACT: "/coins/{id}/contract/{contract_address}",
  CONTRACT_MARKET_CHART: "/coins/{id}/contract/{contract_address}/market_chart",
  CONTRACT_MARKET_CHART_RANGE: "/coins/{id}/contract/{contract_address}/market_chart/range",
  EXCHANGES: "/exchanges",
  EXCHANGE_LIST: "/exchanges/list",
  EXCHANGE_ID: "/exchanges/{id}",
  EXCHANGE_ID_TICKER: "/exchanges/{id}/tickers",
  EXCHANGE_ID_STATUS_UPDATES: "/exchanges/{id}/status_updates",
  EXCHANGE_ID_VOL_CHART: "/exchanges/{id}/volume_chart",
  FINANCE_PLATFORM: "/finance_platforms",
  FINANCE_PRODUCT: "/finance_products",
  INDEXES: "/indexes",
  INDEXES_LIST: "/indexes/list",
  INDEXES_MARKET_ID: "/indexes/{market_id}/{id}",
  INDEXES_LIST_MARKET_AND_ID: "/indexes/list_by_market_and_id/{market_id}/{id}",
  DERIVATIVES: "/derivatives",
  DERIVATIVES_EXCHANGES: "/derivatives/exchanges",
  DERIVATIVES_EXCHANGES_ID: "/derivatives/exchanges/{id}",
  DERIVATIVES_EXCHANGES_LIST: "/derivatives/exchanges/list",
  STATUS_UPDATES: "/status_updates",
  EVENTS: "/events",
  EVENTS_COUNTRIES: "/events/countries",
  EVENTS_TYPES: "/events/types",
  EXCHANGE_RATES: "/exchange_rates",
  GLOBAL: "/global",
  GLOBAL_DEFI: "/global/decentralized_finance_defi"
  // CoinMarketCap

}

export const SHOW = 'show';
export const HIDE = 'hide';
export const CLICKED = 'clicked';


export declare type PLATFORMS = 'ethereum' | 'tron';