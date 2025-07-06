import React, { useContext, useEffect } from 'react';
import { catigoryContext } from '../context/CarigruContext.jsx';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import '../style/catigory.css'; // Import the CSS file for styling

export default function Catigory() {
    let { allCatigory } = useContext(catigoryContext);
    const navigate = useNavigate(); // Initialize useNavigate

    // Optional: Fetch categories when the component mounts if not already fetched in context
    useEffect(() => {
        if (!allCatigory || allCatigory.length === 0) {
            // Assuming getSingleCatigories is meant to fetch all or you have another function
            // If getSingleCatigories fetches a single category, you might need an 'getAllCategories' in your context
            // For now, let's assume `allCatigory` is populated elsewhere or this component will not display categories if it's empty.
            // If `getSingleCatigories` can fetch all when called without an ID, use it.
            // Otherwise, make sure `allCatigory` is correctly populated by your context provider.
        }
    }, [allCatigory]); // Dependency array to prevent infinite loops

    const handleCategoryClick = async (categoryId) => {
        // Optional: If you need to fetch data for the single category before navigating
        // await getSingleCatigories(categoryId); 
        // Then navigate
        navigate(`/productOfCatigory/${categoryId}`);
    };

    return (
        <div className="container py-5"> {/* Added py-5 for vertical padding */}
            <h2 className="text-center mb-5">منتجاتنا</h2>
            <div className="row justify-content-center">
                {allCatigory && allCatigory.length > 0 ? ( // Ensure allCatigory is not null/undefined and has items
                    allCatigory.map((catigory) => (
                        <div key={catigory._id || catigory.id} className="col-md-4 col-sm-6 col-6 mb-4 d-flex justify-content-center">
                            <div 
                                className="category-circle d-flex align-items-center justify-content-center"
                                onClick={() => handleCategoryClick(catigory._id || catigory.id)} // Pass the ID to the handler
                            >
                                <img 
                                    src={catigory.image || `https://via.placeholder.com/150?text=${catigory.name}`} 
                                    alt={catigory.name} 
                                    className="category-image"
                                />
                                <div className="overlay"></div> {/* هنا الطبقة السوداء */}
                                <span className="category-name">{catigory.name}</span>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-12 text-center">
                        <p>جاري تحميل الفئات أو لا توجد فئات لعرضها...</p>
                    </div>
                )}
            </div>
        </div>
    );
}