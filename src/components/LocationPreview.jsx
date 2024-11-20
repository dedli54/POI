import React from 'react';

const LocationPreview = ({ latitude, longitude, onClose }) => {
    const API_KEY = 'AIzaSyDF7DCgvnT9TyS-eWpm46d1wejbNCKdEyE'; // Free API key for school project
    const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${latitude},${longitude}&zoom=15&size=300x200&markers=color:red%7C${latitude},${longitude}&key=${API_KEY}`;

    return (
        <div className="locationPreview">
            <button className="closePreview" onClick={onClose}>×</button>
            <img src={mapUrl} alt="Location Preview" />
            <p>Vista previa de la ubicación</p>
        </div>
    );
};

export default LocationPreview;