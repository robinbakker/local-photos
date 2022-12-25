import { hydrate } from 'preact-iso';
import ImageList from './imageList.js';
import swURL from 'sw:./sw.js';

if (typeof navigator !== 'undefined') {
	navigator.serviceWorker.register(swURL);
}

function App() {
	return <ImageList></ImageList>;
}

hydrate(<App />);

export const prerender = async (data) =>
	(await import('preact-iso/prerender')).default(<App {...data} />);
