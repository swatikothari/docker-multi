import React from 'react';
import { Link } from 'react-router-dom';

const OtherPage = () => {
    return (
        <div>
            Other page
            <Link to="/"> Go back </Link>
        </div>
    )
}

export default OtherPage;