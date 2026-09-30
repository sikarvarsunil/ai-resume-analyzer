import { useId } from 'react'
import './FormField.scss'

const FormField = ({ label, hint, error, as: Control = "input", ...controlProps }) => {
    const id = useId()
    const hintId = `${id}-hint`
    const errorId = `${id}-error`
    const describedBy = [hint && hintId, error && errorId].filter(Boolean).join(" ") || undefined

    return (
        <div className="form-field">
            <label htmlFor={id} className="form-field__label">{label}</label>
            <Control
                id={id}
                className="form-field__control"
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                {...controlProps}
            />
            {hint && <p id={hintId} className="form-field__hint">{hint}</p>}
            {error && <p id={errorId} className="form-field__error">{error}</p>}
        </div>
    )
}

export default FormField
