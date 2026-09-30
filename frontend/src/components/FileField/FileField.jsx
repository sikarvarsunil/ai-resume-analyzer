import { useId, useState } from 'react'
import '../FormField/FormField.scss'
import './FileField.scss'

const FileField = ({ label, hint, error, onFileChange, ...inputProps }) => {
    const id = useId()
    const hintId = `${id}-hint`
    const errorId = `${id}-error`
    const [fileName, setFileName] = useState("")

    const handleChange = (event) => {
        const file = event.target.files?.[0] ?? null
        setFileName(file?.name ?? "")
        onFileChange?.(file)
    }

    const classNames = [
        "file-field",
        fileName && "file-field--selected",
        error && "file-field--invalid"
    ].filter(Boolean).join(" ")

    return (
        <div className="form-field">
            <label htmlFor={id} className="form-field__label">{label}</label>
            <div className={classNames}>
                <input
                    id={id}
                    type="file"
                    className="file-field__input"
                    aria-invalid={error ? true : undefined}
                    aria-describedby={[hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined}
                    onChange={handleChange}
                    {...inputProps}
                />
                <span className="file-field__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                        <path d="M14 3v5h5M12 18v-6M9 15l3-3 3 3" />
                    </svg>
                </span>
                <span className="file-field__title">{fileName || "Click to upload or drag and drop"}</span>
                {hint && <span id={hintId} className="file-field__hint">{hint}</span>}
            </div>
            {error && <p id={errorId} className="form-field__error">{error}</p>}
        </div>
    )
}

export default FileField
