import { memo, useCallback, useMemo } from 'react';
import useProjectMarqueeMotion from '../../../hooks/useProjectMarqueeMotion';

function toCssLength(value) {
  return typeof value === 'number' ? `${value}px` : (value ?? undefined);
}

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

function getItemTitle(item) {
  return item.title ?? item.alt ?? item.ariaLabel ?? undefined;
}

const ProjectMarquee = memo(function ProjectMarquee({
  items = [],
  speed = 120,
  direction = 'left',
  width = '100%',
  itemHeight = 28,
  gap = 32,
  pauseOnHover = false,
  pauseOnFocus = false,
  hoverSpeed,
  fadeOut = false,
  fadeOutLeftColor,
  fadeOutRightColor,
  scaleOnHover = false,
  isPaused = false,
  renderItem,
  ariaLabel = 'Project marquee',
  className,
  style,
}) {
  const measurementKey = useMemo(
    () => items.map((item, index) => item.id ?? item.src ?? item.title ?? index).join('|'),
    [items],
  );

  const {
    containerRef,
    trackRef,
    seqRef,
    copyCount,
    isVertical,
    handleMouseEnter,
    handleMouseLeave,
    handleFocusCapture,
    handleBlurCapture,
  } = useProjectMarqueeMotion({
    direction,
    speed,
    hoverSpeed,
    pauseOnHover,
    pauseOnFocus,
    isPaused,
    measurementKey,
  });

  const rootStyle = useMemo(() => ({
    width: toCssLength(width),
    '--project-marquee-gap': toCssLength(gap),
    '--project-marquee-itemHeight': toCssLength(itemHeight),
    '--project-marquee-fadeLeftColor': fadeOutLeftColor,
    '--project-marquee-fadeRightColor': fadeOutRightColor ?? fadeOutLeftColor,
    ...style,
  }), [fadeOutLeftColor, fadeOutRightColor, gap, itemHeight, style, width]);

  const renderMarqueeItem = useCallback((item, key, isDuplicate) => {
    const itemProps = isDuplicate
      ? { 'aria-hidden': 'true', 'data-project-marquee-duplicate': 'true' }
      : { 'data-project-marquee-primary': 'true' };

    if (renderItem) {
      return (
        <li key={key} className="project-marquee__item" {...itemProps}>
          <div className="project-marquee__node">{renderItem(item, key, isDuplicate)}</div>
        </li>
      );
    }

    const content = item.node ? (
      <span className="project-marquee__node">{item.node}</span>
    ) : (
      <img
        src={item.src}
        srcSet={item.srcSet}
        sizes={item.sizes}
        width={item.width}
        height={item.height}
        alt={item.alt ?? ''}
        loading="lazy"
        decoding="async"
      />
    );

    return (
      <li key={key} className="project-marquee__item" {...itemProps}>
        {item.href && !isDuplicate ? (
          <a className="project-marquee__link" href={item.href} title={getItemTitle(item)} aria-label={item.ariaLabel}>
            {content}
          </a>
        ) : content}
      </li>
    );
  }, [renderItem]);

  const lists = useMemo(() => (
    Array.from({ length: copyCount }, (_, copyIndex) => {
      const isDuplicate = copyIndex > 0;
      return (
        <ul
          key={copyIndex}
          ref={copyIndex === 0 ? seqRef : undefined}
          className="project-marquee__list"
          aria-hidden={isDuplicate ? 'true' : undefined}
        >
          {items.map((item, itemIndex) => renderMarqueeItem(
            item,
            `${copyIndex}-${item.id ?? item.src ?? item.title ?? itemIndex}`,
            isDuplicate,
          ))}
        </ul>
      );
    })
  ), [copyCount, items, renderMarqueeItem, seqRef]);

  return (
    <div
      ref={containerRef}
      className={cx(
        'project-marquee',
        isVertical && 'project-marquee--vertical',
        fadeOut && 'project-marquee--fade',
        scaleOnHover && 'project-marquee--scale-hover',
        className,
      )}
      style={rootStyle}
      role="region"
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusCapture={handleFocusCapture}
      onBlurCapture={handleBlurCapture}
    >
      <div ref={trackRef} className="project-marquee__track">
        {lists}
      </div>
    </div>
  );
});

export default ProjectMarquee;
