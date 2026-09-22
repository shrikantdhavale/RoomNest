function CategoryCard({
    icon,
    title,
    description,
    count,
    className
}) {

    return (
        <div className={`category-card ${className}`}>

            <div className="category-top">

                <div className="category-icon">
                    {icon}
                </div>

                <span className="category-arrow">
                    ↗
                </span>

            </div>

            <div className="category-info">

                <span className="category-count">
                    {count} places
                </span>

                <h3>{title}</h3>

                <p>{description}</p>

            </div>

        </div>
    );
}

export default CategoryCard;