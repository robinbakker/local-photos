import {
	pageCache,
	staticResourceCache,
	offlineFallback,
} from 'workbox-recipes';
pageCache();
staticResourceCache();
offlineFallback();
