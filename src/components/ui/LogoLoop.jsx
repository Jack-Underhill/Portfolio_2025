import { memo, useCallback, useMemo } from 'react';
import useLogoLoopMotion from '../../hooks/useLogoLoopMotion';

function toCssLength(value) {
  return typeof value === 'number' ? `${value}px` : (value ?? undefined);
}

function cx(...parts) {
  return parts.filter(Boolean).join(' ');
}

function getLogoTitle(item) {
  return item.title ?? item.alt ?? item.ariaLabel ?? undefined;
}

const LogoLoop = memo(function LogoLoop({
  logos = [],
  speed = 120,
  direction = 'left',
  width = '100%',
  logoHeight = 28,
  gap = 32,
  pauseOnHover = false,
  hoverSpeed,
  fadeOut = false,
  fadeOutColor,
  scaleOnHover = false,
  renderItem,
  ariaLabel = 'Logo carousel',
  className,
  style,
}) {
  const measurementKey = useMemo(
    () => logos.map((item, index) => item.id ?? item.src ?? item.title ?? index).join('|'),
    [logos],
  );

  const {
    containerRef,
    trackRef,
    seqRef,
    copyCount,
    isVertical,
    handleMouseEnter,
    handleMouseLeave,
  } = useLogoLoopMotion({
    direction,
    speed,
    hoverSpeed,
    pauseOnHover,
    measurementKey,
  });

  const rootStyle = useMemo(() => ({
    width: toCssLength(width),
    '--logoloop-gap': toCssLength(gap),
    '--logoloop-logoHeight': toCssLength(logoHeight),
    '--logoloop-fadeColor': fadeOutColor,
    ...style,
  }), [fadeOutColor, gap, logoHeight, style, width]);

  const renderLogoItem = useCallback((item, key, isDuplicate) => {
    const itemProps = isDuplicate ? { 'aria-hidden': 'true', inert: '' } : {};

    if (renderItem) {
      return (
        <li key={key} className="logoloop__item" {...itemProps}>
          <div className="logoloop__node">{renderItem(item, key)}</div>
        </li>
      );
    }

    const content = item.node ? (
      <span className="logoloop__node">{item.node}</span>
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
      <li key={key} className="logoloop__item" {...itemProps}>
        {item.href && !isDuplicate ? (
          <a className="logoloop__link" href={item.href} title={getLogoTitle(item)} aria-label={item.ariaLabel}>
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
          className="logoloop__list"
          aria-hidden={isDuplicate ? 'true' : undefined}
          inert={isDuplicate ? '' : undefined}
        >
          {logos.map((item, itemIndex) => renderLogoItem(
            item,
            `${copyIndex}-${item.id ?? item.src ?? item.title ?? itemIndex}`,
            isDuplicate,
          ))}
        </ul>
      );
    })
  ), [copyCount, logos, renderLogoItem, seqRef]);

  return (
    <div
      ref={containerRef}
      className={cx(
        'logoloop',
        isVertical && 'logoloop--vertical',
        fadeOut && 'logoloop--fade',
        scaleOnHover && 'logoloop--scale-hover',
        className,
      )}
      style={rootStyle}
      role="region"
      aria-label={ariaLabel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div ref={trackRef} className="logoloop__track">
        {lists}
      </div>
    </div>
  );
});

export default LogoLoop;
