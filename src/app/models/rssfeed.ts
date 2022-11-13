import { SafeHtml } from "@angular/platform-browser";

export interface RssFeed {
    title: any;
    description: any;
    link: any;
    image: any;
    category: String | string[];
    items: FeedItem[];
    source: string;
    error?:any;
}

export interface FeedItem {
    title: string;
    author: string;
    description?: string;
    category?: String | string[];
    published: number;
    created: number;
    content?: string;
    content_encoded?: string;
    media?: Media;
    link: string | any[];
    enclosures?: Enclosures[];
    source: string;
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

export class ParsedFeedItem {
    htmlContent!: SafeHtml;
    description = '';
    categories: string[] = [];
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