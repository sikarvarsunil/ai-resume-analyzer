const SubmitButton = ({ children, isLoading = false, loadingText, className = "" }) => (
    <button
        type="submit"
        className={`button button--primary ${className}`.trim()}
        disabled={isLoading}
        aria-busy={isLoading}
    >
        {isLoading && <span className="button__spinner" aria-hidden="true" />}
        {isLoading ? loadingText : children}
    </button>
)

export default SubmitButton
