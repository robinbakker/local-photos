import { useState } from 'preact/hooks';
import styles from './imageList.module.css';

const DisplayTypeNone = 0;
const DisplayTypeViewer = 1;
const DisplayTypeSlideShow = 2;

export default function ImageList() {
	const [imageList, setImageList] = useState([]);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [displayType, setDisplayType] = useState(DisplayTypeNone);
	const [slideShowTimer, setSlideShowTimer] = useState();
	const imageMimeTypes = [
		'image/jpeg',
		'image/png',
		'image/webp',
		'image/avif',
		'image/gif',
		'image/apng',
		'image/svg+xml',
	];
	const secondsPerSlide = 6;

	const onClickNext = () => {
		goNextSlide(1);
	};

	const onClickPrevious = () => {
		goNextSlide(-1);
	};

	const goNextSlide = (offset, isSlideShowActive) => {
		let newIndex = activeIndex + offset;
		const imageCount = imageList.length;
		setActiveIndex((activeIndex) => {
			newIndex = activeIndex + offset;
			if (newIndex >= imageCount - 1) {
				newIndex = 0;
			} else if (newIndex < 0) {
				newIndex = imageCount - 1;
			}
			return newIndex;
		});
		if (!isSlideShowActive) {
			window.location.href = `#img-${newIndex}`;
		}
	};

	const onClickOpenDir = async () => {
		const dirHandle = await window.showDirectoryPicker({
			mode: 'read',
		});
		const promises = [];
		const newImageList = [];
		for await (const entry of dirHandle.values()) {
			if (entry.kind !== 'file') {
				continue;
			}
			promises.push(
				entry.getFile().then(async (file) => {
					if (imageMimeTypes.indexOf(file.type) !== -1) {
						newImageList.push({
							name: file.name,
							src: URL.createObjectURL(file),
							lastModified: file.lastModified,
						});
					}
				})
			);
		}
		await Promise.all(promises);
		setImageList(
			newImageList.sort((a, b) => {
				if (a.lastModified < b.lastModified) {
					return -1;
				}
				if (a.lastModified > b.lastModified) {
					return 1;
				}
				return 0;
			})
		);
		document.body.addEventListener('keyup', (event) => {
			switch (event.key) {
				case 'ArrowLeft':
					onClickPrevious();
					break;
				case 'ArrowRight':
					onClickNext();
					break;
				case 'Escape':
					clearInterval(slideShowTimer);
					setDisplayType(DisplayTypeNone);
					break;
			}
		});
	};

	const onImageClick = (index) => {
		setDisplayType(DisplayTypeViewer);
		setActiveIndex(index);
	};

	const onClickSlideShow = () => {
		clearInterval(slideShowTimer);
		const dt =
			displayType == DisplayTypeSlideShow
				? DisplayTypeViewer
				: DisplayTypeSlideShow;
		setDisplayType((displayType) => (displayType = dt));
		if (dt === DisplayTypeSlideShow) {
			const timer = setInterval(
				() => goNextSlide(1, true),
				secondsPerSlide * 1000
			);
			setSlideShowTimer((slideShowTimer) => (slideShowTimer = timer));
		}
	};

	const onClickClose = () => {
		clearInterval(slideShowTimer);
		setDisplayType(DisplayTypeNone);
	};

	const getDisplayTypeCssClass = () => {
		if (displayType === DisplayTypeNone) return styles.photoList;
		const classes = [styles.viewer];
		if (displayType === DisplayTypeSlideShow) classes.push(styles.slideShow);
		return classes.join(' ');
	};

	return (
		<main class={getDisplayTypeCssClass()}>
			{!imageList.length && (
				<>
					<button
						onClick={onClickOpenDir}
						type="button"
						class={styles.folder}
						title="Open folder"
					>
						<svg
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 32 32"
						>
							<path
								d="M16.833 10H25c1.149 0 2 .851 2 2v1L14 23.5 2.61 28.23C2.22 27.63 2 26.773 2 26V8.08A2.08 2.08 0 0 1 4.08 6h6.675c.809 0 1.585.32 2.158.89l2.453 2.498c.39.387.918.612 1.467.612Z"
								fill="#FFB02E"
							/>
							<path
								d="M27.911 13H10.886a3.68 3.68 0 0 0-3.463 2.439C2.832 28.604 3.211 27.658 3.095 27.806a.548.548 0 0 1-.453.25.35.35 0 0 1-.182-.054 3.783 3.783 0 0 0 3.585 2h17.952a2.033 2.033 0 0 0 1.939-1.453l3.962-12.835A2.086 2.086 0 0 0 27.911 13Z"
								fill="#FCD53F"
							/>
						</svg>
					</button>
					<h1>local-photos</h1>
				</>
			)}
			<input type="checkbox" id="about" class={styles.aboutCheck} />
			<label for="about" class={styles.about} title="About">
				About
			</label>
			<p class={styles.aboutText}>
				You can use this web app to view photos from a local folder on your
				computer. Just click the folder to browse for a local folder. Then you
				can view photos one-by-one or run as slide show.
				<br />
				Created by{' '}
				<a href="https://robinbakker.nl" target="_blank" rel="noopener">
					robinbakker.nl
				</a>
			</p>
			{!!imageList.length && (
				<>
					<button
						type="button"
						class={styles.closeButton}
						onClick={onClickClose}
						title="Close"
					>
						Close
					</button>
					<button
						type="button"
						class={styles.slideShowButton}
						onClick={onClickSlideShow}
						title="Slideshow"
					>
						Slideshow
					</button>
					<ul class={styles.imageList}>
						{imageList.map((img, index) => {
							return (
								<li
									id={'img-' + index}
									class={`${activeIndex === index ? styles.isActive : ''} ${
										activeIndex - 1 === index ? styles.wasActive : ''
									}`.trim()}
								>
									<a href={'#img-' + index} onClick={() => onImageClick(index)}>
										<img
											class={styles.blurredImg}
											src={img.src}
											alt={`${img.name} (blurred)`}
										/>
										<img class={styles.mainImg} src={img.src} alt={img.name} />
									</a>
								</li>
							);
						})}
					</ul>
					{displayType !== DisplayTypeNone && (
						<>
							<button class={styles.prev} onClick={onClickPrevious}>
								Previous
							</button>
							<button class={styles.next} onClick={onClickNext}>
								Next
							</button>
						</>
					)}
				</>
			)}
		</main>
	);
}
