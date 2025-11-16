function InputLabel({ htmlFor, children }) {
    return (
        <label
            htmlFor={htmlFor}
            className="block text-xs font-semibold text-slate-300 mb-1"
        >
            {children}
        </label>
    );
}

export default InputLabel;
