import { useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import InputLabel from './InputLabel';


function InputTextArea({ id, label, value, onChange, minRows = 1, ...props }) {
    const ref = useRef(null);

    const syncHeight = useCallback(() => {
        const el = ref.current;
        if (!el) return;

        el.style.height = 'auto';

        const styles = window.getComputedStyle(el);
        const lineHeight = parseFloat(styles.lineHeight) || 20;
        const paddingTop = parseFloat(styles.paddingTop) || 0;
        const paddingBottom = parseFloat(styles.paddingBottom) || 0;

        const minHeight = lineHeight * minRows + paddingTop + paddingBottom;
        el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`;
    }, [minRows]);

    // Recalc when content changes
    useLayoutEffect(() => {
        syncHeight();
    }, [value, syncHeight]);

    // Recalc when wrapping changes (window/container resize)
    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Watch actual element size changes (best)
        let ro;
        if (typeof ResizeObserver !== 'undefined') {
            ro = new ResizeObserver(() => syncHeight());
            ro.observe(el);
        }

        // Fallback / extra safety
        const onWinResize = () => syncHeight();
        window.addEventListener('resize', onWinResize);

        return () => {
            window.removeEventListener('resize', onWinResize);
            if (ro) ro.disconnect();
        };
    }, [syncHeight]);

    const trimTrailingWhitespace = (s = '') => s.replace(/[ \t\r\n]+$/g, '');

    return (
        <div className="space-y-1">
            {label && (
                <InputLabel htmlFor={id}>
                    {label}
                </InputLabel>
            )}

            <textarea
                ref={ref}
                id={id}
                value={value}
                onChange={e => onChange(e.target.value)}
                onBlur={e => onChange(trimTrailingWhitespace(e.target.value))}
                rows={minRows}
                className="block w-full resize-none overflow-hidden rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-sky-500"
                {...props}
            />
        </div>
    );
}

export default InputTextArea;
