import { adminUi } from '../../styles/recipes';

function ImagePreview({ file, url, alt, isFixedSize = false }) {
    const src = file ? URL.createObjectURL(file) : url;

    const cn = isFixedSize ? 
        `mt-2 h-32 w-32 rounded-md object-cover ${adminUi.imageBorder}` : 
        `relative z-10 w-full h-auto aspect-video object-cover rounded-xl ${adminUi.imageBorder}`;

    if (!src) return null;

    return (
        <img
            src={src}
            alt={alt}
            className={cn}
        />
    );
}

export default ImagePreview;
