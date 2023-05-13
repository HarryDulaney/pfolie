
export interface NewsPublisher {
    name: string;
    homepage_url: string;
    logo_url: string;
    favicon_url: string;
}

export interface NewsFeed {
    title: any;
    description: any;
    link: any;
    image: any;
    category: String | string[];
    items: NewsItem[];
    source: string;
    error?: any;
}

export interface ApiNewsFeed {
    count: number;
    results: NewsItem[];
    error?: any;
    status: string;
}
export interface NewsItem {
    id?: string;
    origin: 'polygon' | 'rssFeed';
    title: string;
    author: string;
    description?: string;
    category?: String | string[];
    published?: number;
    created?: number;
    content?: string;
    content_encoded?: string;
    keywords?: string[];
    media?: Media;
    link?: string | any[];
    enclosures?: Enclosures[];
    source?: string;
    publisher?: NewsPublisher;
    published_utc?: string;
    article_url?: string;
    tickers?: string[];
    amp_url?: string;
    image_url?: string;
}

export interface Enclosures {
    length?: string;
    type?: string;
    url?: string;
    medium?: string;
}

export interface Media {
    thumbnail: Thumbnail;
}
export interface Thumbnail {
    medium: string;
    url: string;
}

export class CleanedNewsItem {
    description = '';
    categories: string[] = [];
    tickers?: string[] = [];
    link: string | any = '';
    title = '';
    subTitle = '';
    featureImageUrl = '';
    publishedDate: Date;
    media: any;
    enclosures: any[] = [];
    showArticle = false;
    author = '';
    source = '';
}