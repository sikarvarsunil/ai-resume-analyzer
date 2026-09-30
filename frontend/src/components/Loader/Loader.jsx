import './Loader.scss'

const Loader = ({ label = "Loading..." }) => (
    <div className="loader" role="status">
        <span className="loader__spinner" aria-hidden="true" />
        <span className="loader__label">{label}</span>
    </div>
)

export default Loader
